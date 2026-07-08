import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import { defineConfig, fontProviders } from "astro/config";
import {
  bloomwrightMdx,
  createCodeBlockPlugin,
  createHeadingAnchorPlugin,
} from "bloomwright-mdx";
import { mermaidRenderer } from "bloomwright-ui/mermaid-renderer";
import { LIGHT_PALETTE, DARK_PALETTE } from "bloomwright-ui/mermaid";
import { customHtmlMinifier } from "./src/integrations/html-minifier/plugin.ts";
import { collectPublishableDocuments } from "./src/content/processors/publishable.ts";
import { createMermaidRenderPipeline } from "./src/mermaid/render-pipeline.ts";

// Caller-owned Mermaid render pipeline. build:test sets
// MERMAID_RENDERER_FIXTURE=true → omit `render` so bloomwright-ui's
// mermaidRenderer() emits deterministic offline fixtures. Otherwise resolve the
// Worker/ink pipeline from .env + shell env (shell precedence).
const mermaidEnv = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");
const readEnv = (key) => process.env[key] ?? mermaidEnv[key];
const mermaidRenderPipeline =
  readEnv("MERMAID_RENDERER_FIXTURE") === "true"
    ? undefined
    : createMermaidRenderPipeline({
        url: readEnv("MERMAID_RENDERER_URL"),
        apiKey: readEnv("MERMAID_RENDERER_API_KEY"),
        disableWorker: readEnv("MERMAID_DISABLE_WORKER") === "true",
      });
const mermaidThemes = new Map([
  ["light", LIGHT_PALETTE],
  ["dark", DARK_PALETTE],
]);

export default defineConfig({
  site: "https://albertoduran.com",
  output: "static",
  trailingSlash: "always",

  build: {
    assets: "_app",
  },

  integrations: [
    // Fence extraction (daisyui + echart + mermaid → component/HTML). MUST come
    // before mdx() so its config:setup augments the Markdown processor.
    bloomwrightMdx({
      selectSources: collectPublishableDocuments,
    }),
    // bloomwright-ui owns Mermaid SVG creation end-to-end (pre-scan → render via
    // the caller pipeline → cache in .astro/ → emit _app/mermaid). Cache/store
    // omitted → built-in disk adapter (.astro/, RENDERER_VERSION v4.9), coherent
    // with MermaidDiagram.astro's default store.
    mermaidRenderer({
      render: mermaidRenderPipeline,
      themes: mermaidThemes,
      selectSources: collectPublishableDocuments,
      remoteCache: readEnv("MERMAID_DISABLE_REMOTE_CACHE") !== "true",
    }),
    mdx(),
    customHtmlMinifier(),
  ],

  prefetch: {
    prefetchAll: false,
    defaultStrategy: "tap",
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["400", "600", "700"],
      styles: ["normal"],
      subsets: ["latin"],
      display: "swap",
    },
    {
      provider: fontProviders.fontsource(),
      name: "Montserrat",
      cssVariable: "--font-montserrat",
      weights: ["400", "500", "600", "700"],
      styles: ["normal"],
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
            src: [
              "./src/assets/fonts/FiraCodeNerdFontMono-Regular-subset.woff2",
            ],
            weight: "400",
            style: "normal",
          },
        ],
      },
    },
  ],

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {
        limitInputPixels: true,
      },
    },
  },

  markdown: {
    processor: satteri({
      features: {
        directive: true,
        math: {
          singleDollarTextMath: false,
        },
        headingAttributes: true,
      },
      hastPlugins: [createCodeBlockPlugin(), createHeadingAnchorPlugin()],
    }),
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
      minify: "oxc",
      cssMinify: true,
    },
  },
});
