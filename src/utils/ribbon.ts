import type { Icon, RibbonIcon } from "@appTypes/icon";

const NUMBER_RE = /(\d+\.\d+|\d+)/g;

function compressNumber(n: string, precision: number): string {
  const v = parseFloat(n);
  if (Number.isInteger(v)) return n;
  const fixed = v.toFixed(precision);
  return fixed.replace(/\.?0+$/, "");
}

function compressSVGContent(content: string, precision = 1): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(NUMBER_RE, (match) => compressNumber(match, precision))
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
        .replace(/href=["']#([^"']+)["']/g, `href="#${prefix}$1"`)
        .replace(/xlink:href=["']#([^"']+)["']/g, `xlink:href="#${prefix}$1"`);

      return `<g transform="translate(${x},${y})"><svg width="${iconSize}" height="${iconSize}" viewBox="${icon.viewBox || "0 0 128 128"}" preserveAspectRatio="xMidYMid meet">${scopedContent}</svg></g>`;
    })
    .join("");

  return {
    innerContent,
    svgWidth,
    svgHeight,
  };
};
