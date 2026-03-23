import type { AstroIntegration } from "astro";
import glob from "fast-glob";
import {
  minify,
  type Options as HtmlMinifierOptions,
} from "html-minifier-terser";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

async function buildDone({ dir }: { dir: URL }) {
  const distDir = fileURLToPath(dir);

  const htmlFiles = await glob(join(distDir, "**/*.html"), {
    ignore: [join(distDir, "_astro/**")],
  });

  const minifierOptions: HtmlMinifierOptions = {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true,
    ignoreCustomFragments: [
      /<pre[\s\S]*?<\/pre>/,
      /<code[\s\S]*?<\/code>/,
      /<kbd[\s\S]*?<\/kbd>/,
    ],
  };

  await Promise.all(
    htmlFiles.map(async (filePath: string) => {
      try {
        const fileName = filePath.replace(distDir, "");
        console.log(`  \x1b[2mMinifying: ${fileName}\x1b[0m`);

        const html: string = await readFile(filePath, "utf-8");
        const minified: string = await minify(html, minifierOptions);

        await writeFile(filePath, minified);
      } catch (error) {
        console.error(`Failed to minify ${filePath}:`, error);
      }
    }),
  );

  console.log(
    `\x1b[32m✔\x1b[0m Minified ${htmlFiles.length} HTML file${
      htmlFiles.length !== 1 ? "s" : ""
    } using html-minifier-terser.`,
  );
}

export function customHtmlMinifier(): AstroIntegration {
  return {
    name: "custom-html-minifier",
    hooks: {
      "astro:build:done": buildDone,
    },
  };
}
