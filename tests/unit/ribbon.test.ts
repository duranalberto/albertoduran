import { afterEach, describe, expect, it, vi } from "vitest";
import { generateRibbonSVGData } from "@utils/ribbon";
import { skills } from "@data/icons";
import type { Icon } from "@appTypes/icon";

// SVG path numbers may be signed, exponential, or written without a leading zero
const PATH_NUMBER = /-?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g;

const allDAttributes = (markup: string) =>
  [...markup.matchAll(/\sd="([^"]+)"/g)].map((match) => match[1]!);

const dAttribute = (markup: string) => allDAttributes(markup)[0]!;

const readNumbers = (path: string) =>
  (path.match(PATH_NUMBER) ?? []).map(Number);

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

  it("keeps packed path numbers separated when rounding removes their dot", () => {
    // Compact path data omits the leading zero and leans on the "." to separate
    // values, so "3.032.207" and ".293.969" are each two numbers. Rounding can
    // delete that dot -- "3" + ".207" reads back as 3.207, ".3" + "1" as .31 --
    // which swallows a coordinate and shifts every one that follows.
    const icons: Icon[] = [
      {
        text: "packed",
        viewBox: "0 0 128 128",
        content: `<path d="M1.347 3.032.207.336.293.969 5Z" />`,
      },
    ];

    const { innerContent } = generateRibbonSVGData(icons, {
      iconSize: 24,
      gap: 4,
    });

    expect(readNumbers(dAttribute(innerContent))).toEqual([
      1.3, 3, 0.2, 0.3, 0.3, 1, 5,
    ]);
  });

  it("preserves the coordinate sequence of every shipped skill icon", () => {
    for (const [name, icon] of Object.entries(skills)) {
      const { innerContent } = generateRibbonSVGData([icon], {
        iconSize: 50,
        gap: 58,
        verticalPadding: 24,
      });

      const before = allDAttributes(icon.content);
      const after = allDAttributes(innerContent);
      expect(after, `${name}: path count`).toHaveLength(before.length);

      before.forEach((path, index) => {
        const source = readNumbers(path);
        const compressed = readNumbers(after[index]!);

        expect(compressed, `${name}: path ${index} count`).toHaveLength(
          source.length,
        );

        const drift = Math.max(
          ...source.map((value, i) => Math.abs(value - compressed[i]!)),
          0,
        );
        expect(drift, `${name}: path ${index} drift`).toBeLessThanOrEqual(0.051);
      });
    }
  });
});
