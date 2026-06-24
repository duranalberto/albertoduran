import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const normalizeCssUrl = new URL(
  "../../src/styles/base/_normalize.css",
  import.meta.url,
);

describe("root scroll CSS", () => {
  it("keeps document scrolling native and Safari scrollbar hit-testing safe", async () => {
    const css = await readFile(normalizeCssUrl, "utf-8");

    expect(css).not.toMatch(/overscroll-behavior-y:\s*none/);
    expect(css).toContain("--page-scroll-gutter: stable;");
    expect(css).toContain(
      "@supports (font: -apple-system-body) or (-webkit-touch-callout: none)",
    );
    expect(css).toContain("--page-scroll-gutter: auto;");
  });
});
