import ProjectStat from "@components/projects/ProjectStat.astro";
import { describe, expect, it } from "vitest";
import { render } from "./helpers/render";

describe("ProjectStat", () => {
  it("renders a resolved value and its label", async () => {
    const html = await render(ProjectStat, {
      props: { stat: { value: "50", label: "topics" } },
    });

    expect(html).toMatch(/<strong[^>]*>\s*50\s*<\/strong>/);
    expect(html).toContain("topics");
    expect(html).toContain("data-project-stat");
  });
});
