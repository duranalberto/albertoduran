import {
  type EntryContext,
  type JournalEntry,
  type VaultContext,
  type VaultItem,
} from "@appTypes/content_context";
import type { Sites } from "@appTypes/navigation";
import { getCollection } from "astro:content";

const site: Sites = "/thejournal";

function normalizeFilePath(filePath?: string): string {
  if (!filePath) return "";

  const marker = `src${site}/`;
  const index = filePath.indexOf(marker);

  if (index === -1) {
    return filePath;
  }

  const normalized = filePath.slice(index + marker.length);
  return normalized;
}

function getVaultDirectory(filepath?: string): string | null {
  if (!filepath) return null;
  const parts = filepath.split("/");

  return parts.length > 1 ? parts[0] : null;
}

function addEntryToList(
  list: EntryContext[],
  entry: EntryContext,
  expectedIndexPath: string,
): void {
  if (entry.filepath === `${expectedIndexPath}/index.mdx`) {
    list.unshift(entry);
  } else {
    list.push(entry);
  }
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

async function loadManifest(): Promise<
  [Record<string, EntryContext>, Record<string, VaultContext>, JournalEntry[]]
> {
  const rawEntries = await getCollection("thejournal");

  const entryManifest: Record<string, EntryContext> = {};
  const rootVaults: Record<string, EntryContext[]> = {};

  for (const entry of rawEntries) {
    const context = mapEntryToContext(entry);
    entryManifest[context.id] = context;

    const vaultId = getVaultDirectory(context.filepath);

    if (vaultId) {
      context.vaultId = vaultId;

      if (!rootVaults[vaultId]) {
        rootVaults[vaultId] = [];
      }

      addEntryToList(rootVaults[vaultId], context, vaultId);
    }
  }

  const vaultsManifest: Record<string, VaultContext> = {};

  for (const [vaultId, entries] of Object.entries(rootVaults)) {
    const rootIndex = entries[0];

    if (!rootIndex || rootIndex.filepath !== `${vaultId}/index.mdx`) {
      continue;
    }

    vaultsManifest[vaultId] = {
      id: vaultId,
      title: rootIndex.title,
      order: rootIndex.order,
      index: rootIndex,
      items: buildNestedStructure(entries, vaultId),
    };

    linkVaultEntries(vaultsManifest[vaultId]);
  }

  return [entryManifest, vaultsManifest, rawEntries];
}

function buildNestedStructure(
  entries: EntryContext[],
  currentPath: string,
): VaultItem[] {
  const currentIndex = entries[0];

  if (!currentIndex || currentIndex.filepath !== `${currentPath}/index.mdx`) {
    return [];
  }

  const items: VaultItem[] = [];
  const subfolderBuckets: Record<string, EntryContext[]> = {};

  for (let i = 1; i < entries.length; i++) {
    const entry = entries[i];
    const relative = entry.filepath.slice(currentPath.length + 1);
    const parts = relative.split("/");

    if (parts.length === 1) {
      items.push(entry);
    } else {
      const subDir = parts[0];
      if (!subfolderBuckets[subDir]) {
        subfolderBuckets[subDir] = [];
      }

      addEntryToList(
        subfolderBuckets[subDir],
        entry,
        `${currentPath}/${subDir}`,
      );
    }
  }

  for (const [subDir, subEntries] of Object.entries(subfolderBuckets)) {
    const subIndex = subEntries[0];
    const subPath = `${currentPath}/${subDir}`;

    if (subIndex && subIndex.filepath === `${subPath}/index.mdx`) {
      items.push({
        id: subPath,
        title: subIndex.title,
        order: subIndex.order,
        index: subIndex,
        items: buildNestedStructure(subEntries, subPath),
      });
    }
  }

  return items.sort(sortByOrderThenTitle);
}

function measureReadTime(entry: JournalEntry): number {
  const wordsPerMinute = 160;
  const words = entry.body?.trim().split(/\s+/).length;
  return words ? Math.ceil(words / wordsPerMinute) : 0;
}

function mapEntryToContext(entry: JournalEntry): EntryContext {
  const normalizedPath = normalizeFilePath(entry.filePath);

  return {
    id: entry.id,
    filepath: normalizedPath,
    title: entry.data.title,
    image: entry.data.image,
    github: entry.data.github,
    readTime: measureReadTime(entry),
    description: entry.data.description,
    tags: entry.data.tags,
    pubDate: entry.data.pubDate,
    order: entry.data.order ?? 100,
    vaultId: "",
  };
}

function sortByOrderThenTitle(a: VaultItem, b: VaultItem) {
  const orderA = a.order ?? 100;
  const orderB = b.order ?? 100;

  return orderA - orderB || a.title.localeCompare(b.title);
}

export const [entryManifest, vaultsManifest, rawEntries] = await loadManifest();

export function getContextFromPath(
  path: string,
): [EntryContext | null, VaultContext | null] {
  const id = path.startsWith(`${site}/`)
    ? path.replace(`${site}/`, "")
    : path.replace(/^\//, "");

  const entry = entryManifest[id] ?? null;
  const vaultId = entry?.vaultId || getVaultDirectory(id);
  const vault = vaultId ? (vaultsManifest[vaultId] ?? null) : null;

  return [entry, vault];
}
