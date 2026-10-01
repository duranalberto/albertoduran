/**
 * publishable.ts — the app-specific content selection injected into the
 * bloomwright-* integrations as `selectSources`.
 *
 * bloomwright-ui's `mermaidRenderer()` and bloomwright-mdx's `bloomwrightMdx()`
 * both scan `src/**` for diagrams/charts, then ask `selectSources(docs)` which
 * documents' output to actually render/emit. albertoduran's rule: render every
 * non-journal source (project pages, etc.), and for `src/thejournal/**` render
 * only PUBLISHED entries (drafts + draft-index-scoped entries are skipped) using
 * the same `thejournal-manifest` publish model as the site's content pipeline.
 *
 * This logic previously lived inside src/integrations/{mermaid,echarts}/
 * integration.ts (identical in both). It is relocated here so it survives the
 * deletion of those local integrations during the migration, and so a single
 * function feeds BOTH integrations. `SourceDocument` ({ filePath, content }) is
 * bloomwright-ui's content-selection contract.
 */
import { parseFrontmatter } from "@astrojs/internal-helpers/frontmatter";
import type { SourceDocument } from "bloomwright-ui/mermaid";
import { journalEntryIdFromPath } from "../journal_paths.ts";
import {
  filterPublishedJournalEntries,
  type PublishFilterEntry,
} from "./thejournal-manifest.ts";

function normalizeSourcePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function getDraftFlag(content: string): boolean | undefined {
  const parsed = parseFrontmatter(content);
  return parsed.frontmatter["draft"] === true ? true : undefined;
}

/**
 * Return the subset of scanned documents whose diagrams/charts should render:
 * all non-journal docs, plus published `src/thejournal/**` entries. Shape-
 * compatible with bloomwright's `selectSources` contract, so it is passed to
 * both `bloomwrightMdx({ selectSources })` and `mermaidRenderer({ selectSources })`.
 */
export function collectPublishableDocuments(
  documents: SourceDocument[],
): SourceDocument[] {
  const journalDocuments = new Map<string, SourceDocument>();
  const journalEntries: PublishFilterEntry[] = [];
  const publishableDocuments: SourceDocument[] = [];

  for (const document of documents) {
    const normalizedPath = normalizeSourcePath(document.filePath);
    const normalizedDocument: SourceDocument = {
      ...document,
      filePath: normalizedPath,
    };
    const journalEntryId = journalEntryIdFromPath(normalizedPath);

    if (!journalEntryId) {
      publishableDocuments.push(normalizedDocument);
      continue;
    }

    journalDocuments.set(normalizedPath, normalizedDocument);
    journalEntries.push({
      id: journalEntryId,
      filePath: normalizedPath,
      data: { draft: getDraftFlag(document.content) },
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
