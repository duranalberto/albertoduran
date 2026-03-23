import type { AstroIntegration } from "astro";
import glob from "fast-glob";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export function injectModulePreload(): AstroIntegration {
  return {
    name: "inject-module-preload",
    hooks: {
      "astro:build:done": async ({ dir }: { dir: URL }) => {
        const distDir = fileURLToPath(dir);
        const htmlFiles: string[] = await glob(join(distDir, "**/*.html"));

        const filesWithContent = await Promise.all(
          htmlFiles.map(async (filePath) => ({
            filePath,
            html: await readFile(filePath, "utf-8"),
          })),
        );

        const clientRouterSrcs = new Set<string>();
        const clientRouterSrcRe =
          /<script\b[^>]+\bsrc="(\/_astro\/ClientRouter\.[^"]+\.js)"[^>]*>/g;

        for (const { html } of filesWithContent) {
          for (const match of html.matchAll(clientRouterSrcRe)) {
            const src = match[1];
            if (src) clientRouterSrcs.add(src);
          }
        }

        if (clientRouterSrcs.size === 0) return;

        const depMap = new Map<string, string>();

        await Promise.all(
          Array.from(clientRouterSrcs).map(async (src) => {
            try {
              const jsPath = join(distDir, src);
              const js: string = await readFile(jsPath, "utf-8");
              const match = js.match(/from\s*["'](\.\/index\.[^"']+\.js)["']/);

              if (match?.[1]) {
                const dep = `/_astro/${match[1].slice(2)}`;
                depMap.set(src, dep);
              }
            } catch {}
          }),
        );

        if (depMap.size === 0) return;

        let patchedFilesCount = 0;

        await Promise.all(
          filesWithContent.map(async ({ filePath, html: originalHtml }) => {
            let html = originalHtml;
            let changed = false;

            for (const [src, dep] of depMap.entries()) {
              if (!html.includes(src)) continue;

              const preloadTag = `<link rel="modulepreload" href="${dep}">`;
              if (html.includes(preloadTag)) continue;

              const escapedSrc = src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const scriptTagRe = new RegExp(
                `(<script\\b[^>]+\\bsrc="${escapedSrc}"[^>]*>)`,
              );

              const patched = html.replace(scriptTagRe, `${preloadTag}$1`);

              if (patched !== html) {
                html = patched;
                changed = true;
              }
            }

            if (changed) {
              await writeFile(filePath, html);
              patchedFilesCount++;
            }
          }),
        );

        console.log(
          `\x1b[32m✔\x1b[0m Injected modulepreload hints into ${patchedFilesCount} HTML file${
            patchedFilesCount !== 1 ? "s" : ""
          }.`,
        );
      },
    },
  };
}
