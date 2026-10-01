import PageHero from "@components/shared/PageHero.astro";
import { describe, expect, it } from "vitest";
import { render } from "./helpers/render";

describe("PageHero", () => {
  it("renders a decorative eyebrow above the primary column", async () => {
    const html = await render(PageHero, {
      props: { eyebrow: "Projects" },
      slots: { default: "<h1>Title</h1>" },
    });

    expect(html).toMatch(
      /<div class="hero-eyebrow" aria-hidden="true"[^>]*>\s*<span class="hero-eyebrow-line"[^>]*><\/span>\s*<p class="hero-eyebrow-label"[^>]*>Projects<\/p>/,
    );
    expect(html.indexOf("hero-eyebrow")).toBeLessThan(html.indexOf("<h1>"));
  });

  it("places the default, aside and footer slots in their containers", async () => {
    const html = await render(PageHero, {
      props: { eyebrow: "E" },
      slots: {
        default: "<p>primary</p>",
        aside: "<div>aside</div>",
        footer: "<div>footer</div>",
      },
    });
    const primary = html.indexOf('class="hero-primary');
    const gridEnd = html.indexOf("<div>footer</div>");

    expect(primary).toBeGreaterThan(-1);
    expect(html.indexOf("<p>primary</p>")).toBeGreaterThan(primary);
    expect(html.indexOf("<div>aside</div>")).toBeGreaterThan(
      html.indexOf("<p>primary</p>"),
    );
    expect(gridEnd).toBeGreaterThan(html.indexOf("<div>aside</div>"));
  });

  it("passes section attributes and layout classes through", async () => {
    const html = await render(PageHero, {
      props: {
        eyebrow: "E",
        class: "font-sans",
        primaryClass: "xl:col-span-7",
        gridClass: "items-center",
        "aria-labelledby": "title",
      },
    });

    expect(html).toMatch(/^<section class="hero-section font-sans"/);
    expect(html).toContain('aria-labelledby="title"');
    expect(html).toMatch(/class="hero-grid items-center"/);
    expect(html).toMatch(/class="hero-primary xl:col-span-7"/);
  });
});
