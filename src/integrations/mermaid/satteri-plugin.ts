import { defineMdastPlugin, defineHastPlugin } from "satteri";
import { createHash } from "node:crypto";
import type { Code } from "mdast";
import type { Element } from "hast";
import type { HastVisitorContext } from "satteri";
import type { MdxJsxFlowElement, MdxJsxAttributeNode } from "satteri";
import { toHtml } from "hast-util-to-html";
import type { RegisteredDiagram } from "./pipeline.ts";

// MdastVisitorContext is not re-exported from the satteri package root.
interface MdastCtx {
  data: Record<string, unknown>;
  fileURL?: unknown;
}

// HastRaw is not re-exported from the satteri package root.
interface HastRaw {
  type: "raw";
  value: string;
}

export interface MermaidSatteriPluginConfig {
  registerDiagram: (stableId: string, code: string) => Promise<RegisteredDiagram>;
  shouldRenderDiagram?: (fileURL: URL | undefined) => boolean;
}

// Key used in ctx.data to share diagram metadata from MDAST to HAST.
// Both phases receive the same ctx.data object per document.
const MERMAID_DATA_KEY = "_mermaidNodes";

interface MermaidEntry {
  svgNode: Element;
  assetHref: string;
  assetHrefDark: string;
  cacheKey: string;
}
type MermaidDataMap = Record<string, MermaidEntry>;

function getStableId(code: string): string {
  return createHash("sha256").update(code).digest("hex").slice(0, 8);
}

function isMdxFile(ctx: MdastCtx): boolean {
  return getFileURL(ctx)?.pathname.endsWith(".mdx") ?? false;
}

function getFileURL(ctx: MdastCtx): URL | undefined {
  return ctx.fileURL instanceof URL ? ctx.fileURL : undefined;
}

function attr(name: string, value: string): MdxJsxAttributeNode {
  return { type: "mdxJsxAttribute", name, value };
}

function createMdxMermaidNode(
  stableId: string,
  entry: MermaidEntry,
): MdxJsxFlowElement {
  return {
    type: "mdxJsxFlowElement",
    name: "MermaidDiagramWrapper",
    attributes: [
      attr("class", "mermaid-diagram-container"),
      attr("data-diagram-src", entry.assetHref),
      attr("data-diagram-dark-src", entry.assetHrefDark),
      attr("data-diagram-stable-id", stableId),
      attr("data-diagram-cache-key", entry.cacheKey),
    ],
    children: [
      {
        type: "mdxJsxFlowElement",
        name: "Fragment",
        attributes: [
          attr("set:html", toHtml(entry.svgNode, { space: "svg" })),
        ],
        children: [],
      },
    ],
  };
}

/**
 * MDAST plugin: replaces mermaid code fences with a small rawHtml placeholder
 * and stashes the rendered SVG HAST node in ctx.data for the HAST phase.
 *
 * Using rawHtml produces a HAST `raw` node (opaque string), not an `element`.
 * The SVG itself (300 KB–700 KB) is injected structurally in the HAST phase
 * via node replacement, bypassing Rust's HTML re-parser entirely.
 */
export function createMermaidMdastPlugin(config: MermaidSatteriPluginConfig) {
  return defineMdastPlugin({
    name: "mermaid",
    async code(node: Readonly<Code>, ctx: MdastCtx) {
      if (node.lang !== "mermaid") return;
      const fileURL = getFileURL(ctx);
      if (config.shouldRenderDiagram?.(fileURL) === false) return;

      const code = node.value.trim();
      const stableId = getStableId(code);
      const diagram = await config.registerDiagram(stableId, code);

      const data = ctx.data;
      const map: MermaidDataMap = (data[MERMAID_DATA_KEY] as MermaidDataMap) ?? {};
      map[stableId] = {
        svgNode: diagram.node,
        assetHref: diagram.assetHref,
        assetHrefDark: diagram.assetHrefDark,
        cacheKey: diagram.cacheKey,
      };
      data[MERMAID_DATA_KEY] = map;

      if (isMdxFile(ctx)) {
        return createMdxMermaidNode(stableId, map[stableId]!);
      }

      return { rawHtml: `<div data-mermaid-stable-id="${stableId}"></div>` };
    },
  });
}

/**
 * HAST plugin: companion to createMermaidMdastPlugin.
 *
 * rawHtml from the MDAST phase produces HAST `raw` nodes (opaque HTML strings).
 * This plugin uses the `raw` visitor to intercept those placeholders, looks up
 * the pre-rendered SVG from ctx.data, and returns a structured Element to replace
 * the raw node — no HTML serialisation or re-parsing of the large SVG.
 */
export function createMermaidHastPlugin() {
  return defineHastPlugin({
    name: "mermaid-svg-inject",
    raw(node: Readonly<HastRaw>, ctx: HastVisitorContext) {
      const match = node.value.match(/data-mermaid-stable-id="([^"]+)"/);
      if (!match) return;
      const stableId = match[1]!;

      const map = (ctx.data as Record<string, unknown>)[MERMAID_DATA_KEY] as
        | MermaidDataMap
        | undefined;
      const entry = map?.[stableId];
      if (!entry) return;

      // Returning a HastNode from a visitor replaces the current node.
      return {
        type: "element",
        tagName: "div",
        properties: {
          className: ["mermaid-diagram-container"],
          "data-diagram-src": entry.assetHref,
          "data-diagram-dark-src": entry.assetHrefDark,
          "data-diagram-stable-id": stableId,
          "data-diagram-cache-key": entry.cacheKey,
        },
        children: [entry.svgNode],
      } satisfies Element;
    },
  });
}
