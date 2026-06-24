import { describe, expect, it } from "vitest";
import {
  satteriCreateHighlightFn,
  satteriHighlightPlugin,
} from "@astrojs/markdown-satteri";
import { mdxToJs } from "satteri";
import { createCodeBlockPlugin } from "@integrations/satteri-code-blocks";

describe("Satteri code block wrapper", () => {
  it("wraps highlighted MDX code blocks in the project code shell", async () => {
    const highlightFn = await satteriCreateHighlightFn("shiki", {
      themes: {
        light: "one-light",
        dark: "one-dark-pro",
      },
      defaultColor: "light",
      transformers: [
        {
          line(node, line) {
            node.properties["data-line"] = line;
          },
        },
      ],
    });

    const result = await mdxToJs(
      ["```js", "const answer = 42;", "```"].join("\n"),
      {
        hastPlugins: [
          satteriHighlightPlugin(highlightFn, undefined, { mdx: true }),
          createCodeBlockPlugin(),
        ],
        jsxImportSource: "astro",
      },
    );

    expect(result.code).toContain("mockup-code");
    expect(result.code).toContain("overflow-x-auto");
    expect(result.code).toContain("<code><span");
    expect(result.code).not.toContain("<pre");
    expect(result.code).not.toContain("astro-code astro-code-themes");
    expect(result.code).toContain("data-line");
    expect(result.code).not.toContain("[object Object]");
  });
});
