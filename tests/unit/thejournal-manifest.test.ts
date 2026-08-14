import { describe, expect, it } from "vitest";
import {
  buildJournalManifest,
  filterPublishedJournalEntries,
  measureReadTime,
  resolveJournalContext,
  type JournalManifestSourceEntry,
} from "@content/processors/thejournal-manifest";
import type { ImageMetadata } from "astro";
import { isNestedGroup } from "@appTypes/content_context";

const image = {
  src: "/fixtures/article.jpg",
  width: 1200,
  height: 630,
  format: "jpg",
} as ImageMetadata;

const date = new Date("2026-01-01T00:00:00Z");

function entry(
  id: string,
  filepath: string,
  overrides: Partial<JournalManifestSourceEntry["data"]> = {},
  body = "A short article body.",
): JournalManifestSourceEntry {
  return {
    id,
    filePath: `/workspace/src/thejournal/${filepath}`,
    body,
    data: {
      title: id,
      description: `${id} description`,
      pubDate: date,
      tags: [],
      order: 100,
      ...overrides,
    },
  };
}

describe("thejournal manifest builder", () => {
  it("keeps entries published when draft is missing or false", () => {
    const [entries] = buildJournalManifest([
      entry("missing-draft", "missing-draft.mdx", { image }),
      entry("false-draft", "false-draft.mdx", { image, draft: false }),
    ]);

    expect(entries["missing-draft"]).toBeDefined();
    expect(entries["false-draft"]).toBeDefined();
  });

  it("filters draft standalone entries from static entries and manifests", () => {
    const sourceEntries = [
      entry("published", "published.mdx", { image }),
      entry("draft-entry", "draft-entry.mdx", { image, draft: true }),
    ];

    const publishedEntries = filterPublishedJournalEntries(sourceEntries);
    const [entries, vaults] = buildJournalManifest(sourceEntries);
    const [resolvedEntry, resolvedVault] = resolveJournalContext(
      "/thejournal/draft-entry/",
      entries,
      vaults,
    );

    expect(publishedEntries.map((entry) => entry.id)).toEqual(["published"]);
    expect(entries["published"]).toBeDefined();
    expect(entries["draft-entry"]).toBeUndefined();
    expect(resolvedEntry).toBeNull();
    expect(resolvedVault).toBeNull();
  });

  it("filters an entire vault when the root index is draft", () => {
    const [entries, vaults] = buildJournalManifest([
      entry("draft-vault", "draft-vault/index.md", { image, draft: true }),
      entry("draft-vault/child", "draft-vault/child.mdx"),
      entry("draft-vault/section", "draft-vault/section/index.mdx"),
      entry("draft-vault/section/deep", "draft-vault/section/deep.mdx"),
      entry("draft-vaultish", "draft-vaultish.mdx", { image }),
    ]);

    expect(vaults["draft-vault"]).toBeUndefined();
    expect(entries["draft-vault"]).toBeUndefined();
    expect(entries["draft-vault/child"]).toBeUndefined();
    expect(entries["draft-vault/section"]).toBeUndefined();
    expect(entries["draft-vault/section/deep"]).toBeUndefined();
    expect(entries["draft-vaultish"]).toBeDefined();
  });

  it("filters a draft nested section and descendants while preserving siblings", () => {
    const [entries, vaults] = buildJournalManifest([
      entry("vault", "vault/index.mdx", { image }),
      entry("vault/intro", "vault/intro.mdx", { order: 10 }),
      entry("vault/section", "vault/section/index.mdx", {
        order: 20,
        draft: true,
      }),
      entry("vault/section/deep", "vault/section/deep.mdx", { order: 1 }),
      entry("vault/sectional", "vault/sectional.mdx", { order: 30 }),
    ]);

    expect(entries["vault/section"]).toBeUndefined();
    expect(entries["vault/section/deep"]).toBeUndefined();
    expect(entries["vault/sectional"]).toBeDefined();
    expect(vaults["vault"]?.itemCount).toBe(3);

    const [resolvedEntry, resolvedVault] = resolveJournalContext(
      "/thejournal/vault/section/deep/",
      entries,
      vaults,
    );

    expect(resolvedEntry).toBeNull();
    expect(resolvedVault).toBeNull();
  });

  it("links pagination across published entries only", () => {
    const [entries] = buildJournalManifest([
      entry("vault", "vault/index.mdx", { image }),
      entry("vault/first", "vault/first.mdx", { order: 10 }),
      entry("vault/draft-middle", "vault/draft-middle.mdx", {
        order: 20,
        draft: true,
      }),
      entry("vault/last", "vault/last.mdx", { order: 30 }),
    ]);

    expect(entries["vault"]?.next).toBe("vault/first");
    expect(entries["vault/first"]?.previous).toBe("vault");
    expect(entries["vault/first"]?.next).toBe("vault/last");
    expect(entries["vault/last"]?.previous).toBe("vault/first");
    expect(entries["vault/last"]?.next).toBeUndefined();
    expect(entries["vault/draft-middle"]).toBeUndefined();
  });

  it("requires images for standalone entries and vault roots", () => {
    expect(() =>
      buildJournalManifest([
        entry("standalone", "standalone.mdx", { image: undefined }),
      ]),
    ).toThrow("Standalone publications");

    expect(() =>
      buildJournalManifest([
        entry("vault", "vault/index.mdx", { image: undefined }),
        entry("vault/child", "vault/child.mdx"),
      ]),
    ).toThrow("Vault root entry");
  });

  it("rejects top-level vault folders without a root index", () => {
    expect(() =>
      buildJournalManifest([entry("orphan/child", "orphan/child.mdx")]),
    ).toThrow('Vault "orphan" is missing a required root index');
  });

  it("rejects top-level vault folders with only a root index", () => {
    expect(() =>
      buildJournalManifest([
        entry("empty-vault", "empty-vault/index.mdx", { image }),
      ]),
    ).toThrow('Vault "empty-vault" contains only an index entry');
  });

  it("rejects nested vault sections without an index", () => {
    expect(() =>
      buildJournalManifest([
        entry("vault", "vault/index.mdx", { image }),
        entry("vault/orphan/deep", "vault/orphan/deep.mdx"),
      ]),
    ).toThrow('Vault section "vault/orphan" is missing a required index');
  });

  it("rejects nested vault sections with only an index", () => {
    expect(() =>
      buildJournalManifest([
        entry("vault", "vault/index.mdx", { image }),
        entry("vault/intro", "vault/intro.mdx"),
        entry("vault/empty-section", "vault/empty-section/index.mdx"),
      ]),
    ).toThrow(
      'Vault section "vault/empty-section" contains only an index entry',
    );
  });

  it("builds nested vaults, inherits child images, sorts items, and links traversal", () => {
    const [entries, vaults] = buildJournalManifest([
      entry("vault/late", "vault/late.mdx", { order: 30 }),
      entry("vault/section/deep", "vault/section/deep.mdx", { order: 1 }),
      entry("vault/early", "vault/early.mdx", { order: 10 }),
      entry("vault/section", "vault/section/index.mdx", { order: 20 }),
      entry("vault", "vault/index.mdx", {
        title: "Vault Root",
        image,
        order: 5,
      }),
    ]);

    const vault = vaults["vault"];
    expect(vault).toBeDefined();
    expect(vault?.itemCount).toBe(5);
    expect(vault?.title).toBe("Vault Root");
    expect(entries["vault/early"]?.image).toEqual(image);
    expect(entries["vault/section/deep"]?.image).toEqual(image);

    const items = vault?.items ?? [];
    expect(items[0]?.id).toBe("vault/early");
    expect(items[1]?.id).toBe("vault/section");
    expect(items[2]?.id).toBe("vault/late");
    expect(isNestedGroup(items[1]!)).toBe(true);

    expect(entries["vault"]?.next).toBe("vault/early");
    expect(entries["vault/early"]?.previous).toBe("vault");
    expect(entries["vault/early"]?.next).toBe("vault/section");
    expect(entries["vault/section"]?.previous).toBe("vault/early");
    expect(entries["vault/section"]?.next).toBe("vault/section/deep");
    expect(entries["vault/section/deep"]?.previous).toBe("vault/section");
    expect(entries["vault/section/deep"]?.next).toBe("vault/late");
  });

  it("inherits the root github repository for children without their own", () => {
    const [entries] = buildJournalManifest([
      entry("vault", "vault/index.mdx", { image, github: "albertoduran" }),
      entry("vault/early", "vault/early.mdx"),
      entry("vault/section", "vault/section/index.mdx"),
      entry("vault/section/deep", "vault/section/deep.mdx", {
        github: "own-repo",
      }),
    ]);

    // Vault root keeps its own repository.
    expect(entries["vault"]?.github).toBe("albertoduran");
    // Children without a github inherit the root's, including section indexes.
    expect(entries["vault/early"]?.github).toBe("albertoduran");
    expect(entries["vault/section"]?.github).toBe("albertoduran");
    // A child that declares its own github is left untouched.
    expect(entries["vault/section/deep"]?.github).toBe("own-repo");
  });

  it("leaves children without github when the root has none", () => {
    const [entries] = buildJournalManifest([
      entry("vault", "vault/index.mdx", { image }),
      entry("vault/early", "vault/early.mdx"),
    ]);

    expect(entries["vault"]?.github).toBeUndefined();
    expect(entries["vault/early"]?.github).toBeUndefined();
  });

  it("resolves entries and vault context from generated journal paths", () => {
    const [entries, vaults] = buildJournalManifest([
      entry("vault", "vault/index.mdx", { image }),
      entry("vault/section", "vault/section/index.mdx"),
      entry("vault/section/deep", "vault/section/deep.mdx"),
    ]);

    const [resolvedEntry, resolvedVault] = resolveJournalContext(
      "/thejournal/vault/section/deep/",
      entries,
      vaults,
    );

    expect(resolvedEntry?.id).toBe("vault/section/deep");
    expect(resolvedVault?.id).toBe("vault");
  });

  it("measures prose and code read time with a one-minute minimum", () => {
    expect(measureReadTime(entry("empty", "empty.mdx", { image }, ""))).toBe(0);

    const prose = Array.from(
      { length: 201 },
      (_, index) => `word${index}`,
    ).join(" ");
    expect(measureReadTime(entry("long", "long.mdx", { image }, prose))).toBe(
      2,
    );

    const code = [
      "```ts",
      ...Array.from({ length: 41 }, () => "const x = 1;"),
      "```",
    ].join("\n");
    expect(measureReadTime(entry("code", "code.mdx", { image }, code))).toBe(2);

    const imageAlt = Array.from(
      { length: 201 },
      (_, index) => `altword${index}`,
    ).join(" ");
    expect(
      measureReadTime(
        entry("image-alt", "image-alt.mdx", { image }, `![${imageAlt}](x.png)`),
      ),
    ).toBe(1);
  });

  it("rejects updated entries without an original publication date", () => {
    expect(() =>
      buildJournalManifest([
        entry("bad", "bad.mdx", {
          image,
          pubDate: undefined,
          updatePubDate: new Date("2026-02-01T00:00:00Z"),
        }),
      ]),
    ).toThrow("updatePubDate requires pubDate");
  });
});
