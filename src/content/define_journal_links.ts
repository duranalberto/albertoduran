import type { JournalRef } from "@appTypes/journal_links";
import {
  entryManifest,
  publishedEntries,
} from "@content/processors/thejournal";
import { render } from "astro:content";
import { resolveJournalLinks, type ResolvedJournalLinks } from "./journal_links";

const headingCache = new Map<string, Promise<ReadonlySet<string>>>();

function headingsFor(id: string): Promise<ReadonlySet<string>> {
  let headings = headingCache.get(id);

  if (!headings) {
    headings = (async () => {
      const entry = publishedEntries.find((candidate) => candidate.id === id);
      if (!entry) return new Set<string>();

      const { headings: rendered } = await render(entry);
      return new Set(rendered.map((heading) => heading.slug));
    })();
    headingCache.set(id, headings);
  }

  return headings;
}

export function defineJournalLinks<const T extends Record<string, JournalRef>>(
  refs: T,
  options: { owner: string; vault?: string },
): Promise<ResolvedJournalLinks<T>> {
  return resolveJournalLinks(refs, {
    ...options,
    manifest: entryManifest,
    headingsFor,
    onAnchorMismatch: import.meta.env.DEV ? "warn" : "error",
  });
}

export { journalHref, journalIndexHref } from "./journal_links";
