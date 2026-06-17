import type {
  EntryContext,
  JournalEntry,
  VaultContext,
} from "@appTypes/content_context";
import { getCollection } from "astro:content";
import {
  buildJournalManifest,
  filterPublishedJournalEntries,
  resolveJournalContext,
} from "./thejournal-manifest.ts";

async function loadManifest(): Promise<
  [Record<string, EntryContext>, Record<string, VaultContext>, JournalEntry[]]
> {
  const rawEntries = await getCollection("thejournal");
  const publishedEntries = filterPublishedJournalEntries(rawEntries);
  const [entryManifest, vaultsManifest] =
    buildJournalManifest(publishedEntries);

  return [entryManifest, vaultsManifest, publishedEntries];
}

export const [entryManifest, vaultsManifest, publishedEntries] =
  await loadManifest();

export function getContextFromPath(
  path: string,
): [EntryContext | null, VaultContext | null] {
  return resolveJournalContext(path, entryManifest, vaultsManifest);
}
