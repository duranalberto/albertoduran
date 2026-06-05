import { afterEach, describe, expect, it, vi } from "vitest";
import { generateRibbonSVGData } from "@utils/ribbon";
import type { Icon } from "@appTypes/icon";

describe("generateRibbonSVGData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("computes dimensions and scopes repeated SVG ids and references", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.12345);

    const icons: Icon[] = [
      {
        text: "paint",
        viewBox: "0 0 24 24",
        content: `
          <!-- dropped -->
          <defs><linearGradient id="paint"><stop offset="0.3333" /></linearGradient></defs>
          <rect fill="url(#paint)" />
          <use href="#paint" />
          <use xlink:href="#paint" />
        `,
      },
      {
        text: "dot",
        content: `<circle id="dot" cx="12.500" cy="12.250" r="5.000" />`,
        viewBox: "0 0 24 24",
      },
    ];

    const result = generateRibbonSVGData(icons, {
      iconSize: 24,
      gap: 4,
      verticalPadding: 2,
    });

    expect(result.svgWidth).toBe(56);
    expect(result.svgHeight).toBe(28);
    expect(result.innerContent).not.toContain("<!--");
    expect(result.innerContent).toContain('id="rib_4fz_0_paint"');
    expect(result.innerContent).toContain("url(#rib_4fz_0_paint)");
    expect(result.innerContent).toContain('href="#rib_4fz_0_paint"');
    expect(result.innerContent).toContain('xlink:href="#rib_4fz_0_paint"');
    expect(result.innerContent).toContain('id="rib_4fz_1_dot"');
    expect(result.innerContent).toContain('cx="12.5"');
  });
});
