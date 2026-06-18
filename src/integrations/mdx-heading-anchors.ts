import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

export function rehypeMdxHeadingAnchors() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h3") return;

      node.properties = {
        ...node.properties,
        as: "h3",
      };
    });
  };
}
