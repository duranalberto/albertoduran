import { defineMdastPlugin } from "satteri";
import type { Code } from "mdast";
import type { MdxJsxFlowElement } from "satteri";
import { parseEChartFenceDefinition } from "./definition.ts";
import { renderEChartMarkup } from "./markup.ts";
import { compileEChartDefinition } from "./presets.ts";

interface MdastCtx {
  data: Record<string, unknown>;
  fileURL?: unknown;
}

export interface EChartsSatteriPluginConfig {
  shouldRenderChart?: (fileURL: URL | undefined) => boolean;
}

function getFileURL(ctx: MdastCtx): URL | undefined {
  return ctx.fileURL instanceof URL ? ctx.fileURL : undefined;
}

function isMdxFile(ctx: MdastCtx): boolean {
  return getFileURL(ctx)?.pathname.endsWith(".mdx") ?? false;
}

function createMdxHtmlNode(html: string): MdxJsxFlowElement {
  return {
    type: "mdxJsxFlowElement",
    name: "Fragment",
    attributes: [{ type: "mdxJsxAttribute", name: "set:html", value: html }],
    children: [],
  };
}

export function createEChartsMdastPlugin(
  config: EChartsSatteriPluginConfig = {},
) {
  return defineMdastPlugin({
    name: "echarts",
    code(node: Readonly<Code>, ctx: MdastCtx) {
      if (node.lang !== "echart") return;

      const fileURL = getFileURL(ctx);
      if (config.shouldRenderChart?.(fileURL) === false) {
        return { rawHtml: "" };
      }

      const definition = parseEChartFenceDefinition(node.value.trim(), {
        fileURL,
        fenceLang: node.lang,
      });
      const compiled = compileEChartDefinition(definition);
      const rendered = renderEChartMarkup({
        option: compiled.option,
        clientOption: compiled.clientOption,
        width: definition.width,
        height: definition.height,
        render: definition.render,
        hydrate: definition.hydrate,
        title: definition.figure.title,
        caption: definition.figure.caption,
        description: definition.figure.description,
        className: definition.className,
        id: definition.id,
        media: definition.media,
        theme: definition.theme,
        aria: definition.aria,
        cacheKey: definition.cacheKey,
        optionClientPreset: definition.optionClientPreset,
      });

      if (isMdxFile(ctx)) {
        return createMdxHtmlNode(rendered.html);
      }

      return { rawHtml: rendered.html };
    },
  });
}
