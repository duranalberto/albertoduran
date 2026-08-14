import type {
  EntryContext,
  VaultContext,
  VaultItem,
} from "@appTypes/content_context";
import type { Sites } from "@appTypes/navigation";
import type { ImageMetadata } from "astro";

const site: Sites = "/thejournal/";

export interface JournalManifestSourceEntry {
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

export function normalizeJournalFilePath(filePath?: string): string {
  if (!filePath) return "";

  const cleanSite = site.endsWith("/") ? site.slice(0, -1) : site;
  const marker = `src${cleanSite}/`;

  const index = filePath.indexOf(marker);

  if (index === -1) {
    return filePath;
  }

  return filePath.slice(index + marker.length);
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

function addEntryToList(
  list: EntryContext[],
  entry: EntryContext,
  expectedIndexPath: string,
): void {
  if (isIndexFileForPath(entry.filepath, expectedIndexPath)) {
    list.unshift(entry);
  } else {
    list.push(entry);
  }
}

function isIndexFileForPath(
  filepath: string,
  expectedIndexPath: string,
): boolean {
  return (
    filepath === `${expectedIndexPath}/index.mdx` ||
    filepath === `${expectedIndexPath}/index.md`
  );
}

function getIndexScope(entry: JournalManifestSourceEntry): string | null {
  const normalizedPath = normalizeJournalFilePath(entry.filePath);
  const match = normalizedPath.match(/^(.*)\/index\.mdx?$/);

  return match?.[1] ?? null;
}

function isEntryInScope(
  entry: JournalManifestSourceEntry,
  scope: string,
): boolean {
  return entry.id === scope || entry.id.startsWith(`${scope}/`);
}

export function filterPublishedJournalEntries<
  T extends JournalManifestSourceEntry,
>(rawEntries: T[]): T[] {
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

function linkVaultEntries(vault: VaultContext) {
  let prevEntry: EntryContext = vault.index;

  const traverse = (items: VaultItem[]) => {
    for (const item of items) {
      let currentEntry: EntryContext;
      let children: VaultItem[] | undefined;
      if ("items" in item) {
        currentEntry = item.index;
        children = item.items;
      } else {
        currentEntry = item;
      }

      prevEntry.next = currentEntry.id;
      currentEntry.previous = prevEntry.id;
      prevEntry = currentEntry;

      if (children) {
        traverse(children);
      }
    }
  };

  traverse(vault.items);
}

export function buildJournalManifest(
  rawEntries: JournalManifestSourceEntry[],
): [Record<string, EntryContext>, Record<string, VaultContext>] {
  const publishedEntries = filterPublishedJournalEntries(rawEntries);
  const entryManifest: Record<string, EntryContext> = {};
  const rootVaults: Record<string, EntryContext[]> = {};

  for (const entry of publishedEntries) {
    const context = mapEntryToContext(entry);
    entryManifest[context.id] = context;

    const vaultId = getVaultDirectory(context.filepath);

    if (vaultId) {
      if (!rootVaults[vaultId]) {
        rootVaults[vaultId] = [];
      }

      addEntryToList(rootVaults[vaultId], context, vaultId);
    }
  }

  const vaultsManifest: Record<string, VaultContext> = {};

  for (const [vaultId, entries] of Object.entries(rootVaults)) {
    const rootIndex = entries[0];

    if (!rootIndex || !isIndexFileForPath(rootIndex.filepath, vaultId)) {
      throw new Error(
        `[thejournal] Vault "${vaultId}" is missing a required root index. ` +
          `Add ${vaultId}/index.mdx or ${vaultId}/index.md before adding entries under this folder.`,
      );
    }

    if (!rootIndex.image) {
      throw new Error(
        `[thejournal] Vault root entry "${rootIndex.id}" is missing a required image. ` +
          `Every vault root index (${vaultId}/index.mdx or ${vaultId}/index.md) must declare an image in its frontmatter.`,
      );
    }

    for (const entry of entries) {
      entry.vaultId = vaultId;
    }

    assertVaultHasChildEntries(entries, vaultId);

    vaultsManifest[vaultId] = {
      id: vaultId,
      title: rootIndex.title,
      order: rootIndex.order,
      index: rootIndex,
      items: buildNestedStructure(entries, vaultId),
      itemCount: entries.length,
    };

    linkVaultEntries(vaultsManifest[vaultId]);
  }

  for (const [id, entry] of Object.entries(entryManifest)) {
    const isStandalone = !entry.vaultId;
    const isVaultRoot = !!entry.vaultId && entry.id === entry.vaultId;
    const isVaultChild = !!entry.vaultId && entry.id !== entry.vaultId;

    if (isStandalone || isVaultRoot) {
      if (!entry.image) {
        throw new Error(
          `[thejournal] Entry "${id}" is missing a required image. ` +
            `${isStandalone ? "Standalone publications" : "Vault root indexes"} ` +
            `must declare an image in their frontmatter.`,
        );
      }
    } else if (isVaultChild) {
      const vault = vaultsManifest[entry.vaultId];

      // Vault children inherit the root index's image and GitHub repository
      // unless they declare their own, so the whole vault shares one repo link.
      if (!entry.image && vault?.index?.image) {
        entry.image = vault.index.image;
      }

      if (!entry.github && vault?.index?.github) {
        entry.github = vault.index.github;
      }
    }
  }

  return [entryManifest, vaultsManifest];
}

function buildNestedStructure(
  entries: EntryContext[],
  currentPath: string,
): VaultItem[] {
  const currentIndex = entries[0];

  if (
    !currentIndex ||
    !isIndexFileForPath(currentIndex.filepath, currentPath)
  ) {
    throw new Error(
      `[thejournal] Vault section "${currentPath}" is missing a required index. ` +
        `Add ${currentPath}/index.mdx or ${currentPath}/index.md before adding entries under this folder.`,
    );
  }

  assertVaultHasChildEntries(entries, currentPath, "Vault section");

  const items: VaultItem[] = [];
  const subfolderBuckets: Record<string, EntryContext[]> = {};

  for (let i = 1; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) continue;

    const relative = entry.filepath.slice(currentPath.length + 1);
    const parts = relative.split("/");

    if (parts.length === 1) {
      items.push(entry);
    } else {
      const subDir = parts[0];
      if (subDir) {
        if (!subfolderBuckets[subDir]) {
          subfolderBuckets[subDir] = [];
        }

        addEntryToList(
          subfolderBuckets[subDir]!,
          entry,
          `${currentPath}/${subDir}`,
        );
      }
    }
  }

  for (const [subDir, subEntries] of Object.entries(subfolderBuckets)) {
    const subIndex = subEntries[0];
    const subPath = `${currentPath}/${subDir}`;

    if (!subIndex || !isIndexFileForPath(subIndex.filepath, subPath)) {
      throw new Error(
        `[thejournal] Vault section "${subPath}" is missing a required index. ` +
          `Add ${subPath}/index.mdx or ${subPath}/index.md before adding entries under this folder.`,
      );
    }

    items.push({
      id: subPath,
      title: subIndex.title,
      order: subIndex.order,
      index: subIndex,
      items: buildNestedStructure(subEntries, subPath),
    });
  }

  return items.sort(sortByOrderThenTitle);
}

function assertVaultHasChildEntries(
  entries: EntryContext[],
  path: string,
  label = "Vault",
): void {
  if (entries.length > 1) {
    return;
  }

  throw new Error(
    `[thejournal] ${label} "${path}" contains only an index entry. ` +
      `Add at least one child publication, or make it a standalone publication at src/thejournal/${path}.mdx.`,
  );
}

export function mapEntryToContext(
  entry: JournalManifestSourceEntry,
): EntryContext {
  const normalizedPath = normalizeJournalFilePath(entry.filePath);
  const indexScope = getIndexScope(entry);
  const id = indexScope ?? entry.id;

  if (entry.data.updatePubDate && !entry.data.pubDate) {
    throw new Error(
      `[thejournal] Entry "${entry.id}" has updatePubDate set but is missing pubDate. ` +
        `updatePubDate requires pubDate to be present.`,
    );
  }

  return {
    id,
    filepath: normalizedPath,
    title: entry.data.title,
    readTime: measureReadTime(entry),
    description: entry.data.description ?? "Without description available.",
    tags: entry.data.tags ?? [],
    order: entry.data.order ?? 100,
    vaultId: "",
    pubDate: entry.data.pubDate as Date,
    ...(entry.data.image ? { image: entry.data.image } : {}),
    ...(entry.data.github ? { github: entry.data.github } : {}),
    ...(entry.data.updatePubDate
      ? { updatedDate: entry.data.updatePubDate }
      : {}),
  };
}

function sortByOrderThenTitle(a: VaultItem, b: VaultItem) {
  const orderA = a.order ?? 100;
  const orderB = b.order ?? 100;

  return orderA - orderB || a.title.localeCompare(b.title);
}

export function resolveJournalContext(
  path: string,
  entryManifest: Record<string, EntryContext>,
  vaultsManifest: Record<string, VaultContext>,
): [EntryContext | null, VaultContext | null] {
  const cleanSite = site.replace(/\/$/, "");
  const id = path.replace(new RegExp(`^${cleanSite}/?`), "").replace(/\/$/, "");

  const entry = entryManifest[id] ?? null;
  if (!entry) {
    return [null, null];
  }

  const vaultId = entry.vaultId;
  const vault = vaultId ? (vaultsManifest[vaultId] ?? null) : null;

  return [entry, vault];
}
