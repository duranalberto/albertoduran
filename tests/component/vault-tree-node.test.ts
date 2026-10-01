import type { EntryContext, NestedGroup } from "@appTypes/content_context";
import VaultTreeNode from "@components/thejournal/article/VaultTreeNode.astro";
import { describe, expect, it } from "vitest";
import { render } from "./helpers/render";

function entry(id: string, title: string): EntryContext {
  return {
    id,
    title,
    order: 100,
    description: "",
    readTime: 1,
    tags: [],
    pubDate: new Date("2026-01-01"),
    filepath: `${id}.mdx`,
    vaultId: "vault",
  };
}

const section: NestedGroup = {
  id: "vault/section",
  title: "Section",
  order: 100,
  index: entry("vault/section", "Section"),
  items: [
    entry("vault/section/child", "Child"),
    {
      id: "vault/section/deep",
      title: "Deep",
      order: 100,
      index: entry("vault/section/deep", "Deep"),
      items: [entry("vault/section/deep/leaf", "Leaf")],
    },
  ],
};

const count = (html: string, needle: string) => html.split(needle).length - 1;

describe("VaultTreeNode", () => {
  it.each(["vault/section/child", "vault/section/deep/leaf"])(
    "never renders the active line in a static tree (active %s)",
    async (currentEntryId) => {
      const html = await render(VaultTreeNode, {
        props: { item: section, currentEntryId, isStatic: true },
      });

      expect(html).not.toContain("vault-active-line");
    },
  );

  it.each(["vault/section", "vault/section/child", "vault/section/deep/leaf"])(
    "marks only the active node in an interactive tree (active %s)",
    async (currentEntryId) => {
      const html = await render(VaultTreeNode, {
        props: { item: section, currentEntryId, isStatic: false },
      });

      expect(count(html, "vault-active-line")).toBe(1);
      expect(count(html, 'aria-current="page"')).toBe(1);
      expect(html).toMatch(
        new RegExp(
          `href="/thejournal/${currentEntryId}/"[^>]*aria-current="page"`,
        ),
      );
    },
  );

  it("renders every nested entry as a link", async () => {
    const html = await render(VaultTreeNode, {
      props: { item: section, currentEntryId: "none" },
    });

    for (const id of [
      "vault/section",
      "vault/section/child",
      "vault/section/deep",
      "vault/section/deep/leaf",
    ]) {
      expect(html).toContain(`href="/thejournal/${id}/"`);
    }
  });
});
