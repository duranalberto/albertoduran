import type { AstroIntegration } from "astro";
import {
  isSatteriProcessor,
  satteri,
  type SatteriResolvedOptions,
} from "@astrojs/markdown-satteri";
import { createDaisyUiMdastPlugin } from "./satteri-plugin.ts";

export function daisyuiIntegration(): AstroIntegration {
  return {
    name: "astro-daisyui",
    hooks: {
      "astro:config:setup": ({ config, updateConfig, logger }) => {
        logger.info("Injecting DaisyUI Sätteri fence plugin");

        const daisyuiMdastPlugin = createDaisyUiMdastPlugin();
        const existingProc = config.markdown?.processor;
        const base =
          existingProc && isSatteriProcessor(existingProc)
            ? existingProc
            : null;
        const baseOptions: SatteriResolvedOptions = base?.options ?? {
          features: {},
          mdastPlugins: [],
          hastPlugins: [],
        };

        updateConfig({
          markdown: {
            processor: satteri({
              ...baseOptions,
              mdastPlugins: [daisyuiMdastPlugin, ...baseOptions.mdastPlugins],
            }),
          },
        });
      },
    },
  };
}
