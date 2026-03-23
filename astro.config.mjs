import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import {
  customHtmlMinifier,
  injectModulePreload,
  mermaidIntegration,
} from "./src/integrations/index.ts";
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
      themes: new Map([
        ["light", LIGHT_PALETTE],
        ["dark", DARK_PALETTE],
      ]),
    }),
    mdx(),
    injectModulePreload(),
    customHtmlMinifier(),
  ],

  prefetch: {
    prefetchAll: false,
    defaultStrategy: "tap",
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--font-display",
      weights: ["700", "800", "900"],
      subsets: ["latin"],
      display: "swap",
    },
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-sans",
      weights: ["400", "600", "700"],
      subsets: ["latin"],
      display: "swap",
    },
    {
      provider: fontProviders.fontsource(),
      name: "Montserrat",
      cssVariable: "--font-reading",
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

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {
        limitInputPixels: true,
      },
    },
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
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      cssMinify: true,
    },
  },
});
