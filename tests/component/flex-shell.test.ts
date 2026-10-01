import FlexShell from "@layouts/FlexShell.astro";
import { describe, expect, it } from "vitest";
import { render } from "./helpers/render";

const classOf = (html: string) =>
  (html.match(/^<\w+[^>]*\bclass="([^"]*)"/)?.[1] ?? "").split(/\s+/);

describe("FlexShell", () => {
  it("renders its slot inside a centered, full-width container", async () => {
    const html = await render(FlexShell, {
      props: { id: "shell", class: "extra" },
      slots: { default: "<p>slot content</p>" },
    });

    expect(html).toContain('id="shell"');
    expect(html).toContain("<p>slot content</p>");
    expect(classOf(html)).toEqual(
      expect.arrayContaining(["mx-auto", "w-full", "extra"]),
    );
  });

  it("renders the requested element tag", async () => {
    const html = await render(FlexShell, { props: { as: "section" } });

    expect(html).toMatch(/^<section\b/);
  });

  it("applies literal horizontal gutters and no vertical padding", async () => {
    const classes = classOf(await render(FlexShell));

    expect(classes).toEqual(
      expect.arrayContaining(["px-4", "md:px-8", "max-w-screen-2xl"]),
    );
    expect(classes.filter((name) => /(^|:)(py|pt|pb)-/.test(name))).toEqual([]);
  });

  it("lets callers own vertical padding through class", async () => {
    const classes = classOf(
      await render(FlexShell, { props: { class: "py-4 md:py-0" } }),
    );

    expect(classes).toEqual(expect.arrayContaining(["py-4", "md:py-0"]));
  });
});
