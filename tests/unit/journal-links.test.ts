import type { EntryContext } from "@appTypes/content_context";
import {
  journalHref,
  normalizeJournalRefId,
  resolveJournalLinks,
  suggestClosest,
  type JournalLinkContext,
} from "@content/journal_links";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

function entry(id: string, vaultId = ""): EntryContext {
  return {
    id,
    title: `Title of ${id}`,
    description: `About ${id}`,
    order: 1,
    readTime: 7,
    tags: [],
    pubDate: new Date("2026-09-01"),
    filepath: `${id}.mdx`,
    vaultId,
  };
}

const manifest: Record<string, EntryContext> = {
  standalone_article: entry("standalone_article"),
  vault: entry("vault", "vault"),
  "vault/section": entry("vault/section", "vault"),
  "vault/section/child": entry("vault/section/child", "vault"),
  "vault/fetching_and_backoff": entry("vault/fetching_and_backoff", "vault"),
};

const headings: Record<string, string[]> = {
  standalone_article: ["intro", "cors-broke-twice"],
};

function context(
  overrides: Partial<JournalLinkContext> = {},
): JournalLinkContext {
  return {
    owner: "Test Project",
    manifest,
    headingsFor: async (id) => new Set(headings[id] ?? []),
    ...overrides,
  };
}

describe("journalHref", () => {
  it("builds the Journal route with an optional anchor", () => {
    expect(journalHref("vault/section")).toBe("/thejournal/vault/section/");
    expect(journalHref("a", "b")).toBe("/thejournal/a/#b");
  });
});

describe("normalizeJournalRefId", () => {
  it("prefixes vault-relative ids and keeps full ids", () => {
    expect(normalizeJournalRefId("section", "vault")).toBe("vault/section");
    expect(normalizeJournalRefId("vault/section", "vault")).toBe(
      "vault/section",
    );
    expect(normalizeJournalRefId("vault", "vault")).toBe("vault");
    expect(normalizeJournalRefId("/standalone_article/")).toBe(
      "standalone_article",
    );
  });
});

describe("resolveJournalLinks", () => {
  it("resolves standalone, vault root, section, and child entries", async () => {
    const links = await resolveJournalLinks(
      {
        article: "standalone_article",
        root: "vault",
        section: "section",
        child: "section/child",
      },
      context({ vault: "vault" }),
    );

    expect(links.article.href).toBe("/thejournal/standalone_article/");
    expect(links.root.href).toBe("/thejournal/vault/");
    expect(links.section.href).toBe("/thejournal/vault/section/");
    expect(links.child).toMatchObject({
      id: "vault/section/child",
      title: "Title of vault/section/child",
      description: "About vault/section/child",
      readTime: 7,
      vaultId: "vault",
    });
  });

  it("falls back to a full id when a vault page links outside its vault", async () => {
    const links = await resolveJournalLinks(
      { article: "standalone_article" },
      context({ vault: "vault" }),
    );

    expect(links.article.id).toBe("standalone_article");
  });

  it("fails with a suggestion when the entry is missing", async () => {
    await expect(
      resolveJournalLinks(
        { fetching: "fetching_and_backof" },
        context({ vault: "vault" }),
      ),
    ).rejects.toThrow(
      /Test Project: Journal link "fetching" points to "vault\/fetching_and_backof".*Did you mean "vault\/fetching_and_backoff"\?/,
    );
  });

  it("validates anchors against the article headings", async () => {
    const links = await resolveJournalLinks(
      { incident: { id: "standalone_article", anchor: "#cors-broke-twice" } },
      context(),
    );

    expect(links.incident.href).toBe(
      "/thejournal/standalone_article/#cors-broke-twice",
    );
    expect(links.incident.anchor).toBe("cors-broke-twice");
  });

  it("fails on an unknown anchor and lists the available headings", async () => {
    await expect(
      resolveJournalLinks(
        { incident: { id: "standalone_article", anchor: "cors-broke-twise" } },
        context(),
      ),
    ).rejects.toThrow(
      /Did you mean "cors-broke-twice"\? Available headings: intro, cors-broke-twice\./,
    );
  });

  it("only warns about an unknown anchor in warn mode", async () => {
    const warn = vi.fn();
    const links = await resolveJournalLinks(
      { incident: { id: "standalone_article", anchor: "renamed" } },
      context({ onAnchorMismatch: "warn", warn }),
    );

    expect(warn).toHaveBeenCalledOnce();
    expect(links.incident.href).toBe("/thejournal/standalone_article/#renamed");
  });

  it("reads headings only for links with an anchor", async () => {
    const headingsFor = vi.fn(async () => new Set<string>());
    await resolveJournalLinks(
      { article: "standalone_article" },
      context({ headingsFor }),
    );

    expect(headingsFor).not.toHaveBeenCalled();
  });
});

describe("suggestClosest", () => {
  it("returns nothing when no candidate is close", () => {
    expect(suggestClosest("zzzzzzzz", ["standalone_article"])).toBeUndefined();
  });
});

describe("project pages", () => {
  it("never hand-type Journal URLs", () => {
    const directory = join(process.cwd(), "src/pages/projects");
    const offenders = readdirSync(directory)
      .filter((file) => file.endsWith(".astro"))
      .filter((file) =>
        /["'`]\/thejournal\//.test(readFileSync(join(directory, file), "utf8")),
      );

    expect(offenders).toEqual([]);
  });
});
