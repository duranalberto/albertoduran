import { Graphviz } from "@hpcc-js/wasm";
import type { Code, Root } from "mdast";
import { visit } from "unist-util-visit";

const DOT_LANGS = new Set(["dot", "graphviz", "gv"]);

// Race-safe singleton (prevents multiple WASM instantiations)
let _graphvizPromise: ReturnType<typeof Graphviz.load> | null = null;

async function getGraphviz() {
  if (!_graphvizPromise) {
    _graphvizPromise = Graphviz.load();
  }
  return _graphvizPromise;
}

function processGraphvizSVG(svg: string): string {
  let out = svg;

  // ── Strip XML declaration / DOCTYPE (invalid inside HTML body) ─────────
  out = out.replace(/<\?xml[\s\S]*?\?>/g, "");
  out = out.replace(/<!DOCTYPE[\s\S]*?>/g, "");

  // ── Strip generator comment ─────────────────────────────────────────────
  out = out.replace(/<!--[\s\S]*?-->/g, "");

  let capturedWidth = "";
  out = out.replace(/\s+width="([^"]*)"/, (_match, w: string) => {
    capturedWidth = w;
    return "";
  });

  // Strip height — CSS controls height via auto + viewBox aspect ratio
  out = out.replace(/\s+height="[^"]*"/, "");

  // Remove invisible polygons
  out = out.replace(/<polygon\b[^>]*\bstroke="none"[^>]*\/>/g, "");

  // Remove fills except "none"
  out = out.replace(/\bfill="(?!none")[^"]*"/g, "");

  // Remove all strokes
  out = out.replace(/\bstroke="[^"]*"/g, "");

  // Remove presentation attributes
  out = out.replace(/\bcolor="[^"]*"/g, "");
  out = out.replace(/\bfont-family="[^"]*"/g, "");
  out = out.replace(/\bfont-size="[^"]*"/g, "");

  // Inject min-width based on Graphviz output
  if (capturedWidth) {
    out = out.replace("<svg", `<svg style="min-width:${capturedWidth}"`);
  }

  // Accessibility tweak
  out = out.replace("<svg", '<svg aria-hidden="true"');

  return out.trim();
}

export function remarkGraphviz() {
  return async function (tree: Root): Promise<void> {
    const candidates: { node: Code; index: number; parent: any }[] = [];

    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang && DOT_LANGS.has(node.lang.toLowerCase())) {
        candidates.push({ node, index: index as number, parent });
      }
    });

    if (candidates.length === 0) return;

    const gv = await getGraphviz();

    for (const { node, index, parent } of candidates) {
      try {
        const rawSvg = gv.layout(node.value, "svg", "dot");
        const themedSvg = processGraphvizSVG(rawSvg);

        parent.children[index] = {
          type: "html" as const,
          value: `<figure class="diagram-wrapper not-prose" aria-label="Diagram">${themedSvg}</figure>`,
        };
      } catch (error) {
        console.error("[remark-graphviz] Failed to render diagram:", error);
        console.error("[remark-graphviz] DOT source:\n", node.value);
      }
    }
  };
}
