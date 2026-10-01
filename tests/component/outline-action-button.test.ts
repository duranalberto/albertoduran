import OutlineActionButton from "@components/ui/primitive/OutlineActionButton.astro";
import { describe, expect, it } from "vitest";
import { render } from "./helpers/render";

describe("OutlineActionButton", () => {
  it("renders an outline button with the shared hover fill plus extra classes", async () => {
    const html = await render(OutlineActionButton, {
      props: { href: "/x/", label: "Repository", class: "w-32" },
    });
    const classes = html.match(/class="([^"]*)"/)?.[1]?.split(/\s+/) ?? [];

    expect(classes).toEqual(
      expect.arrayContaining([
        "btn-outline",
        "border-base-300",
        "hover:bg-primary",
        "hover:text-primary-content",
        "w-32",
      ]),
    );
    expect(html).toContain('href="/x/"');
  });
});
