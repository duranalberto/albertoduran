import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import compress from "astro-compress";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  integrations: [
    mdx(),
    compress({
      CSS: true,
      HTML: {
        "html-minifier-terser": {
          collapseWhitespace: true,
          removeComments: true,
          ignoreCustomFragments: [
            /<pre[\s\S]*?<\/pre>/,
            /<code[\s\S]*?<\/code>/,
            /<kbd[\s\S]*?<\/kbd>/,
          ],
        },
      },
      JavaScript: true,
      Image: false,
    }),
  ],
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "tap",
  },
  markdown: {
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
      minify: "esbuild",
      cssMinify: true,
      assetsInlineLimit: 8192,
    },
  },
});
