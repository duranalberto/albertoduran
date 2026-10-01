import { collectPublishableDocuments } from "@content/processors/publishable";
import { describe, expect, it } from "vitest";

const doc = (filePath: string, frontmatter = "") => ({
  filePath,
  content: `---\ntitle: T\n${frontmatter}---\n\nBody`,
});
const paths = (docs: { filePath: string }[]) =>
  docs.map((d) => d.filePath).sort();

describe("collectPublishableDocuments", () => {
  it("keeps every non-journal source", () => {
    const docs = [
      doc("src/pages/projects/mlscraper.astro"),
      doc("src/components/x.astro", "draft: true\n"),
    ];

    expect(paths(collectPublishableDocuments(docs))).toEqual(paths(docs));
  });

  it("keeps published journal entries and drops drafts", () => {
    const result = collectPublishableDocuments([
      doc("src/thejournal/live.mdx"),
      doc("src/thejournal/wip.mdx", "draft: true\n"),
      doc("src/thejournal/explicit.md", "draft: false\n"),
    ]);

    expect(paths(result)).toEqual([
      "src/thejournal/explicit.md",
      "src/thejournal/live.mdx",
    ]);
  });

  it("drops a whole vault when its root index is a draft", () => {
    const result = collectPublishableDocuments([
      doc("src/thejournal/vault/index.mdx", "draft: true\n"),
      doc("src/thejournal/vault/child.mdx"),
      doc("src/thejournal/vault/section/index.md"),
      doc("src/thejournal/vault/section/leaf.mdx"),
      doc("src/thejournal/vaulted.mdx"),
    ]);

    expect(paths(result)).toEqual(["src/thejournal/vaulted.mdx"]);
  });

  it("drops only the draft section's subtree", () => {
    const result = collectPublishableDocuments([
      doc("src/thejournal/vault/index.mdx"),
      doc("src/thejournal/vault/keep.mdx"),
      doc("src/thejournal/vault/wip/index.mdx", "draft: true\n"),
      doc("src/thejournal/vault/wip/leaf.mdx"),
    ]);

    expect(paths(result)).toEqual([
      "src/thejournal/vault/index.mdx",
      "src/thejournal/vault/keep.mdx",
    ]);
  });

  it("normalizes Windows separators", () => {
    const result = collectPublishableDocuments([
      doc("src\\thejournal\\vault\\index.mdx", "draft: true\n"),
      doc("src\\thejournal\\vault\\child.mdx"),
      doc("src\\pages\\index.astro"),
    ]);

    expect(paths(result)).toEqual(["src/pages/index.astro"]);
  });

  it("treats non-markdown files under src/thejournal as non-journal sources", () => {
    const result = collectPublishableDocuments([
      doc("src/thejournal/.markdownlint.json", "draft: true\n"),
    ]);

    expect(paths(result)).toEqual(["src/thejournal/.markdownlint.json"]);
  });
});
