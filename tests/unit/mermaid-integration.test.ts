import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { collectPublishableMermaidDiagrams } from "@integrations/mermaid/integration";

function diagramId(code: string): string {
  return createHash("sha256").update(code).digest("hex").slice(0, 8);
}

function mdx({
  draft,
  body,
}: {
  draft?: boolean;
  body: string;
}): string {
  const draftLine = typeof draft === "boolean" ? `draft: ${draft}\n` : "";

  return `---\ntitle: Test\npubDate: 2026-01-01\n${draftLine}---\n\n${body}`;
}

function mermaid(code: string): string {
  return `\`\`\`mermaid\n${code}\n\`\`\``;
}

describe("collectPublishableMermaidDiagrams", () => {
  it("skips draft journal diagrams while keeping published journal and component diagrams", () => {
    const publishedCode = "graph TD\n  Published --> Build";
    const draftCode = "graph TD\n  Draft --> Worker";
    const componentCode = "graph LR\n  Component --> Project";

    const diagrams = collectPublishableMermaidDiagrams([
      {
        filePath: "src/thejournal/published.mdx",
        content: mdx({ body: mermaid(publishedCode) }),
      },
      {
        filePath: "src/thejournal/draft.mdx",
        content: mdx({ draft: true, body: mermaid(draftCode) }),
      },
      {
        filePath: "src/components/projects/ProjectFlow.mdx",
        content: mermaid(componentCode),
      },
    ]);

    expect(diagrams.get(diagramId(publishedCode))).toBe(publishedCode);
    expect(diagrams.get(diagramId(componentCode))).toBe(componentCode);
    expect(diagrams.has(diagramId(draftCode))).toBe(false);
  });

  it("skips diagrams under draft journal index scopes", () => {
    const draftRootCode = "graph TD\n  Root --> Hidden";
    const draftChildCode = "graph TD\n  Child --> Hidden";
    const siblingCode = "graph TD\n  Sibling --> Visible";

    const diagrams = collectPublishableMermaidDiagrams([
      {
        filePath: "src/thejournal/draft-vault/index.mdx",
        content: mdx({ draft: true, body: mermaid(draftRootCode) }),
      },
      {
        filePath: "src/thejournal/draft-vault/child.mdx",
        content: mdx({ body: mermaid(draftChildCode) }),
      },
      {
        filePath: "src/thejournal/draft-vaultish.mdx",
        content: mdx({ body: mermaid(siblingCode) }),
      },
    ]);

    expect(diagrams.has(diagramId(draftRootCode))).toBe(false);
    expect(diagrams.has(diagramId(draftChildCode))).toBe(false);
    expect(diagrams.get(diagramId(siblingCode))).toBe(siblingCode);
  });
});
