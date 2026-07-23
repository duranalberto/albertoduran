import type { Icon, RibbonIcon } from "@appTypes/icon";

// Path data drops the leading zero and packs numbers together, so ".293.672" is
// two values. A naive /\d+\.\d+/ reads across that boundary as "293.672" and
// silently swallows a coordinate, so match leading-dot and signed forms first.
const NUMBER_RE = /-?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g;

function compressNumber(n: string, precision: number): string {
  const v = parseFloat(n);
  if (Number.isInteger(v)) return n;
  const fixed = v.toFixed(precision).replace(/\.?0+$/, "");
  // keep the compact "-.3" spelling the source path data already uses
  return fixed.replace(/^(-?)0\./, "$1.");
}

function compressSVGContent(content: string, precision = 1): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(NUMBER_RE, (match: string, offset: number, source: string) => {
      const compressed = compressNumber(match, precision);

      // Path data packs numbers without separators and leans on the leading "."
      // to tell them apart, so ".293.969" is two values. Rounding can delete the
      // very dot that kept them apart -- ".3" + "1" reads back as ".31", and
      // "3" + ".207" as "3.207" -- which drops a coordinate and shifts every one
      // after it. Restore a separator on whichever side lost its dot.
      const previous = source[offset - 1] ?? "";
      const next = source[offset + match.length];

      const lostLeadingDot = /\d/.test(previous) && !/^[-+.]/.test(compressed);
      const lostTrailingDot = !compressed.includes(".") && next === ".";

      return `${lostLeadingDot ? " " : ""}${compressed}${lostTrailingDot ? " " : ""}`;
    })
    .replace(/\s+/g, " ")
    .trim();
}

export const generateRibbonSVGData = (icons: Icon[], config: RibbonIcon) => {
  const { iconSize, gap, verticalPadding = 0 } = config;
  const totalIconWidth = Math.round(iconSize + gap);

  const svgWidth = icons.length * totalIconWidth;
  const svgHeight = Math.ceil(iconSize + verticalPadding * 2);
  const instanceId = Math.random().toString(36).substring(2, 5);

  const innerContent = icons
    .map((icon, index) => {
      const prefix = `rib_${instanceId}_${index}_`;
      const x = index * totalIconWidth;
      const y = verticalPadding;

      const compressed = compressSVGContent(icon.content);

      const scopedContent = compressed
        .replace(/id=["']([^"']+)["']/g, `id="${prefix}$1"`)
        .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
        .replace(/xlink:href=["']#([^"']+)["']/g, `xlink:href="#${prefix}$1"`)
        .replace(
          /(^|\s)href=["']#([^"']+)["']/g,
          `$1href="#${prefix}$2"`,
        );

      return `<g transform="translate(${x},${y})"><svg width="${iconSize}" height="${iconSize}" viewBox="${icon.viewBox || "0 0 128 128"}" preserveAspectRatio="xMidYMid meet">${scopedContent}</svg></g>`;
    })
    .join("");

  return {
    innerContent,
    svgWidth,
    svgHeight,
  };
};
