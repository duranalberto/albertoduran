/**
 * Structural rules for theJournal's vaults and standalone entries. Each rule
 * returns an error message, or null when the rule holds; the manifest builder
 * throws the first message it gets.
 */

/** The minimal entry shape the rules look at. */
export interface RuleEntry {
  id: string;
  /** Path below src/thejournal/. */
  filepath: string;
  image?: unknown;
}

const PREFIX = "[thejournal]";

const indexFiles = (path: string) => `${path}/index.mdx or ${path}/index.md`;

/** Whether `filepath` is the index file of the folder at `path`. */
export function isIndexFileFor(filepath: string, path: string): boolean {
  return filepath === `${path}/index.mdx` || filepath === `${path}/index.md`;
}

function requiresIndex(
  entries: readonly RuleEntry[],
  path: string,
  missing: string,
): string | null {
  const first = entries[0];
  return first && isIndexFileFor(first.filepath, path)
    ? null
    : `${PREFIX} ${missing}. ` +
        `Add ${indexFiles(path)} before adding entries under this folder.`;
}

/** A top-level vault folder starts with its own index file. */
export const requiresRootIndex = (
  entries: readonly RuleEntry[],
  vaultId: string,
) =>
  requiresIndex(
    entries,
    vaultId,
    `Vault "${vaultId}" is missing a required root index`,
  );

/** A nested section folder starts with its own index file. */
export const requiresSectionIndex = (
  entries: readonly RuleEntry[],
  path: string,
) =>
  requiresIndex(
    entries,
    path,
    `Vault section "${path}" is missing a required index`,
  );

/** The vault's root index declares the cover image the vault shares. */
export function requiresRootImage(
  root: RuleEntry,
  vaultId: string,
): string | null {
  return root.image
    ? null
    : `${PREFIX} Vault root entry "${root.id}" is missing a required image. ` +
        `Every vault root index (${indexFiles(vaultId)}) must declare an image in its frontmatter.`;
}

/** A vault or section holds at least one entry besides its index. */
export function requiresChildEntry(
  entries: readonly RuleEntry[],
  path: string,
  label: "Vault" | "Vault section",
): string | null {
  return entries.length > 1
    ? null
    : `${PREFIX} ${label} "${path}" contains only an index entry. ` +
        `Add at least one child publication, or make it a standalone publication at src/thejournal/${path}.mdx.`;
}

/** A standalone publication declares its own cover image. */
export function requiresStandaloneImage(entry: RuleEntry): string | null {
  return entry.image
    ? null
    : `${PREFIX} Entry "${entry.id}" is missing a required image. ` +
        `Standalone publications must declare an image in their frontmatter.`;
}

/** Throw the first failing rule's message. */
export function enforce(...results: (string | null)[]): void {
  const failure = results.find((message) => message !== null);
  if (failure) throw new Error(failure);
}
