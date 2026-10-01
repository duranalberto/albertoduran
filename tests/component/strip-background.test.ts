import StripBackground from "@components/ui/display/StripBackground.astro";
import { describe, expect, it } from "vitest";
import { render } from "./helpers/render";

describe("StripBackground", () => {
  it("renders identical markup on every build", async () => {
    expect(await render(StripBackground)).toBe(await render(StripBackground));
  });

  it("gives the two ribbon lanes distinct pattern ids that their fills use", async () => {
    const html = await render(StripBackground);
    const ids = [...html.matchAll(/<pattern[^>]*\bid="([^"]+)"/g)].map(
      (match) => match[1],
    );

    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(html).toContain(`fill="url(#${id})"`);
  });
});
