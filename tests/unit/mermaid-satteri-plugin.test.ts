import { describe, expect, it, vi } from "vitest";
import { markdownToHtml, mdxToJs } from "satteri";
import type { Element } from "hast";
import { createMermaidMdastPlugin } from "@integrations/mermaid/satteri-plugin";
import type { RegisteredDiagram } from "@integrations/mermaid/pipeline";

function fixtureSvgNode(): Element {
  return {
    type: "element",
    tagName: "svg",
    properties: {
      id: "fixture-diagram",
      viewBox: "0 0 10 10",
    },
    children: [],
  };
}

function fixtureDiagram(stableId: string, code: string): RegisteredDiagram {
  return {
    node: fixtureSvgNode(),
    stableId,
    cacheKey: `cache-${stableId}-${code.length}`,
    assetHref: `/_app/mermaid/${stableId}.svg`,
    assetHrefDark: `/_app/mermaid/${stableId}-dark.svg`,
  };
}

describe("mermaid Satteri plugin", () => {
  it("replaces markdown mermaid fences with asset-backed diagram markup", async () => {
    const getDiagram = vi.fn((stableId: string, code: string) =>
      fixtureDiagram(stableId, code),
    );

    const result = await markdownToHtml(
      [
        "Before",
        "",
        "```mermaid",
        "graph TD",
        "  A --> B",
        "```",
        "",
        "After",
      ].join("\n"),
      {
        mdastPlugins: [createMermaidMdastPlugin({ getDiagram })],
      },
    );

    expect(getDiagram).toHaveBeenCalledOnce();
    expect(getDiagram.mock.calls[0]?.[1]).toBe("graph TD\n  A --> B");
    expect(result.html).toContain('class="mermaid-diagram-container"');
    expect(result.html).toContain('data-diagram-src="/_app/mermaid/');
    expect(result.html).toContain('data-diagram-dark-src="/_app/mermaid/');
    expect(result.html).toContain("mermaid-diagram-image-light");
    expect(result.html).toContain("mermaid-diagram-image-dark");
    expect(result.html).not.toContain("<svg");
    expect(result.html).not.toContain("set:html");
    expect(result.html).not.toContain("data-mermaid-stable-id");
  });

  it("emits an asset-backed MermaidDiagramWrapper component for MDX documents", async () => {
    const getDiagram = vi.fn((stableId: string, code: string) =>
      fixtureDiagram(stableId, code),
    );

    const result = await mdxToJs(
      ["```mermaid", "sequenceDiagram", "  A->>B: hello", "```"].join("\n"),
      {
        mdastPlugins: [createMermaidMdastPlugin({ getDiagram })],
        jsxImportSource: "astro",
        fileURL: new URL("file:///fixtures/article.mdx"),
      },
    );

    expect(result.code).toContain("MermaidDiagramWrapper");
    expect(result.code).toContain('class: "mermaid-diagram-container"');
    expect(result.code).toContain('"data-diagram-src": "/_app/mermaid/');
    expect(result.code).toContain('"data-diagram-dark-src": "/_app/mermaid/');
    expect(result.code).toContain('"data-diagram-type": "sequence"');
    expect(result.code).not.toContain("set:html");
    expect(result.code).not.toContain("<svg");
    expect(result.code).not.toContain("data-mermaid-stable-id");
  });

  it("consumes skipped mermaid fences without preparing or rendering them", async () => {
    const getDiagram = vi.fn((stableId: string, code: string) =>
      fixtureDiagram(stableId, code),
    );

    const result = await mdxToJs(
      ["```mermaid", "graph TD", "  Draft --> Hidden", "```"].join("\n"),
      {
        mdastPlugins: [
          createMermaidMdastPlugin({
            getDiagram,
            shouldRenderDiagram: () => false,
          }),
        ],
        jsxImportSource: "astro",
        fileURL: new URL("file:///fixtures/draft.mdx"),
      },
    );

    expect(getDiagram).not.toHaveBeenCalled();
    expect(result.code).not.toContain("MermaidDiagramWrapper");
    expect(result.code).not.toContain("Draft --> Hidden");
    expect(result.code).not.toContain("mermaid");
  });

  it("fails clearly when the build registry is missing a diagram", () => {
    expect(() =>
      mdxToJs(["```mermaid", "graph TD", "  A --> B", "```"].join("\n"), {
        mdastPlugins: [
          createMermaidMdastPlugin({
            getDiagram: () => null,
          }),
        ],
        jsxImportSource: "astro",
        fileURL: new URL("file:///fixtures/missing.mdx"),
      }),
    ).toThrow(/was not prepared/);
  });
});
