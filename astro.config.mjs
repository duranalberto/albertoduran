import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import glob from "fast-glob";
import { minify } from "html-minifier-terser";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { remarkGraphviz } from "./src/utils/remark_graphviz.ts";

const injectModulePreload = () => ({
  name: "inject-module-preload",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      const distDir = fileURLToPath(dir);
      const htmlFiles = await glob(join(distDir, "**/*.html"));

      const htmlContents = await Promise.all(
        htmlFiles.map((f) => readFile(f, "utf-8")),
      );

      const clientRouterSrcs = new Set();
      const clientRouterSrcRe =
        /<script\b[^>]+\bsrc="(\/_astro\/ClientRouter\.[^"]+\.js)"[^>]*>/g;

      for (const html of htmlContents) {
        for (const m of html.matchAll(clientRouterSrcRe)) {
          clientRouterSrcs.add(m[1]);
        }
      }

      if (clientRouterSrcs.size === 0) {
        return;
      }

      const depMap = new Map();

      await Promise.all(
        [...clientRouterSrcs].map(async (src) => {
          try {
            const js = await readFile(join(distDir, src), "utf-8");
            const m = js.match(/from\s*["'](\.\/index\.[^"']+\.js)["']/);
            if (m) {
              depMap.set(src, `/_astro/${m[1].slice(2)}`);
            }
          } catch {}
        }),
      );

      if (depMap.size === 0) return;
      let patchedFiles = 0;

      await Promise.all(
        htmlFiles.map(async (filePath, i) => {
          let html = htmlContents[i];
          let changed = false;

          for (const [src, dep] of depMap) {
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
            patchedFiles++;
          }
        }),
      );

      console.log(
        `\x1b[32m✔\x1b[0m Injected modulepreload hints into ${patchedFiles} HTML file${patchedFiles !== 1 ? "s" : ""}.`,
      );
    },
  },
});

const minifyHtml = () => ({
  name: "custom-html-minifier",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      const distDir = fileURLToPath(dir);
      const htmlFiles = await glob(join(distDir, "**/*.html"));

      const minifierOptions = {
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
        htmlFiles.map(async (filePath) => {
          const fileName = filePath.replace(distDir, "");
          console.log(`  \x1b[2mMinifying: ${fileName}\x1b[0m`);

          const html = await readFile(filePath, "utf-8");
          const minified = await minify(html, minifierOptions);
          await writeFile(filePath, minified);
        }),
      );

      console.log(
        `\x1b[32m✔\x1b[0m Minified ${htmlFiles.length} HTML files using html-minifier-terser.`,
      );
    },
  },
});

export default defineConfig({
  site: "https://albertoduran.com",
  output: "static",
  trailingSlash: "always",
  integrations: [mdx(), injectModulePreload(), minifyHtml()],
  prefetch: { defaultStrategy: "viewport" },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["400", "500", "600", "700"],
      subsets: ["latin"],
      display: "swap",
    },
    {
      provider: fontProviders.fontsource(),
      name: "Noto Sans Display",
      cssVariable: "--font-noto-sans-display",
      weights: ["400", "700", "800", "900"],
      subsets: ["latin"],
      display: "swap",
    },
    {
      provider: fontProviders.fontsource(),
      name: "Lora",
      cssVariable: "--font-lora",
      weights: ["400", "500", "600", "700"],
      subsets: ["latin"],
      display: "swap",
    },
    {
      provider: fontProviders.local(),
      name: "Fira Code",
      cssVariable: "--font-fira-code",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/FiraCodeNerdFontMono-Regular.woff2"],
            weight: "400",
            style: "normal",
          },
        ],
      },
    },
  ],
  markdown: {
    remarkPlugins: [remarkGraphviz],
    shikiConfig: {
      themes: {
        light: "one-light",
        dark: "one-dark-pro",
      },
      defaultColor: "light",
      transformers: [
        {
          line(node, line) {
            node.properties["data-line"] = line;
          },
        },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      cssMinify: true,
      assetsInlineLimit: 8192,
    },
  },
});
