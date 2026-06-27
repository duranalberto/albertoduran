import { defineMdastPlugin } from "satteri";
import { createHash } from "node:crypto";
import type { Code } from "mdast";
import type { MdxJsxFlowElement, MdxJsxAttributeNode } from "satteri";
import type { RegisteredDiagram } from "./pipeline.ts";

interface MdastCtx {
  data: Record<string, unknown>;
  fileURL?: unknown;
}

export interface MermaidSatteriPluginConfig {
  getDiagram: (
    stableId: string,
    code: string,
  ) => RegisteredDiagram | null | undefined;
  shouldRenderDiagram?: (fileURL: URL | undefined) => boolean;
}

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

function getDiagramType(code: string): string {
  const keyword = code.trim().match(/^([A-Za-z][\w-]*)/)?.[1] ?? "diagram";

  if (keyword === "graph") return "flowchart";
  if (keyword.startsWith("stateDiagram")) return "state";
  if (keyword.startsWith("sequenceDiagram")) return "sequence";
  if (keyword.startsWith("classDiagram")) return "class";
  if (keyword.startsWith("erDiagram")) return "entity relationship";
  if (keyword.startsWith("gitGraph")) return "git graph";
  if (keyword.startsWith("xychart")) return "chart";

  return keyword.replace(/-/g, " ");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createMdxMermaidNode(
  stableId: string,
  diagram: RegisteredDiagram,
  diagramType: string,
): MdxJsxFlowElement {
  return {
    type: "mdxJsxFlowElement",
    name: "MermaidDiagramWrapper",
    attributes: [
      attr("class", "mermaid-diagram-container"),
      attr("data-diagram-src", diagram.assetHref),
      attr("data-diagram-dark-src", diagram.assetHrefDark),
      attr("data-diagram-stable-id", stableId),
      attr("data-diagram-cache-key", diagram.cacheKey),
      attr("data-diagram-type", diagramType),
    ],
    children: [],
  };
}

function createStaticMermaidHtml(
  stableId: string,
  diagram: RegisteredDiagram,
  diagramType: string,
): string {
  if (!diagram.assetHref) {
    return '<div class="mermaid-error">Failed to render Mermaid diagram.</div>';
  }

  const label = `${diagramType.charAt(0).toUpperCase()}${diagramType.slice(1)} diagram`;
  const lightSrc = escapeHtml(diagram.assetHref);
  const darkSrc = escapeHtml(diagram.assetHrefDark || diagram.assetHref);

  return [
    `<div class="mermaid-diagram-container" data-diagram-src="${lightSrc}" data-diagram-dark-src="${darkSrc}" data-diagram-stable-id="${escapeHtml(stableId)}" data-diagram-cache-key="${escapeHtml(diagram.cacheKey)}" data-diagram-type="${escapeHtml(diagramType)}">`,
    `<img class="mermaid-diagram-image mermaid-diagram-image-light" src="${lightSrc}" alt="${escapeHtml(label)}" decoding="async">`,
    `<img class="mermaid-diagram-image mermaid-diagram-image-dark" src="${darkSrc}" alt="" aria-hidden="true" decoding="async">`,
    "</div>",
  ].join("");
}

function createSkippedMermaidNode(): { rawHtml: string } {
  return { rawHtml: "" };
}

export function createMermaidMdastPlugin(config: MermaidSatteriPluginConfig) {
  return defineMdastPlugin({
    name: "mermaid",
    code(node: Readonly<Code>, ctx: MdastCtx) {
      if (node.lang !== "mermaid") return;
      const fileURL = getFileURL(ctx);
      if (config.shouldRenderDiagram?.(fileURL) === false) {
        return createSkippedMermaidNode();
      }

      const code = node.value.trim();
      const stableId = getStableId(code);
      const diagram = config.getDiagram(stableId, code);

      if (!diagram) {
        throw new Error(
          `[mermaid] Diagram "${stableId}" was not prepared before Markdown rendering.`,
        );
      }

      const diagramType = getDiagramType(code);

      if (isMdxFile(ctx)) {
        return createMdxMermaidNode(stableId, diagram, diagramType);
      }

      return { rawHtml: createStaticMermaidHtml(stableId, diagram, diagramType) };
    },
  });
}
