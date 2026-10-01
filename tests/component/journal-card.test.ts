import type { EntryContext } from "@appTypes/content_context";
import JournalCard from "@components/shared/JournalCard.astro";
import { describe, expect, it } from "vitest";
import { render } from "./helpers/render";

function entry(id: string, vaultId: string): EntryContext {
  return {
    id,
    title: `Title of ${id}`,
    order: 100,
    description: "Description.",
    readTime: 3,
    tags: ["astro"],
    pubDate: new Date("2026-07-01T00:00:00.000Z"),
    filepath: `${id}.mdx`,
    vaultId,
  };
}

const hrefOf = (html: string) => html.match(/^<a[^>]*\bhref="([^"]+)"/)?.[1];

describe("JournalCard", () => {
  it.each([
    ["standalone", entry("standalone_post", "")],
    ["vault root", entry("mlscraper", "mlscraper")],
    ["vault child", entry("mlscraper/runtime_flow", "mlscraper")],
  ])("always opens the publication for a %s entry", async (_kind, card) => {
    const html = await render(JournalCard, { props: { entry: card } });

    expect(hrefOf(html)).toBe(`/thejournal/${card.id}/`);
  });

  it("shows the formatted date and read time", async () => {
    const html = await render(JournalCard, {
      props: { entry: entry("standalone_post", "") },
    });

    expect(html).toContain('datetime="2026-07-01T00:00:00.000Z"');
    expect(html).toContain("Jul 1, 2026");
    expect(html).toContain("3 min read");
  });

  it("labels vault roots and names the vault on children", async () => {
    const root = await render(JournalCard, {
      props: { entry: entry("mlscraper", "mlscraper") },
    });
    const child = await render(JournalCard, {
      props: {
        entry: entry("mlscraper/runtime_flow", "mlscraper"),
        vaultTitle: "MLScraper vault",
      },
    });
    const standalone = await render(JournalCard, {
      props: { entry: entry("standalone_post", "") },
    });

    // The container adds dev-only attributes, so match tags loosely.
    const vaultBadge = /<span class="text-primary"[^>]*>Vault<\/span>/;
    const vaultName = />In <span class="italic"[^>]*>MLScraper vault<\/span>/;

    expect(root).toMatch(vaultBadge);
    expect(root).not.toMatch(vaultName);
    expect(child).toMatch(vaultName);
    expect(child).not.toMatch(vaultBadge);
    expect(standalone).not.toMatch(vaultBadge);
    expect(standalone).not.toMatch(vaultName);
  });
});
