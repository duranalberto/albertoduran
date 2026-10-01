import ProjectVisual from "@components/projects/ProjectVisual.astro";
import ChatVisual from "@components/projects/visuals/ChatVisual.astro";
import FlowVisual from "@components/projects/visuals/FlowVisual.astro";
import TerminalVisual from "@components/projects/visuals/TerminalVisual.astro";
import { describe, expect, it } from "vitest";
import { render } from "./helpers/render";

describe("project visual renderers", () => {
  it("draws terminal segments in their tone and keeps blank lines", async () => {
    const html = await render(TerminalVisual, {
      props: { lines: [[["$", "prompt"], " run"], [""]] },
    });

    expect(html).toMatch(
      /<span class="project-visual-prompt"[^>]*>\$<\/span> run/,
    );
    expect(html.match(/class="project-visual-line"/g)).toHaveLength(2);
  });

  it("numbers flow steps and marks the human checkpoint", async () => {
    const html = await render(FlowVisual, {
      props: {
        head: ["A", "B"],
        steps: ["Load", "Review"],
        checkpoint: "Review",
      },
    });

    expect(html).toMatch(/<span[^>]*>01<\/span>\s*Load/);
    expect(html).toMatch(
      /<li data-checkpoint[^>]*>[\s\S]*Review[\s\S]*<em[^>]*>human check<\/em>/,
    );
  });

  it("renders chat lines with line breaks and inline formatting", async () => {
    const html = await render(ChatVisual, {
      props: {
        head: ["Bot", "alerts"],
        messages: [
          {
            author: "Bot",
            lines: [["Drop"], [["$2", "strike"], " → ", ["$1", "strong"]]],
          },
        ],
        note: "Sample",
      },
    });

    expect(html).toMatch(
      /Drop\s*<br[^>]*>\s*<s[^>]*>\$2<\/s> → <strong[^>]*>\$1<\/strong>/,
    );
    expect(html).toContain("Sample");
  });

  it("picks the renderer from the registry by kind", async () => {
    const ranges = await render(ProjectVisual, {
      props: { visual: "eve-ranges" },
    });
    const flow = await render(ProjectVisual, {
      props: { visual: "equilyze-agents" },
    });

    expect(ranges).toContain('data-project-visual="eve-ranges"');
    expect(ranges).toContain("composite $51.20, sample data");
    expect(flow).toContain('class="project-visual-flow"');
  });
});
