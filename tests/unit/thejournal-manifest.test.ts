import { describe, expect, it } from "vitest";
import {
  buildJournalManifest,
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

  it("resolves entries and vault context from generated journal paths", () => {
    const [entries, vaults] = buildJournalManifest([
      entry("vault", "vault/index.mdx", { image }),
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

    const prose = Array.from({ length: 201 }, (_, index) => `word${index}`).join(
      " ",
    );
    expect(measureReadTime(entry("long", "long.mdx", { image }, prose))).toBe(
      2,
    );

    const code = ["```ts", ...Array.from({ length: 41 }, () => "const x = 1;"), "```"].join(
      "\n",
    );
    expect(measureReadTime(entry("code", "code.mdx", { image }, code))).toBe(2);
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
