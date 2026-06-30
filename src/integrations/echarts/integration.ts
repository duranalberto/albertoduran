import type { AstroIntegration } from "astro";
import { parseFrontmatter } from "@astrojs/internal-helpers/frontmatter";
import {
  isSatteriProcessor,
  satteri,
  type SatteriResolvedOptions,
} from "@astrojs/markdown-satteri";
import glob from "fast-glob";
import fsAsync from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  filterPublishedJournalEntries,
  type JournalManifestSourceEntry,
} from "../../content/processors/thejournal-manifest.ts";
import {
  emitEChartArtifacts,
  resetEChartArtifacts,
  setEChartArtifactBuildMode,
} from "./artifacts.ts";
import { createEChartsMdastPlugin } from "./satteri-plugin.ts";

interface EChartsSourceDocument {
  filePath: string;
  content: string;
}

const JOURNAL_CONTENT_PREFIX = "src/thejournal/";

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

export function collectPublishableEChartDocuments(
  documents: EChartsSourceDocument[],
): EChartsSourceDocument[] {
  const journalDocuments = new Map<string, EChartsSourceDocument>();
  const journalEntries: JournalManifestSourceEntry[] = [];
  const publishableDocuments: EChartsSourceDocument[] = [];

  for (const document of documents) {
    const normalizedPath = normalizeSourcePath(document.filePath);
    const journalEntryId = getJournalEntryId(normalizedPath);
    const normalizedDocument = {
      ...document,
      filePath: normalizedPath,
    };

    if (!journalEntryId) {
      publishableDocuments.push(normalizedDocument);
      continue;
    }

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

async function collectPublishableEChartSourceFiles(): Promise<Set<string>> {
  const files = await glob(["src/**/*.mdx", "src/**/*.md"]);
  const documents: EChartsSourceDocument[] = [];

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

  return new Set(
    collectPublishableEChartDocuments(documents).map(
      (document) => document.filePath,
    ),
  );
}

export function echartsIntegration(): AstroIntegration {
  let publishableEChartSourceFiles: Set<string> | null = null;

  return {
    name: "astro-echarts",
    hooks: {
      "astro:config:setup": ({ config, updateConfig, logger }) => {
        logger.info("Injecting ECharts Sätteri fence plugin");

        const echartsMdastPlugin = createEChartsMdastPlugin({
          shouldRenderChart: (fileURL: URL | undefined) => {
            if (!fileURL || !publishableEChartSourceFiles) return true;
            return publishableEChartSourceFiles.has(normalizeFileURL(fileURL));
          },
        });

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
              mdastPlugins: [echartsMdastPlugin, ...baseOptions.mdastPlugins],
            }),
          },
        });
      },

      "astro:build:start": async () => {
        resetEChartArtifacts();
        setEChartArtifactBuildMode(true);
        publishableEChartSourceFiles =
          await collectPublishableEChartSourceFiles();
      },
      "astro:build:done": async ({ dir, logger }) => {
        await emitEChartArtifacts(dir, logger);
        setEChartArtifactBuildMode(false);
        resetEChartArtifacts();
        publishableEChartSourceFiles = null;
      },
    },
  };
}
