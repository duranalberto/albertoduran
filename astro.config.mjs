import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import {
  customHtmlMinifier,
  echartsIntegration,
  mermaidIntegration,
} from "./src/integrations/index.ts";
import { createHeadingAnchorPlugin } from "./src/integrations/satteri-heading-anchors.ts";
import { createCodeBlockPlugin } from "./src/integrations/satteri-code-blocks.ts";
import {
  DARK_PALETTE,
  LIGHT_PALETTE,
} from "./src/integrations/mermaid/palette.ts";

export default defineConfig({
  site: "https://albertoduran.com",
  output: "static",
  trailingSlash: "always",

  build: {
    assets: "_app",
  },

  integrations: [
    mermaidIntegration({
      hastPlugins: [createCodeBlockPlugin(), createHeadingAnchorPlugin()],
      themes: new Map([
        ["light", LIGHT_PALETTE],
        ["dark", DARK_PALETTE],
      ]),
    }),
    echartsIntegration(),
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
            src: ["./src/assets/fonts/FiraCodeNerdFontMono-Regular.woff2"],
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
        math: true,
        headingAttributes: true,
      },
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
    // Scope aggressive minification to the client environment only.
    // Top-level build.rolldownOptions is the default for ALL environments
    // (including prerender), so mangle:true there breaks the SSR bundle.
    environments: {
      client: {
        build: {
          rolldownOptions: {
            output: {
              minify: {
                compress: { dropConsole: true, dropDebugger: true },
                mangle: true,
              },
            },
          },
        },
      },
    },
    build: {
      minify: "oxc",
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("/node_modules/zrender/")) {
              return "zrender";
            }
            if (id.includes("/node_modules/echarts/lib/component/")) {
              return "echarts-components";
            }
          },
        },
      },
      cssMinify: true,
    },
  },
});
