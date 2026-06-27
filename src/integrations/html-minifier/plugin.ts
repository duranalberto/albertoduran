import type { AstroIntegration } from "astro";
import glob from "fast-glob";
import {
  minify,
  type Options as HtmlMinifierOptions,
} from "html-minifier-terser";
import { readFile, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";

export const HTML_MINIFIER_OPTIONS: HtmlMinifierOptions = {
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

export async function minifyHtmlDocument(html: string): Promise<string> {
  return minify(html, HTML_MINIFIER_OPTIONS);
}

type HtmlMinifier = (html: string, filePath: string) => Promise<string>;

interface MinifyGeneratedHtmlOptions {
  distDir: string;
  minifier?: HtmlMinifier;
  logger?: Pick<Console, "log" | "error">;
}

interface MinifyFailure {
  filePath: string;
  error: unknown;
}

function formatFailure({ filePath, error }: MinifyFailure): string {
  const message = error instanceof Error ? error.message : String(error);
  return `${filePath}: ${message}`;
}

export async function minifyGeneratedHtml({
  distDir,
  minifier = minifyHtmlDocument,
  logger = console,
}: MinifyGeneratedHtmlOptions): Promise<string[]> {
  const htmlFiles = await glob("**/*.html", {
    cwd: distDir,
    absolute: true,
    ignore: ["_app/**"],
  });

  const results = await Promise.all(
    htmlFiles.map(async (filePath): Promise<MinifyFailure | null> => {
      try {
        const fileName = relative(distDir, filePath);
        logger.log(`  \x1b[2mMinifying: ${fileName}\x1b[0m`);

        const html = await readFile(filePath, "utf-8");
        const minified = await minifier(html, filePath);

        await writeFile(filePath, minified);
        return null;
      } catch (error) {
        logger.error(`Failed to minify ${filePath}:`, error);
        return { filePath, error };
      }
    }),
  );

  const failures = results.filter((result): result is MinifyFailure =>
    Boolean(result),
  );

  if (failures.length > 0) {
    throw new Error(
      `Failed to minify ${failures.length} HTML file${
        failures.length === 1 ? "" : "s"
      }:\n${failures.map(formatFailure).join("\n")}`,
    );
  }

  logger.log(
    `\x1b[32m✔\x1b[0m Minified ${htmlFiles.length} HTML file${
      htmlFiles.length !== 1 ? "s" : ""
    } using html-minifier-terser.`,
  );

  return htmlFiles;
}

async function buildDone({ dir }: { dir: URL }) {
  await minifyGeneratedHtml({ distDir: fileURLToPath(dir) });
}

export function customHtmlMinifier(): AstroIntegration {
  return {
    name: "custom-html-minifier",
    hooks: {
      "astro:build:done": buildDone,
    },
  };
}
