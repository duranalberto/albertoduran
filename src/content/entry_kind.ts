import type { NestedGroup, VaultItem } from "@appTypes/content_context";

/** Where a Journal entry sits: on its own, as a vault's root, or inside one. */
export type EntryKind = "standalone" | "vaultRoot" | "vaultChild";

/** Anything with an entry id and its vault id ("" or absent = no vault). */
interface EntryRef {
  id: string;
  vaultId?: string | undefined;
}

export function entryKind({ id, vaultId }: EntryRef): EntryKind {
  if (!vaultId) return "standalone";
  return id === vaultId ? "vaultRoot" : "vaultChild";
}

export const isStandalone = (entry: EntryRef) =>
  entryKind(entry) === "standalone";
export const isVaultRoot = (entry: EntryRef) =>
  entryKind(entry) === "vaultRoot";
export const isVaultChild = (entry: EntryRef) =>
  entryKind(entry) === "vaultChild";

/** A vault tree item that is a section (with its own items), not an entry. */
export const isNestedGroup = (item: VaultItem): item is NestedGroup =>
  "items" in item;
