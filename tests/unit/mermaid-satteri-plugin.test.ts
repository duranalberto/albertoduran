import { describe, expect, it, vi } from "vitest";
import { markdownToHtml, mdxToJs } from "satteri";
import type { Element } from "hast";
import {
  createMermaidHastPlugin,
  createMermaidMdastPlugin,
} from "@integrations/mermaid/satteri-plugin";
import type { RegisteredDiagram } from "@integrations/mermaid/pipeline";

function fixtureSvgNode(): Element {
  return {
    type: "element",
    tagName: "svg",
    properties: {
      id: "fixture-diagram",
      viewBox: "0 0 10 10",
    },
    children: [
      {
        type: "element",
        tagName: "path",
        properties: { d: "M0 0h10v10H0z" },
        children: [],
      },
    ],
  };
}

describe("mermaid Satteri plugin", () => {
  it("replaces mermaid fences with a rendered diagram container", async () => {
    const registerDiagram = vi.fn(
      async (stableId: string, code: string): Promise<RegisteredDiagram> => ({
        node: fixtureSvgNode(),
        stableId,
        cacheKey: `cache-${stableId}-${code.length}`,
        assetHref: `/_app/mermaid/${stableId}.svg`,
        assetHrefDark: `/_app/mermaid/${stableId}-dark.svg`,
      }),
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
        mdastPlugins: [createMermaidMdastPlugin({ registerDiagram })],
        hastPlugins: [createMermaidHastPlugin()],
      },
    );

    expect(registerDiagram).toHaveBeenCalledOnce();
    expect(registerDiagram.mock.calls[0]?.[1]).toBe("graph TD\n  A --> B");
    expect(result.html).toContain('class="mermaid-diagram-container"');
    expect(result.html).toContain('data-diagram-src="/_app/mermaid/');
    expect(result.html).toContain('data-diagram-dark-src="/_app/mermaid/');
    expect(result.html).toContain("<svg");
    expect(result.html).not.toContain("data-mermaid-stable-id");
  });

  it("emits a MermaidDiagramWrapper component for MDX documents", async () => {
    const registerDiagram = vi.fn(
      async (stableId: string, code: string): Promise<RegisteredDiagram> => ({
        node: fixtureSvgNode(),
        stableId,
        cacheKey: `cache-${stableId}-${code.length}`,
        assetHref: `/_app/mermaid/${stableId}.svg`,
        assetHrefDark: `/_app/mermaid/${stableId}-dark.svg`,
      }),
    );

    const result = await mdxToJs(
      ["```mermaid", "graph TD", "  A --> B", "```"].join("\n"),
      {
        mdastPlugins: [createMermaidMdastPlugin({ registerDiagram })],
        jsxImportSource: "astro",
        fileURL: new URL("file:///fixtures/article.mdx"),
      },
    );

    expect(result.code).toContain("MermaidDiagramWrapper");
    expect(result.code).toContain('class: "mermaid-diagram-container"');
    expect(result.code).toContain('"set:html": "<svg');
    expect(result.code).not.toContain("data-mermaid-stable-id");
  });

  it("leaves skipped mermaid fences unrendered", async () => {
    const registerDiagram = vi.fn(
      async (stableId: string, code: string): Promise<RegisteredDiagram> => ({
        node: fixtureSvgNode(),
        stableId,
        cacheKey: `cache-${stableId}-${code.length}`,
        assetHref: `/_app/mermaid/${stableId}.svg`,
        assetHrefDark: `/_app/mermaid/${stableId}-dark.svg`,
      }),
    );

    const result = await mdxToJs(
      ["```mermaid", "graph TD", "  Draft --> Hidden", "```"].join("\n"),
      {
        mdastPlugins: [
          createMermaidMdastPlugin({
            registerDiagram,
            shouldRenderDiagram: () => false,
          }),
        ],
        jsxImportSource: "astro",
        fileURL: new URL("file:///fixtures/draft.mdx"),
      },
    );

    expect(registerDiagram).not.toHaveBeenCalled();
    expect(result.code).not.toContain("MermaidDiagramWrapper");
  });
});
