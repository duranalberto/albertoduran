/**
 * integration.ts
 *
 * Wraps mermaidRemarkPlugin as a first-class AstroIntegration.
 *
 * IMPORTANT — ordering in astro.config.mjs:
 *   integrations: [mermaidIntegration(), mdx(), ...]
 *
 * mermaidIntegration() MUST come before mdx(). Astro runs
 * astro:config:setup hooks in array order. This integration injects
 * the remark plugin through Astro's unified markdown processor; mdx() reads that config to
 * build its remark pipeline. Reversing the order means mdx() reads
 * the config before the plugin is registered and the plugin is never
 * applied.
 *
 * ## Palettes
 * Pass a `themes` map of DaisyUI theme name → MermaidPalette to enable
 * fully branded diagrams. If omitted, no theme config is sent to the
 * render service and its built-in defaults are used instead.
 *
 * Example with palettes:
 *   import { LIGHT_PALETTE, DARK_PALETTE } from "./src/integrations/mermaid/palette.ts";
 *   mermaidIntegration({ themes: new Map([["light", LIGHT_PALETTE], ["dark", DARK_PALETTE]]) })
 *
 * Example without palettes (service defaults):
 *   mermaidIntegration()
 */

import type { AstroIntegration } from "astro";
import { unified } from "@astrojs/markdown-remark";
import type { Element as HastElement } from "hast";
import { AstroDiskBus } from "../../lib/astro-disk-bus.ts";
import { RENDERER_VERSION } from "./constants.ts";
import { optimizeBuiltMermaidPageCss } from "./page-css.ts";
import { createPipeline, type DiagramPipeline } from "./pipeline.ts";
import { mermaidRemarkPlugin, type MermaidPluginConfig } from "./plugin.ts";
import type { MermaidPalette } from "./types.ts";

export interface MermaidIntegrationOptions {
  /**
   * Sub-directory name inside .astro/ for diagram cache.
   * @default "mermaid-cache"
   */
  cacheSubDir?: string;

  /**
   * Branded theme palettes keyed by DaisyUI theme name (e.g. "light", "dark").
   * Keys must match the values used in `[data-theme]` on the html element.
   *
   * When omitted the integration sends no theme config and the render service
   * falls back to its own defaults (typically the Mermaid "default" theme).
   */
  themes?: Map<string, MermaidPalette>;
}

export function mermaidIntegration(
  options: MermaidIntegrationOptions = {},
): AstroIntegration {
  const cacheSubDir = options.cacheSubDir ?? "mermaid-cache";

  // An empty map means "no palettes provided" — renderers handle this branch
  // by omitting theme config from their payloads.
  const themes: Map<string, MermaidPalette> = options.themes ?? new Map();

  // Holds the pipeline instance for the lifetime of a single build.
  // Created in astro:build:start and consumed by the remark plugin via the
  // registerDiagram closure injected in astro:config:setup.
  let pipeline: DiagramPipeline | null = null;
  let site: string | undefined;

  return {
    name: "astro-mermaid",

    hooks: {
      /**
       * astro:config:setup
       * Injects the remark plugin into Astro's markdown pipeline through
       * the unified processor so the user never touches remarkPlugins directly.
       * Must run before mdx() reads the markdown config — guaranteed
       * by placing mermaidIntegration() before mdx() in the array.
       *
       * The plugin receives a registerDiagram function that closes over
       * the pipeline instance. The pipeline itself is not yet created here
       * (that happens in astro:build:start), so the closure captures the
       * `pipeline` variable by reference.
       */
      "astro:config:setup": ({ updateConfig, logger }) => {
        logger.info(
          themes.size > 0
            ? `Injecting mermaid remark plugin with ${themes.size} theme(s): ${[...themes.keys()].join(", ")}`
            : "Injecting mermaid remark plugin (no palettes — using service defaults)",
        );

        updateConfig({
          markdown: {
            processor: unified({
              remarkPlugins: [
                [
                  mermaidRemarkPlugin,
                  {
                    cacheSubDir,
                    registerDiagram: (stableId: string, code: string) => {
                      if (!pipeline) {
                        throw new Error(
                          "[mermaid] registerDiagram called before astro:build:start — pipeline not initialised.",
                        );
                      }
                      return pipeline.registerDiagram(stableId, code);
                    },
                  } satisfies MermaidPluginConfig,
                ],
              ],
            }),
          },
        });
      },

      "astro:config:done": ({ config }) => {
        site = config.site?.toString();
      },

      /**
       * astro:build:start
       * Runs once before Vite begins processing any source file.
       * Creates a fresh DiagramPipeline for this build, ensuring no state
       * leaks between builds or HMR rebuilds.
       */
      "astro:build:start": async ({ logger }) => {
        const svgBus = new AstroDiskBus<HastElement>({
          subDir: cacheSubDir,
          version: RENDERER_VERSION,
        });

        await svgBus.ensureDir();

        pipeline = createPipeline(svgBus, themes, RENDERER_VERSION, site);

        logger.info(`Cache dir ready: .astro/${cacheSubDir}`);
      },

      "astro:build:generated": async ({ dir, logger }) => {
        await pipeline?.emitAssets(dir, logger);
      },

      /**
       * astro:build:done
       * Hoists per-SVG Mermaid CSS into page-level CSS before the final HTML
       * minifier runs, then emits the build summary.
       */
      "astro:build:done": async ({ dir, logger }) => {
        await optimizeBuiltMermaidPageCss(dir, logger);
        pipeline?.logBuildSummary(logger);
        pipeline = null;
      },
    },
  };
}
