import { describe, expect, it } from "vitest";
import { optimizeMermaidPageCss } from "@integrations/mermaid/page-css";

function getHoistedCss(html: string): string {
  return (
    html.match(/<style data-mermaid-page-css>([\s\S]*?)<\/style>/)?.[1] ?? ""
  );
}

describe("mermaid page CSS optimization", () => {
  it("hoists SVG styles without restructuring theme cascade across diagrams", () => {
    const html = `<!doctype html><html><head></head><body>
      <svg id="mermaid-a"><style>
        #mermaid-a { fill: #111; }
        [data-theme="dark"] #mermaid-a { fill: #fff; }
        #mermaid-a .edgePath path { stroke: #eee; }
      </style><g></g></svg>
      <svg id="mermaid-b"><style>
        #mermaid-b { fill: #fff; }
        #mermaid-b .node rect { stroke: #111; }
        [data-theme="dark"] #mermaid-b .node rect { stroke: #eee; }
      </style><g></g></svg>
    </body></html>`;

    const result = optimizeMermaidPageCss(html);
    const css = getHoistedCss(result.html);

    expect(result.diagramCount).toBe(2);
    expect(result.extractedStyleCount).toBe(2);
    expect(result.html).not.toContain("<svg id=\"mermaid-a\"><style>");
    expect(result.html).not.toContain("<svg id=\"mermaid-b\"><style>");
    expect(css).toContain("#mermaid-a{fill:#111}");
    expect(css).toContain("[data-theme=dark] #mermaid-a{fill:#fff}");
    expect(css).toContain("#mermaid-b{fill:#fff}");
    expect(css).not.toContain("#mermaid-b,[data-theme=dark] #mermaid-a");
    expect(css).not.toContain(
      "#mermaid-a .edgePath path,[data-theme=dark] #mermaid-b .node rect",
    );
  });
});
