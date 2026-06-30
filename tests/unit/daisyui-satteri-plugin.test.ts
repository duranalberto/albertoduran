import { describe, expect, it } from "vitest";
import { markdownToHtml, mdxToJs } from "satteri";
import { createDaisyUiMdastPlugin } from "@integrations/daisyui/satteri-plugin";

const calloutFence = [
  "```daisyui",
  JSON.stringify(
    {
      component: "callout",
      variant: "information",
      title: "Build context",
      content: [
        {
          type: "paragraph",
          text: "Generated during the deterministic test build.",
        },
      ],
    },
    null,
    2,
  ),
  "```",
].join("\n");

describe("DaisyUI Satteri plugin", () => {
  it("replaces markdown daisyui fences with static component HTML", async () => {
    const result = await markdownToHtml(
      ["Before", "", calloutFence, "", "After"].join("\n"),
      {
        mdastPlugins: [createDaisyUiMdastPlugin()],
      },
    );

    expect(result.html).toContain("<aside");
    expect(result.html).toContain("callout-information");
    expect(result.html).toContain("Build context");
    expect(result.html).not.toContain("```daisyui");
  });

  it("replaces MDX daisyui fences without component imports", async () => {
    const result = await mdxToJs(calloutFence, {
      mdastPlugins: [createDaisyUiMdastPlugin()],
      jsxImportSource: "astro",
      fileURL: new URL("file:///fixtures/article.mdx"),
    });

    expect(result.code).toContain("callout-information");
    expect(result.code).toContain("Generated during");
    expect(result.code).not.toContain("Callout");
  });

  it("leaves non-daisyui code fences alone", async () => {
    const result = await markdownToHtml(
      ["```ts", "const value = 1;", "```"].join("\n"),
      {
        mdastPlugins: [createDaisyUiMdastPlugin()],
      },
    );

    expect(result.html).toContain("const value = 1");
    expect(result.html).not.toContain("callout-card");
  });

  it("fails clearly for invalid definitions", () => {
    expect(() =>
      mdxToJs(["```daisyui", "{}", "```"].join("\n"), {
        mdastPlugins: [createDaisyUiMdastPlugin()],
        jsxImportSource: "astro",
        fileURL: new URL("file:///fixtures/missing.mdx"),
      }),
    ).toThrow(
      /daisyui fence in \/fixtures\/missing\.mdx: component is required/,
    );
  });
});
