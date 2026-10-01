import ArrowLink from "@components/ui/navigation/ArrowLink.astro";
import { describe, expect, it } from "vitest";
import { render } from "./helpers/render";

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

describe("ArrowLink", () => {
  it("renders an inline link with the arrow after the text", async () => {
    const html = await render(ArrowLink, {
      props: { href: "/thejournal/a/", class: "mt-6" },
      slots: { default: "Read more" },
    });

    expect(html).toMatch(/^<a [^>]*href="\/thejournal\/a\/"/);
    expect(html).toMatch(/class="[^"]*\bfont-bold\b[^"]*\bmt-6\b/);
    expect(text(html)).toBe("Read more &rarr;");
    expect(html).not.toContain("target=");
  });

  it("renders an action link with a decorative arrow", async () => {
    const html = await render(ArrowLink, {
      props: {
        href: "https://example.test/",
        variant: "action",
        external: true,
      },
      slots: { default: "View award" },
    });

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toMatch(
      /<span class="[^"]*group-hover:translate-x-0\.5[^"]*" aria-hidden="true"[^>]*>\s*→\s*<\/span>/,
    );
    // The link is inline-flex with a gap, so no text space is needed.
    expect(text(html)).toBe("View award→");
  });
});
