import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

/**
 * PNG icons rendered at build time from public/favicon.svg (resolved from the
 * project root, as @data/icons does, since bundling moves this module), so
 * there is one
 * source image. `background` fills transparency (iOS shows it as black).
 */
export async function renderSiteIcon(
  size: number,
  { background, padding = 0 }: { background?: string; padding?: number } = {},
): Promise<ArrayBuffer> {
  const svg = await readFile(join(process.cwd(), "public", "favicon.svg"));
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(svg, { density: 512 })
    .resize(inner, inner)
    .png()
    .toBuffer();

  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([{ input: logo, gravity: "center" }]);

  const png = await canvas.png().toBuffer();
  return png.buffer.slice(
    png.byteOffset,
    png.byteOffset + png.byteLength,
  ) as ArrayBuffer;
}

export const pngResponse = (body: ArrayBuffer) =>
  new Response(body, { headers: { "Content-Type": "image/png" } });
