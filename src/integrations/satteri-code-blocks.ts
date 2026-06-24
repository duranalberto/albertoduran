import { defineHastPlugin } from "satteri";
import type { Element, RootContent } from "hast";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import type {
  MdxJsxAttributeNode,
  MdxJsxFlowElementHast,
} from "satteri";

const CODE_BLOCK_CLASS =
  "mockup-code my-8 border border-base-300 shadow-2xl text-sm bg-base-200";

function getAttr(
  node: Readonly<MdxJsxFlowElementHast>,
  name: string,
): MdxJsxAttributeNode | undefined {
  return node.attributes.find(
    (attribute): attribute is MdxJsxAttributeNode =>
      attribute.type === "mdxJsxAttribute" && attribute.name === name,
  );
}

function isElement(node: RootContent | undefined): node is Element {
  return node?.type === "element";
}

function hasClass(node: Element, className: string): boolean {
  const value = node.properties?.className;

  if (Array.isArray(value)) {
    return value.includes(className);
  }

  return typeof value === "string" && value.split(/\s+/).includes(className);
}

function extractCodeElement(html: string): string | undefined {
  if (!html.startsWith('<pre class="astro-code')) return;

  const root = fromHtml(html, { fragment: true });
  const pre = root.children.find(
    (child): child is Element => isElement(child) && child.tagName === "pre",
  );

  if (!pre || !hasClass(pre, "astro-code")) return;

  const code = pre.children.find(
    (child): child is Element => isElement(child) && child.tagName === "code",
  );

  return code ? toHtml(code) : undefined;
}

function wrapHighlightedCode(html: string): string {
  const codeHtml = extractCodeElement(html);
  if (!codeHtml) return html;

  return [
    '<div class="not-prose">',
    `<div class="${CODE_BLOCK_CLASS}">`,
    '<div class="overflow-x-auto">',
    codeHtml,
    "</div>",
    "</div>",
    "</div>",
  ].join("");
}

export function createCodeBlockPlugin() {
  return defineHastPlugin({
    name: "code-block-wrapper",
    mdxJsxFlowElement: {
      filter: ["Fragment"],
      visit(node: Readonly<MdxJsxFlowElementHast>) {
        const setHtml = getAttr(node, "set:html");
        if (typeof setHtml?.value !== "string") return;

        const wrapped = wrapHighlightedCode(setHtml.value);
        if (wrapped === setHtml.value) return;

        return {
          ...node,
          attributes: node.attributes.map((attribute) =>
            attribute === setHtml ? { ...attribute, value: wrapped } : attribute,
          ),
        } satisfies MdxJsxFlowElementHast;
      },
    },
  });
}
