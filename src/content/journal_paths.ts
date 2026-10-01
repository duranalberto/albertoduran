/**
 * Where theJournal's source files live on disk, and how a file path maps to an
 * entry id. Kept apart from the /thejournal/ URL, which is a route concern.
 */

const SOURCE_DIR = /(?:^|\/)src\/thejournal\//;
const MARKDOWN = /\.mdx?$/;

/** Path below src/thejournal/ with forward slashes, or null if outside it. */
export function journalRelativePath(filePath: string): string | null {
  const normalized = filePath.replaceAll("\\", "/");
  const match = SOURCE_DIR.exec(normalized);
  return match ? normalized.slice(match.index + match[0].length) : null;
}

/** The section a `<dir>/index.md(x)` file introduces ("vault/section"), else null. */
export function journalIndexScope(filePath: string): string | null {
  const relative = journalRelativePath(filePath);
  return relative?.match(/^(.+)\/index\.mdx?$/)?.[1] ?? null;
}

/** Entry id for a Markdown file under src/thejournal/, else null. */
export function journalEntryIdFromPath(filePath: string): string | null {
  const relative = journalRelativePath(filePath);
  if (!relative || !MARKDOWN.test(relative)) return null;
  return journalIndexScope(filePath) ?? relative.replace(MARKDOWN, "");
}
