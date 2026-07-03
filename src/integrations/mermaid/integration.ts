/**
 * integration.ts
 *
 * Wraps the Sätteri mermaid plugins as a first-class AstroIntegration.
 *
 * IMPORTANT — ordering in astro.config.mjs:
 *   integrations: [mermaidIntegration(), mdx(), ...]
 *
 * mermaidIntegration() should come before mdx() so its `astro:config:setup`
 * hook can augment `markdown.processor` before MDX finalises the processor it
 * will use for `.mdx` files.
 *
 * ## How plugin injection works
 * The integration detects the existing Sätteri processor (set via
 * `markdown.processor` in astro.config.mjs) and adds the Mermaid MDAST plugin
 * to processor.options.mdastPlugins. This preserves features and any static
 * Sätteri plugins configured in astro.config.mjs without the integration
 * needing to know about them.
 *
 * If no Sätteri processor is found, a new one is created via updateConfig as
 * a fallback.
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

import type { AstroIntegrationLogger } from "astro";
import type { AstroIntegration } from "astro";
import { parseFrontmatter } from "@astrojs/internal-helpers/frontmatter";
import {
  satteri,
  isSatteriProcessor,
  type SatteriResolvedOptions,
} from "@astrojs/markdown-satteri";
import glob from "fast-glob";
import type { Element as HastElement } from "hast";
import fsAsync from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import {
  filterPublishedJournalEntries,
  type JournalManifestSourceEntry,
} from "../../content/processors/thejournal-manifest.ts";
import { AstroDiskBus } from "../../lib/astro-disk-bus.ts";
import {
  DEFAULT_MERMAID_CACHE_SUBDIR,
  DEFAULT_MERMAID_MANIFEST_SUBDIR,
  RENDERER_VERSION,
} from "./constants.ts";
import {
  getMermaidStableId,
  normalizeMermaidDefinition,
} from "./definition.ts";
import {
  createPipeline,
  type DiagramPipeline,
  type RegisteredDiagram,
} from "./pipeline.ts";
import { createMermaidMdastPlugin } from "./satteri-plugin.ts";
import { extractMermaidDefinitionCalls } from "./source-parser.ts";
import type { MermaidPalette } from "./types.ts";

interface MermaidSourceDocument {
  filePath: string;
  content: string;
}

const JOURNAL_CONTENT_PREFIX = "src/thejournal/";

/**
 * Astro only merges non-`PUBLIC_`-prefixed `.env` values into `process.env`
 * from a Vite plugin's `buildStart` hook (see `astro/dist/env/vite-plugin-env.js`),
 * which fires during `viteBuild()` — strictly *after* Astro's own
 * `astro:build:start` integration hook has already resolved (see
 * `astro/dist/core/build/index.js`: `runHookBuildStart()` runs on the line
 * before `viteBuild()` is called). This integration reads
 * `MERMAID_RENDERER_URL`/`MERMAID_RENDERER_API_KEY`/`MERMAID_DISABLE_WORKER`
 * from `process.env` inside `astro:build:start` (see renderers.ts), which is
 * too early to see values that only live in a `.env` file — they read as
 * `undefined` and the pipeline silently falls back to mermaid.ink, even
 * though the same variables work fine once actually exported into the shell.
 *
 * Loading them ourselves in `astro:config:setup` (which always runs before
 * `astro:build:start`) closes that gap. Real environment variables already
 * set by the shell/CI/host platform take precedence and are never
 * overwritten.
 */
function populateProcessEnvFromDotenv(root: URL, mode: string): void {
  const loaded = loadEnv(mode, fileURLToPath(root), "");
  for (const [key, value] of Object.entries(loaded)) {
    if (process.env[key] === undefined && value !== undefined) {
      process.env[key] = value;
    }
  }
}

function normalizeSourcePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function normalizeFileURL(fileURL: URL): string {
  return normalizeSourcePath(
    path.relative(process.cwd(), fileURLToPath(fileURL)),
  );
}

function getJournalEntryId(filePath: string): string | null {
  const normalizedPath = normalizeSourcePath(filePath);
  if (!normalizedPath.startsWith(JOURNAL_CONTENT_PREFIX)) return null;
  if (!/\.mdx?$/.test(normalizedPath)) return null;

  const withoutPrefix = normalizedPath.slice(JOURNAL_CONTENT_PREFIX.length);
  const withoutExtension = withoutPrefix.replace(/\.mdx?$/, "");

  return withoutExtension.endsWith("/index")
    ? withoutExtension.slice(0, -"/index".length)
    : withoutExtension;
}

function getDraftFlag(content: string): boolean | undefined {
  const parsed = parseFrontmatter(content);
  return parsed.frontmatter["draft"] === true ? true : undefined;
}

function extractMermaidBlocks(content: string): string[] {
  const blocks: string[] = [];
  const regex = /^```mermaid[^\n]*\n([\s\S]*?)^```\s*$/gm;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const code = match[1]!.trim();
    if (code) blocks.push(code);
  }

  return blocks;
}

function collectMermaidDiagrams(
  documents: MermaidSourceDocument[],
): Map<string, string> {
  const seen = new Map<string, string>();

  for (const document of documents) {
    const sourceCodes = [
      ...extractMermaidBlocks(document.content),
      ...extractMermaidDefinitionCalls(document.content, document.filePath),
    ];

    for (const sourceCode of sourceCodes) {
      const code = normalizeMermaidDefinition(sourceCode);
      if (!code) continue;

      const stableId = getMermaidStableId(code);
      if (!seen.has(stableId)) seen.set(stableId, code);
    }
  }

  return seen;
}

export function collectPublishableMermaidDiagrams(
  documents: MermaidSourceDocument[],
): Map<string, string> {
  return collectMermaidDiagrams(collectPublishableMermaidDocuments(documents));
}

export function collectPublishableMermaidDocuments(
  documents: MermaidSourceDocument[],
): MermaidSourceDocument[] {
  const journalDocuments = new Map<string, MermaidSourceDocument>();
  const journalEntries: JournalManifestSourceEntry[] = [];
  const publishableDocuments: MermaidSourceDocument[] = [];

  for (const document of documents) {
    const normalizedPath = normalizeSourcePath(document.filePath);
    const journalEntryId = getJournalEntryId(normalizedPath);

    if (!journalEntryId) {
      publishableDocuments.push({
        ...document,
        filePath: normalizedPath,
      });
      continue;
    }

    const normalizedDocument = {
      ...document,
      filePath: normalizedPath,
    };
    journalDocuments.set(normalizedPath, normalizedDocument);
    journalEntries.push({
      id: journalEntryId,
      filePath: normalizedPath,
      body: document.content,
      data: {
        title: journalEntryId,
        draft: getDraftFlag(document.content),
      },
    });
  }

  const publishableJournalPaths = new Set(
    filterPublishedJournalEntries(journalEntries).map((entry) =>
      normalizeSourcePath(entry.filePath ?? ""),
    ),
  );

  for (const filePath of publishableJournalPaths) {
    const document = journalDocuments.get(filePath);
    if (document) publishableDocuments.push(document);
  }

  return publishableDocuments;
}

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

/**
 * Scans publishable MDX/MD source files for ```mermaid blocks and static
 * defineMermaidDiagram() calls, then prepares each unique diagram before Vite
 * starts processing source files. Preparation renders each diagram (or hits
 * the disk cache) and persists it to the on-disk SVG cache; both the Sätteri
 * MDAST plugin (via pipeline.getDiagram) and MermaidDiagram.astro (via the
 * disk cache, see build-context.ts) read from that prepared state.
 */
async function prepareMermaidDiagrams(
  pipeline: DiagramPipeline,
  logger: AstroIntegrationLogger,
): Promise<Set<string>> {
  const files = await glob(["src/**/*.{md,mdx,astro,ts,tsx}"], {
    ignore: ["src/**/*.d.ts"],
  });
  const documents: MermaidSourceDocument[] = [];

  await Promise.all(
    files.map(async (filePath) => {
      try {
        documents.push({
          filePath,
          content: await fsAsync.readFile(filePath, "utf-8"),
        });
      } catch {
        // File disappeared between glob and read; ignore this preparation miss.
      }
    }),
  );

  const publishableDocuments = collectPublishableMermaidDocuments(documents);
  const publishableSourceFiles = new Set(
    publishableDocuments.map((document) => document.filePath),
  );
  const seen = collectMermaidDiagrams(publishableDocuments);

  if (seen.size === 0) {
    return publishableSourceFiles;
  }

  logger.info(
    `Preparing ${seen.size} publishable mermaid diagram(s) before Vite build...`,
  );

  await pipeline.prepareDiagrams(seen);

  logger.info("Mermaid diagram preparation complete.");
  return publishableSourceFiles;
}

export function mermaidIntegration(
  options: MermaidIntegrationOptions = {},
): AstroIntegration {
  const cacheSubDir = options.cacheSubDir ?? DEFAULT_MERMAID_CACHE_SUBDIR;

  // An empty map means "no palettes provided" — renderers handle this branch
  // by omitting theme config from their payloads.
  const themes: Map<string, MermaidPalette> = options.themes ?? new Map();

  // Holds the pipeline instance for the lifetime of a single build.
  // Created in astro:build:start and consumed by the Sätteri plugin via the
  // getDiagram closure injected in astro:config:setup.
  let pipeline: DiagramPipeline | null = null;
  let publishableMermaidSourceFiles: Set<string> | null = null;
  let site: string | undefined;

  return {
    name: "astro-mermaid",

    hooks: {
      /**
       * astro:config:setup
       *
       * Builds a single Sätteri processor that contains the Mermaid MDAST plugin
       * plus whatever features and plugins were declared in astro.config.mjs,
       * then installs it via updateConfig — the only reliable, authoritative
       * path for setting a markdown processor from an integration.
       *
       * Reading config.markdown.processor lets us carry the user's features
       * (directive, math, headingAttributes…) and any pre-declared plugins
       * forward into the replacement processor so nothing is lost.
       *
       * The mermaid MDAST plugin receives a getDiagram closure that delegates
       * to the prepared build registry (captured by reference; initialised
       * later in astro:build:start).
       */
      "astro:config:setup": ({ config, command, updateConfig, logger }) => {
        populateProcessEnvFromDotenv(
          config.root,
          command === "build" ? "production" : "development",
        );

        logger.info(
          themes.size > 0
            ? `Injecting mermaid Sätteri plugin with ${themes.size} theme(s): ${[...themes.keys()].join(", ")}`
            : "Injecting mermaid Sätteri plugin (no palettes — using service defaults)",
        );

        const mermaidMdastPlugin = createMermaidMdastPlugin({
          shouldRenderDiagram: (fileURL: URL | undefined) => {
            if (!fileURL || !publishableMermaidSourceFiles) return true;
            return publishableMermaidSourceFiles.has(normalizeFileURL(fileURL));
          },
          getDiagram: (stableId: string) => {
            if (!pipeline) {
              throw new Error(
                "[mermaid] getDiagram called before astro:build:start — pipeline not initialised.",
              );
            }
            return pipeline.getDiagram(stableId);
          },
        });

        // Carry existing Sätteri options forward, then prepend Mermaid's
        // build-backed MDAST transform.
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
              mdastPlugins: [mermaidMdastPlugin, ...baseOptions.mdastPlugins],
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
       *
       * Prepares the diagram registry by scanning all MDX/MD files before
       * Vite starts transforming Markdown.
       */
      "astro:build:start": async ({ logger }) => {
        const svgBus = new AstroDiskBus<HastElement>({
          subDir: cacheSubDir,
          version: RENDERER_VERSION,
        });
        const manifestBus = new AstroDiskBus<RegisteredDiagram>({
          subDir: DEFAULT_MERMAID_MANIFEST_SUBDIR,
          version: RENDERER_VERSION,
        });

        await svgBus.ensureDir();
        // Scratch state for this build only — wiped so stale entries from a
        // previous build never leak into a page rendered during this one.
        await manifestBus.clear();

        pipeline = createPipeline(svgBus, manifestBus, themes, RENDERER_VERSION, site);

        logger.info(`Cache dir ready: .astro/${cacheSubDir}`);

        publishableMermaidSourceFiles = await prepareMermaidDiagrams(
          pipeline,
          logger,
        );
      },

      "astro:build:generated": async ({ dir, logger }) => {
        await pipeline?.emitAssets(dir, logger);
      },

      "astro:build:done": ({ logger }) => {
        pipeline?.logBuildSummary(logger);
        pipeline = null;
        publishableMermaidSourceFiles = null;
      },
    },
  };
}
