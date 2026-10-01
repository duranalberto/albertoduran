import type {
  EntryContext,
  VaultContext,
  VaultItem,
} from "@appTypes/content_context";
import type { ImageMetadata } from "astro";
import { isNestedGroup } from "../entry_kind.ts";
import { DEFAULT_DESCRIPTION, DEFAULT_ORDER } from "../journal_defaults.ts";
import { journalIndexScope, journalRelativePath } from "../journal_paths.ts";
import { journalIndexHref } from "../../utils/routes.ts";
import {
  enforce,
  isIndexFileFor,
  requiresChildEntry,
  requiresRootImage,
  requiresRootIndex,
  requiresSectionIndex,
  requiresStandaloneImage,
} from "./vault_rules.ts";

/** The fields the publish filter reads. */
export interface PublishFilterEntry {
  id: string;
  filePath?: string | undefined;
  data: { draft?: boolean | undefined };
}

export interface JournalManifestSourceEntry extends PublishFilterEntry {
  id: string;
  filePath?: string | undefined;
  body?: string | undefined;
  data: {
    title: string;
    github?: string | undefined;
    image?: ImageMetadata | undefined;
    description?: string | undefined;
    pubDate?: Date | undefined;
    updatePubDate?: Date | undefined;
    tags?: string[] | undefined;
    order?: number | undefined;
    draft?: boolean | undefined;
  };
}

/** Path below src/thejournal/, or the input unchanged if it is elsewhere. */
export function normalizeJournalFilePath(filePath?: string): string {
  if (!filePath) return "";
  return journalRelativePath(filePath) ?? filePath;
}

export function getVaultDirectory(filepath?: string): string | null {
  if (!filepath) return null;
  const parts = filepath.split("/");

  return parts.length > 1 ? (parts[0] ?? null) : null;
}

export function stripMdxContent(body: string): {
  prose: string;
  codeLines: number;
} {
  let content = body;
  let codeLines = 0;

  content = content.replace(/```[\s\S]*?```/g, (match) => {
    const lines = match.split("\n");
    codeLines += Math.max(0, lines.length - 2);
    return " ";
  });

  content = content.replace(/^(import|export)\s[^\n]*/gm, "");
  content = content.replace(/<[A-Z][A-Za-z0-9]*[^>]*\/?>/g, " ");
  content = content.replace(/<\/[A-Z][A-Za-z0-9]*>/g, " ");
  content = content.replace(/<[a-z][^>]*\/?>/g, " ");
  content = content.replace(/<\/[a-z][^>]+>/g, " ");
  content = content.replace(/`[^`\n]+`/g, " ");
  content = content.replace(/!\[[^\]]*\]\([^)]+\)/g, " ");
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  content = content.replace(/^#{1,6}\s+/gm, "");
  content = content.replace(/[*_]{1,3}/g, "");
  content = content.replace(/^>\s*/gm, "");
  content = content.replace(/^[-*_]{3,}\s*$/gm, "");

  return { prose: content, codeLines };
}

export function measureReadTime(entry: JournalManifestSourceEntry): number {
  const body = entry.body?.trim() ?? "";
  if (!body) return 0;

  const { prose, codeLines } = stripMdxContent(body);

  const wordsPerMinute = 200;
  const codeLinesPerMinute = 40;

  const proseWords = prose.trim().split(/\s+/).filter(Boolean).length;

  const totalMinutes =
    proseWords / wordsPerMinute + codeLines / codeLinesPerMinute;

  return Math.max(1, Math.ceil(totalMinutes));
}

function getIndexScope(entry: PublishFilterEntry): string | null {
  return entry.filePath ? journalIndexScope(entry.filePath) : null;
}

function isEntryInScope(entry: PublishFilterEntry, scope: string): boolean {
  return entry.id === scope || entry.id.startsWith(`${scope}/`);
}

export function filterPublishedJournalEntries<T extends PublishFilterEntry>(
  rawEntries: T[],
): T[] {
  const draftIndexScopes = rawEntries
    .filter((entry) => entry.data.draft === true)
    .map(getIndexScope)
    .filter((scope): scope is string => typeof scope === "string");

  return rawEntries.filter((entry) => {
    if (entry.data.draft === true) {
      return false;
    }

    return !draftIndexScopes.some((scope) => isEntryInScope(entry, scope));
  });
}

/** Contexts grouped by top-level vault folder, each with its index first. */
function groupByVault(contexts: EntryContext[]): Map<string, EntryContext[]> {
  const vaults = new Map<string, EntryContext[]>();

  for (const context of contexts) {
    const vaultId = getVaultDirectory(context.filepath);
    if (!vaultId) continue;

    const entries = vaults.get(vaultId) ?? [];
    if (isIndexFileFor(context.filepath, vaultId)) entries.unshift(context);
    else entries.push(context);
    vaults.set(vaultId, entries);
  }

  return vaults;
}

/**
 * The vault's entries with `vaultId` set. Children inherit the root's image
 * and GitHub repository unless they declare their own, so a vault shares one
 * cover and one repo link.
 */
function withVaultFields(
  entries: EntryContext[],
  vaultId: string,
): EntryContext[] {
  const root = entries[0]!;

  return entries.map((entry) => {
    const isChild = entry.id !== vaultId;
    return {
      ...entry,
      vaultId,
      ...(isChild && !entry.image && root.image ? { image: root.image } : {}),
      ...(isChild && !entry.github && root.github
        ? { github: root.github }
        : {}),
    };
  });
}

/**
 * The items below a folder's index: its own entries plus one group per
 * subfolder, sorted by order then title. `entries[0]` is the folder's index.
 */
function buildTree(entries: EntryContext[], path: string): VaultItem[] {
  enforce(requiresChildEntry(entries, path, "Vault section"));

  const items: VaultItem[] = [];
  const subfolders = new Map<string, EntryContext[]>();

  for (const entry of entries.slice(1)) {
    const [first, ...rest] = entry.filepath.slice(path.length + 1).split("/");
    if (rest.length === 0 || !first) {
      items.push(entry);
      continue;
    }

    const subPath = `${path}/${first}`;
    const bucket = subfolders.get(first) ?? [];
    if (isIndexFileFor(entry.filepath, subPath)) bucket.unshift(entry);
    else bucket.push(entry);
    subfolders.set(first, bucket);
  }

  for (const [subDir, subEntries] of subfolders) {
    const subPath = `${path}/${subDir}`;
    enforce(requiresSectionIndex(subEntries, subPath));

    const index = subEntries[0]!;
    items.push({
      id: subPath,
      title: index.title,
      order: index.order,
      index,
      items: buildTree(subEntries, subPath),
    });
  }

  return items.sort(sortByOrderThenTitle);
}

/** Entry ids in reading order: the root, then each item depth-first. */
function readingOrder(rootId: string, items: VaultItem[]): string[] {
  const walk = (list: VaultItem[]): string[] =>
    list.flatMap((item) =>
      isNestedGroup(item) ? [item.index.id, ...walk(item.items)] : [item.id],
    );
  return [rootId, ...walk(items)];
}

/** Each entry with `previous`/`next` set from its neighbours in `order`. */
function linkInOrder(
  byId: ReadonlyMap<string, EntryContext>,
  order: string[],
): Map<string, EntryContext> {
  return new Map(
    order.map((id, position) => {
      const previous = order[position - 1];
      const next = order[position + 1];
      return [
        id,
        {
          ...byId.get(id)!,
          ...(previous ? { previous } : {}),
          ...(next ? { next } : {}),
        },
      ];
    }),
  );
}

/** The same tree with every entry replaced by its linked version. */
function relinkTree(
  items: VaultItem[],
  linked: ReadonlyMap<string, EntryContext>,
): VaultItem[] {
  return items.map((item) =>
    isNestedGroup(item)
      ? {
          ...item,
          index: linked.get(item.index.id)!,
          items: relinkTree(item.items, linked),
        }
      : linked.get(item.id)!,
  );
}

function buildVault(
  vaultId: string,
  grouped: EntryContext[],
): { vault: VaultContext; entries: Map<string, EntryContext> } {
  enforce(requiresRootIndex(grouped, vaultId));
  enforce(
    requiresRootImage(grouped[0]!, vaultId),
    requiresChildEntry(grouped, vaultId, "Vault"),
  );

  const entries = withVaultFields(grouped, vaultId);
  const root = entries[0]!;
  const tree = buildTree(entries, vaultId);
  const linked = linkInOrder(
    new Map(entries.map((entry) => [entry.id, entry])),
    readingOrder(root.id, tree),
  );

  return {
    vault: {
      id: vaultId,
      title: root.title,
      order: root.order,
      index: linked.get(root.id)!,
      items: relinkTree(tree, linked),
      itemCount: entries.length,
    },
    entries: linked,
  };
}

/** Manifests for entries that are already published (see buildJournalManifest). */
export function buildManifest(
  publishedEntries: JournalManifestSourceEntry[],
): [Record<string, EntryContext>, Record<string, VaultContext>] {
  const contexts = publishedEntries.map(mapEntryToContext);
  const vaultsManifest: Record<string, VaultContext> = {};
  const vaultEntries = new Map<string, EntryContext>();

  for (const [vaultId, grouped] of groupByVault(contexts)) {
    const { vault, entries } = buildVault(vaultId, grouped);
    vaultsManifest[vaultId] = vault;
    for (const [id, entry] of entries) vaultEntries.set(id, entry);
  }

  const entryManifest: Record<string, EntryContext> = {};
  for (const context of contexts) {
    const entry = vaultEntries.get(context.id) ?? context;
    if (!entry.vaultId) enforce(requiresStandaloneImage(entry));
    entryManifest[entry.id] = entry;
  }

  return [entryManifest, vaultsManifest];
}

/** Entry and vault manifests for the published subset of `rawEntries`. */
export function buildJournalManifest(
  rawEntries: JournalManifestSourceEntry[],
): [Record<string, EntryContext>, Record<string, VaultContext>] {
  return buildManifest(filterPublishedJournalEntries(rawEntries));
}

export function mapEntryToContext(
  entry: JournalManifestSourceEntry,
): EntryContext {
  const { pubDate, updatePubDate } = entry.data;

  if (updatePubDate && !pubDate) {
    throw new Error(
      `[thejournal] Entry "${entry.id}" has updatePubDate set but is missing pubDate. ` +
        `updatePubDate requires pubDate to be present.`,
    );
  }
  if (!pubDate) {
    throw new Error(`[thejournal] Entry "${entry.id}" is missing pubDate.`);
  }

  return {
    id: getIndexScope(entry) ?? entry.id,
    filepath: normalizeJournalFilePath(entry.filePath),
    title: entry.data.title,
    readTime: measureReadTime(entry),
    description: entry.data.description ?? DEFAULT_DESCRIPTION,
    tags: entry.data.tags ?? [],
    order: entry.data.order ?? DEFAULT_ORDER,
    pubDate,
    ...(entry.data.image ? { image: entry.data.image } : {}),
    ...(entry.data.github ? { github: entry.data.github } : {}),
    ...(updatePubDate ? { updatedDate: updatePubDate } : {}),
  };
}

function sortByOrderThenTitle(a: VaultItem, b: VaultItem) {
  const orderA = a.order ?? DEFAULT_ORDER;
  const orderB = b.order ?? DEFAULT_ORDER;

  return orderA - orderB || a.title.localeCompare(b.title);
}

export function resolveJournalContext(
  path: string,
  entryManifest: Record<string, EntryContext>,
  vaultsManifest: Record<string, VaultContext>,
): [EntryContext | null, VaultContext | null] {
  const id = path
    .replace(new RegExp(`^${journalIndexHref.replace(/\/$/, "")}/?`), "")
    .replace(/\/$/, "");

  const entry = entryManifest[id] ?? null;
  if (!entry) {
    return [null, null];
  }

  const vaultId = entry.vaultId;
  const vault = vaultId ? (vaultsManifest[vaultId] ?? null) : null;

  return [entry, vault];
}
