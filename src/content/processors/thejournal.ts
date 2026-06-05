import type {
  EntryContext,
  JournalEntry,
  VaultContext,
} from "@appTypes/content_context";
import { getCollection } from "astro:content";
import {
  buildJournalManifest,
  resolveJournalContext,
} from "./thejournal-manifest.ts";

async function loadManifest(): Promise<
  [Record<string, EntryContext>, Record<string, VaultContext>, JournalEntry[]]
> {
  const rawEntries = await getCollection("thejournal");
  const [entryManifest, vaultsManifest] = buildJournalManifest(rawEntries);

  return [entryManifest, vaultsManifest, rawEntries];
}

export const [entryManifest, vaultsManifest, rawEntries] = await loadManifest();

export function getContextFromPath(
  path: string,
): [EntryContext | null, VaultContext | null] {
  return resolveJournalContext(path, entryManifest, vaultsManifest);
}
