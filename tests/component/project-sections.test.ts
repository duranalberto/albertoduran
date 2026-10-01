import OutcomeBanner from "@components/projects/sections/OutcomeBanner.astro";
import ProjectSection from "@components/projects/sections/ProjectSection.astro";
import { describe, expect, it } from "vitest";
import { render } from "./helpers/render";

describe("ProjectSection", () => {
  it("labels the section with its derived heading id", async () => {
    const html = await render(ProjectSection, {
      props: { id: "runtime", title: "How it runs" },
      slots: { default: "<p>body</p>" },
    });

    expect(html).toMatch(
      /^<section id="runtime" class="w-full" aria-labelledby="runtime-title"/,
    );
    expect(html).toMatch(/id="runtime-title"[^>]*>[\s\S]*How it runs/);
    expect(html).toContain("<p>body</p>");
  });

  it("passes an optional header link through", async () => {
    const html = await render(ProjectSection, {
      props: { id: "s", title: "T", linkHref: "/x/", linkLabel: "More" },
    });

    expect(html).toContain('href="/x/"');
    expect(html).toContain("More");
  });
});

describe("OutcomeBanner", () => {
  it("renders the eyebrow, a labelled h2 and the body", async () => {
    const html = await render(OutcomeBanner, {
      props: { title: "It works." },
      slots: { default: "<p>details</p>" },
    });

    expect(html).toMatch(
      /^<section id="outcome"[^>]*aria-labelledby="outcome-title"/,
    );
    expect(html).toContain("The outcome");
    expect(html).toMatch(/<h2 id="outcome-title"[^>]*>\s*It works\.\s*<\/h2>/);
    expect(html.indexOf("<p>details</p>")).toBeGreaterThan(
      html.indexOf("</h2>"),
    );
  });
});
