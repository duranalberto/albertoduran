// utils/ribbon.ts
import type { Icon, RibbonIcon } from "@appTypes/icon";

export const generateRibbonSVGData = (icons: Icon[], config: RibbonIcon) => {
  const { iconSize, gap, verticalPadding = 0 } = config;
  const totalIconWidth = iconSize + gap;
  const svgWidth = icons.length * totalIconWidth;
  const svgHeight = iconSize + verticalPadding * 2;

  const innerContent = icons
    .map((icon, index) => {
      const prefix = `icon_${index}_`;
      const scopedContent = icon.content
        .replace(/id=["']([^"']+)["']/g, `id="${prefix}$1"`)
        .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`);

      const x = index * totalIconWidth;
      const y = verticalPadding;

      return `
      <g transform="translate(${x}, ${y})">
        <svg width="${iconSize}" height="${iconSize}" viewBox="${icon.viewBox || "0 0 128 128"}">
          ${scopedContent}
        </svg>
      </g>`;
    })
    .join("")
    .replace(/\s+/g, " ");

  return {
    innerContent,
    svgWidth,
    svgHeight,
  };
};
