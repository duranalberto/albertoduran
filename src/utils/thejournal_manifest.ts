import {
  type EntryContext,
  type JournalEntry,
  type VaultContext,
  type VaultItem,
} from "@appTypes/content_context";
import type { Sites } from "@appTypes/navigation";
import { getCollection } from "astro:content";

const site: Sites = "/thejournal/";

function normalizeFilePath(filePath?: string): string {
  if (!filePath) return "";

  const cleanSite = site.endsWith("/") ? site.slice(0, -1) : site;
  const marker = `src${cleanSite}/`;

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

function stripMdxContent(body: string): {
  prose: string;
  codeLines: number;
} {
  let content = body;
  let codeLines = 0;

  // Remove fenced code blocks; accumulate non-fence lines for code read-time
  content = content.replace(/```[\s\S]*?```/g, (match) => {
    const lines = match.split("\n");
    // Subtract the two fence lines (opening ```lang and closing ```)
    codeLines += Math.max(0, lines.length - 2);
    return " ";
  });

  // Remove import / export statements at line start
  content = content.replace(/^(import|export)\s[^\n]*/gm, "");

  // Remove self-closing and opening JSX/MDX component tags (PascalCase)
  content = content.replace(/<[A-Z][A-Za-z0-9]*[^>]*\/?>/g, " ");
  // Remove closing JSX/MDX component tags
  content = content.replace(/<\/[A-Z][A-Za-z0-9]*>/g, " ");

  // Remove HTML tags (lowercase)
  content = content.replace(/<[a-z][^>]*\/?>/g, " ");
  content = content.replace(/<\/[a-z][^>]+>/g, " ");

  // Remove inline code spans (single backtick, no newlines)
  content = content.replace(/`[^`\n]+`/g, " ");

  // Keep link text, drop URL: [text](url) → text
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove image markdown entirely
  content = content.replace(/!\[[^\]]*\]\([^)]+\)/g, " ");

  // Remove heading markers
  content = content.replace(/^#{1,6}\s+/gm, "");

  // Remove bold / italic markers (2-3 chars: **, __, ***, etc.)
  content = content.replace(/[*_]{1,3}/g, "");

  // Remove blockquote markers
  content = content.replace(/^>\s*/gm, "");

  // Remove horizontal rules
  content = content.replace(/^[-*_]{3,}\s*$/gm, "");

  return { prose: content, codeLines };
}

function measureReadTime(entry: JournalEntry): number {
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

    if (!rootIndex.image) {
      throw new Error(
        `[thejournal] Vault root entry "${rootIndex.id}" is missing a required image. ` +
          `Every vault root index (${vaultId}/index.mdx) must declare an image in its frontmatter.`,
      );
    }

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
    } else if (isVaultChild && !entry.image) {
      const vault = vaultsManifest[entry.vaultId];
      if (vault?.index?.image) {
        entry.image = vault.index.image;
      }
    }
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

function mapEntryToContext(entry: JournalEntry): EntryContext {
  const normalizedPath = normalizeFilePath(entry.filePath);
  if (entry.data.updatePubDate && !entry.data.pubDate) {
    throw new Error(
      `[thejournal] Entry "${entry.id}" has updatePubDate set but is missing pubDate. ` +
        `updatePubDate requires pubDate to be present.`,
    );
  }

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
    updatedDate: entry.data.updatePubDate,
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
  const cleanSite = site.replace(/\/$/, "");
  const id = path.replace(new RegExp(`^${cleanSite}/?`), "").replace(/\/$/, "");
  const entry = entryManifest[id] ?? null;
  const vaultId = entry?.vaultId || getVaultDirectory(id);
  const vault = vaultId ? (vaultsManifest[vaultId] ?? null) : null;

  return [entry, vault];
}
