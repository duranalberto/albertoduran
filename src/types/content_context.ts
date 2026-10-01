import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";

export type JournalEntry = CollectionEntry<"thejournal">;

interface BaseContext {
  id: string;
  title: string;
  order: number;
  next?: string;
  previous?: string;
}

export interface EntryContext extends BaseContext {
  image?: ImageMetadata;
  description: string;
  github?: string;
  readTime: number;
  tags: string[];
  pubDate: Date;
  updatedDate?: Date;
  filepath: string;
  /** The top-level vault this entry belongs to; absent for standalone entries. */
  vaultId?: string;
}

export interface NestedGroup extends BaseContext {
  index: EntryContext;
  items: VaultItem[];
}

export type VaultItem = EntryContext | NestedGroup;

export interface VaultContext extends BaseContext {
  index: EntryContext;
  items: VaultItem[];
  itemCount: number;
}
