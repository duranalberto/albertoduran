import { defineMdastPlugin } from "satteri";
import type { Code } from "mdast";
import type { MdxJsxFlowElement, MdxJsxAttributeNode } from "satteri";
import { toHtml } from "hast-util-to-html";
import {
  getMermaidDiagramType,
  getMermaidStableId,
  normalizeMermaidDefinition,
} from "./definition.ts";
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

function isMdxFile(ctx: MdastCtx): boolean {
  return getFileURL(ctx)?.pathname.endsWith(".mdx") ?? false;
}

function getFileURL(ctx: MdastCtx): URL | undefined {
  return ctx.fileURL instanceof URL ? ctx.fileURL : undefined;
}

function attr(name: string, value: string): MdxJsxAttributeNode {
  return { type: "mdxJsxAttribute", name, value };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Reads the diagram's intrinsic pixel dimensions from the rendered SVG's
 * `viewBox` (format: "minX minY width height"). The `<img>` assets carry
 * unreliable intrinsic sizes (often `width="0" height="0"`), so the viewBox is
 * the only trustworthy source of the aspect ratio. Consumers use it to stamp an
 * explicit `aspect-ratio` on the images so the expand popover can fit them to
 * the viewport without depending on the flaky intrinsic size.
 */
function getDiagramDimensions(
  diagram: RegisteredDiagram,
): { width: number; height: number } | null {
  const viewBox = diagram.node.properties?.viewBox;
  if (typeof viewBox !== "string") return null;
  const parts = viewBox.trim().split(/[\s,]+/);
  const w = Number.parseFloat(parts[2] ?? "");
  const h = Number.parseFloat(parts[3] ?? "");
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return { width: w, height: h };
}

/**
 * Serialises the rendered diagram to inline SVG markup. Inlining (rather than an
 * `<img src>`) is what makes the diagram's `<foreignObject>` label text
 * selectable and lets the SVG's own multi-theme CSS respond to the page's
 * `[data-theme]`. Returns null for render failures (node is a fallback `<div>`).
 */
function serializeInlineSvg(diagram: RegisteredDiagram): string | null {
  if (diagram.node.tagName !== "svg") return null;
  return toHtml(diagram.node, { space: "svg" });
}

/**
 * Builds the inline `style` value that pins the diagram's aspect ratio and
 * natural size as custom properties, consumed by the reading-view/popover sizing
 * rules in `_diagram.css`.
 */
function diagramSizeStyle(dims: { width: number; height: number }): string {
  const ratio = (dims.width / dims.height).toFixed(4);
  return `aspect-ratio: ${dims.width} / ${dims.height}; --diagram-ar: ${ratio}; --diagram-w: ${dims.width}px; --diagram-h: ${dims.height}px;`;
}

function createMdxMermaidNode(
  stableId: string,
  diagram: RegisteredDiagram,
  diagramType: string,
): MdxJsxFlowElement {
  const dims = getDiagramDimensions(diagram);
  const svgHtml = serializeInlineSvg(diagram);
  const attributes: MdxJsxAttributeNode[] = [
    attr("class", "mermaid-diagram-container"),
    attr("data-diagram-src", diagram.assetHref),
    attr("data-diagram-dark-src", diagram.assetHrefDark),
    attr("data-diagram-stable-id", stableId),
    attr("data-diagram-cache-key", diagram.cacheKey),
    attr("data-diagram-type", diagramType),
  ];

  if (dims) {
    attributes.push(
      attr("data-diagram-width", String(dims.width)),
      attr("data-diagram-height", String(dims.height)),
    );
  }

  // The inline SVG can be tens of KB and contains quotes/braces, so pass it as
  // base64 to keep it opaque to the MDX attribute serialiser; the component
  // decodes it and renders it with `set:html`.
  if (svgHtml) {
    attributes.push(
      attr("data-diagram-svg", Buffer.from(svgHtml, "utf8").toString("base64")),
    );
  }

  return {
    type: "mdxJsxFlowElement",
    name: "MermaidDiagramWrapper",
    attributes,
    children: [],
  };
}

function createStaticMermaidHtml(
  stableId: string,
  diagram: RegisteredDiagram,
  diagramType: string,
): string {
  const svgHtml = serializeInlineSvg(diagram);
  if (!diagram.assetHref || !svgHtml) {
    return '<div class="mermaid-error">Failed to render Mermaid diagram.</div>';
  }

  const lightSrc = escapeHtml(diagram.assetHref);
  const darkSrc = escapeHtml(diagram.assetHrefDark || diagram.assetHref);

  const dims = getDiagramDimensions(diagram);
  const figureStyle = dims ? ` style="${diagramSizeStyle(dims)}"` : "";
  const dimAttrs = dims
    ? ` data-diagram-width="${dims.width}" data-diagram-height="${dims.height}"`
    : "";

  return [
    `<div class="mermaid-diagram-container" data-diagram-src="${lightSrc}" data-diagram-dark-src="${darkSrc}" data-diagram-stable-id="${escapeHtml(stableId)}" data-diagram-cache-key="${escapeHtml(diagram.cacheKey)}" data-diagram-type="${escapeHtml(diagramType)}"${dimAttrs}>`,
    `<div class="mermaid-diagram-image"${figureStyle}>${svgHtml}</div>`,
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

      const code = normalizeMermaidDefinition(node.value);
      const stableId = getMermaidStableId(code);
      const diagram = config.getDiagram(stableId, code);

      if (!diagram) {
        throw new Error(
          `[mermaid] Diagram "${stableId}" was not prepared before Markdown rendering.`,
        );
      }

      const diagramType = getMermaidDiagramType(code);

      if (isMdxFile(ctx)) {
        return createMdxMermaidNode(stableId, diagram, diagramType);
      }

      return { rawHtml: createStaticMermaidHtml(stableId, diagram, diagramType) };
    },
  });
}
