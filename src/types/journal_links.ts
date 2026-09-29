export type JournalRef = string | { id: string; anchor?: string };

export interface ResolvedJournalLink {
  id: string;
  href: string;
  title: string;
  description: string;
  readTime: number;
  pubDate: Date;
  updatedDate?: Date;
  anchor?: string;
  vaultId?: string;
}

export type AnchorMismatchMode = "error" | "warn";
