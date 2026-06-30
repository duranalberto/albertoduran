import { defineMdastPlugin } from "satteri";
import type { Code } from "mdast";
import type { MdxJsxFlowElement } from "satteri";
import { parseDaisyUiFenceDefinition } from "./definition.ts";
import { renderDaisyUiMarkup } from "./markup.ts";

interface MdastCtx {
  data: Record<string, unknown>;
  fileURL?: unknown;
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

export function createDaisyUiMdastPlugin() {
  return defineMdastPlugin({
    name: "daisyui",
    code(node: Readonly<Code>, ctx: MdastCtx) {
      if (node.lang !== "daisyui") return;

      const definition = parseDaisyUiFenceDefinition(node.value.trim(), {
        fileURL: getFileURL(ctx),
        fenceLang: node.lang,
      });
      const rendered = renderDaisyUiMarkup(definition);

      if (isMdxFile(ctx)) {
        return createMdxHtmlNode(rendered.html);
      }

      return { rawHtml: rendered.html };
    },
  });
}
