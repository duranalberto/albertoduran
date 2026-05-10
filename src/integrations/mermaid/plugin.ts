/**
 * plugin.ts
 *
 * Remark plugin that replaces mermaid code fences with pre-rendered,
 * multi-theme SVG HAST nodes injected into the MDX AST.
 *
 * Per-file lifecycle (runs concurrently across all MDX files):
 * 1. Collect all mermaid code nodes in this file's AST.
 * 2. Call registerDiagram() for each — cache hits return immediately;
 *    misses are queued into the global batch in the DiagramPipeline.
 * 3. Await batchPromise — the debounced flush fires after all concurrent
 *    remark pipelines have registered their diagrams, then makes a single
 *    batched network request for all of them.
 * 4. Inject the resolved HAST nodes back into this file's AST.
 *
 * ## stableId
 * A truncated SHA-256 (8 hex chars = 32 bits) of the diagram source.
 * 32 bits gives ~4 billion possible ids — negligible collision probability
 * for any blog-scale diagram count. The short form keeps log output and
 * cache file names readable.
 */

import type { Element as HastElement } from "hast";
import type { Code, Root as MdastRoot, Parent } from "mdast";
import { createHash } from "node:crypto";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { RegisteredDiagram } from "./pipeline.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MermaidPluginConfig {
  cacheSubDir?: string;
  /**
   * Injected by integration.ts — delegates to DiagramPipeline.registerDiagram.
   * Defined here so the plugin is decoupled from the pipeline singleton.
   */
  registerDiagram: (
    stableId: string,
    code: string,
  ) => Promise<RegisteredDiagram>;
}

/**
 * Virtual MDast node type used to carry HAST data through the remark pipeline.
 * `data.hName` / `data.hProperties` / `data.hChildren` are the rehype
 * conventions for injecting raw HAST into a unified tree.
 */
interface MermaidContainerNode {
  type: "mermaid-container";
  data: {
    hName: string;
    hProperties: Record<string, unknown>;
    hChildren: HastElement[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getStableId(code: string): string {
  return createHash("sha256").update(code).digest("hex").slice(0, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Plugin
// ─────────────────────────────────────────────────────────────────────────────

export const mermaidRemarkPlugin: Plugin<[MermaidPluginConfig], MdastRoot> = (
  options,
) => {
  return async (tree) => {
    const tasks: { node: Code; index: number; parent: Parent }[] = [];

    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang === "mermaid" && parent && typeof index === "number") {
        tasks.push({ node, index, parent });
      }
    });

    if (tasks.length === 0) return;

    const resolvedDiagrams: RegisteredDiagram[] = await Promise.all(
      tasks.map(({ node }) => {
        const code = node.value.trim();
        const stableId = getStableId(code);
        return options.registerDiagram(stableId, code);
      }),
    );

    for (let i = 0; i < tasks.length; i++) {
      const { index, parent } = tasks[i]!;
      const diagram = resolvedDiagrams[i]!;

      const containerNode: MermaidContainerNode = {
        type: "mermaid-container",
        data: {
          hName: "div",
          hProperties: {
            className: ["mermaid-diagram-container"],
            "data-diagram-src": diagram.assetHref,
            "data-diagram-dark-src": diagram.assetHrefDark,
            "data-diagram-stable-id": diagram.stableId,
            "data-diagram-cache-key": diagram.cacheKey,
          },
          hChildren: [diagram.node],
        },
      };

      // MdastRoot children are typed as MdastContent, which does not include
      // custom virtual node types. The cast is intentional and scoped to this
      // single assignment — the virtual node is consumed by rehype immediately
      // after the remark phase and never surfaces as a real mdast node.
      parent.children[index] =
        containerNode as unknown as (typeof parent.children)[number];
    }
  };
};
