import { defineHastPlugin } from "satteri";
import type { Element } from "hast";
import type { HastVisitorContext } from "satteri";

export function createHeadingAnchorPlugin() {
  return defineHastPlugin({
    name: "heading-anchors",
    element: {
      filter: ["h3"],
      visit(node: Readonly<Element>, ctx: HastVisitorContext) {
        ctx.setProperty(node, "as", "h3");
      },
    },
  });
}
