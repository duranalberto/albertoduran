import { describe, expect, it, vi } from "vitest";
import { markdownToHtml, mdxToJs } from "satteri";
import { createEChartsMdastPlugin } from "@integrations/echarts/satteri-plugin";

const chartFence = [
  "```echart",
  JSON.stringify(
    {
      type: "line",
      figure: {
        title: "Revenue",
        description: "Revenue by quarter",
      },
      size: { width: 360, height: 220 },
      data: {
        x: ["Q1", "Q2"],
        y: [1, 2],
        name: "Revenue",
      },
    },
    null,
    2,
  ),
  "```",
].join("\n");

describe("ECharts Satteri plugin", () => {
  it("replaces markdown echart fences with chart shell HTML", async () => {
    const result = await markdownToHtml(
      ["Before", "", chartFence, "", "After"].join("\n"),
      {
        mdastPlugins: [createEChartsMdastPlugin()],
      },
    );

    expect(result.html).toContain("<echart-shell");
    expect(result.html).toContain("Revenue");
    expect(result.html).toContain("<svg");
    expect(result.html).not.toContain("```echart");
  });

  it("replaces MDX echart fences without component imports", async () => {
    const result = await mdxToJs(chartFence, {
      mdastPlugins: [createEChartsMdastPlugin()],
      jsxImportSource: "astro",
      fileURL: new URL("file:///fixtures/article.mdx"),
    });

    expect(result.code).toContain("echart-shell");
    expect(result.code).toContain("Revenue by quarter");
    expect(result.code).not.toContain("EChart");
    expect(result.code).not.toContain("lineChartOption");
  });

  it("consumes skipped echart fences without rendering them", async () => {
    const shouldRenderChart = vi.fn(() => false);
    const result = await mdxToJs(chartFence, {
      mdastPlugins: [createEChartsMdastPlugin({ shouldRenderChart })],
      jsxImportSource: "astro",
      fileURL: new URL("file:///fixtures/draft.mdx"),
    });

    expect(shouldRenderChart).toHaveBeenCalledOnce();
    expect(result.code).not.toContain("echart-shell");
    expect(result.code).not.toContain("Revenue by quarter");
  });

  it("leaves non-echart code fences alone", async () => {
    const result = await markdownToHtml(
      ["```ts", "const value = 1;", "```"].join("\n"),
      {
        mdastPlugins: [createEChartsMdastPlugin()],
      },
    );

    expect(result.html).toContain("const value = 1");
    expect(result.html).not.toContain("echart-shell");
  });

  it("fails clearly for invalid definitions", () => {
    expect(() =>
      mdxToJs(["```echart", "{}", "```"].join("\n"), {
        mdastPlugins: [createEChartsMdastPlugin()],
        jsxImportSource: "astro",
        fileURL: new URL("file:///fixtures/missing.mdx"),
      }),
    ).toThrow(/echart fence in \/fixtures\/missing\.mdx: type is required/);
  });
});
