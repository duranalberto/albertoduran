import type { EntryContext } from "@appTypes/content_context";
import type {
  AnchorMismatchMode,
  JournalRef,
  ResolvedJournalLink,
} from "@appTypes/journal_links";

export const journalIndexHref = "/thejournal/";

export function journalHref(id: string, anchor?: string): string {
  return `${journalIndexHref}${id}/${anchor ? `#${anchor}` : ""}`;
}

export interface JournalLinkContext {
  owner: string;
  vault?: string;
  manifest: Readonly<Record<string, EntryContext>>;
  headingsFor: (id: string) => Promise<ReadonlySet<string>>;
  onAnchorMismatch?: AnchorMismatchMode;
  warn?: (message: string) => void;
}

export type ResolvedJournalLinks<T extends Record<string, JournalRef>> = {
  readonly [K in keyof T]: ResolvedJournalLink;
};

export function normalizeJournalRefId(id: string, vault?: string): string {
  const trimmed = id.replace(/^\/+|\/+$/g, "");

  if (!vault || trimmed === vault || trimmed.startsWith(`${vault}/`)) {
    return trimmed;
  }

  return `${vault}/${trimmed}`;
}

function editDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0]!;
    previous[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const above = previous[j]!;
      previous[j] = Math.min(
        above + 1,
        previous[j - 1]! + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }

  return previous[b.length]!;
}

export function suggestClosest(
  target: string,
  candidates: Iterable<string>,
): string | undefined {
  let best: { value: string; distance: number } | undefined;

  for (const candidate of candidates) {
    const distance = editDistance(target, candidate);
    if (!best || distance < best.distance) {
      best = { value: candidate, distance };
    }
  }

  if (!best) return undefined;

  const tolerance = Math.max(3, Math.floor(target.length / 3));
  return best.distance <= tolerance ? best.value : undefined;
}

function didYouMean(suggestion: string | undefined): string {
  return suggestion ? ` Did you mean "${suggestion}"?` : "";
}

export async function resolveJournalLinks<
  const T extends Record<string, JournalRef>,
>(refs: T, context: JournalLinkContext): Promise<ResolvedJournalLinks<T>> {
  const {
    owner,
    vault,
    manifest,
    headingsFor,
    onAnchorMismatch = "error",
    warn = console.warn,
  } = context;
  const resolved: Record<string, ResolvedJournalLink> = {};

  for (const [key, ref] of Object.entries(refs)) {
    const rawId = typeof ref === "string" ? ref : ref.id;
    const anchor =
      typeof ref === "string" ? undefined : ref.anchor?.replace(/^#/, "");
    const vaultRelativeId = normalizeJournalRefId(rawId, vault);
    const absoluteId = normalizeJournalRefId(rawId);
    const id =
      manifest[vaultRelativeId] || !manifest[absoluteId]
        ? vaultRelativeId
        : absoluteId;
    const entry = manifest[id];

    if (!entry) {
      throw new Error(
        `[projects] ${owner}: Journal link "${key}" points to "${id}", which is not a published Journal entry.` +
          didYouMean(suggestClosest(id, Object.keys(manifest))),
      );
    }

    if (anchor) {
      const headings = await headingsFor(id);

      if (!headings.has(anchor)) {
        const message =
          `[projects] ${owner}: Journal link "${key}" points to "#${anchor}", which is not a heading in "${id}".` +
          didYouMean(suggestClosest(anchor, headings)) +
          ` Available headings: ${[...headings].join(", ") || "none"}.`;

        if (onAnchorMismatch === "warn") {
          warn(message);
        } else {
          throw new Error(message);
        }
      }
    }

    resolved[key] = {
      id,
      href: journalHref(id, anchor),
      title: entry.title,
      description: entry.description,
      readTime: entry.readTime,
      pubDate: entry.pubDate,
      ...(entry.updatedDate ? { updatedDate: entry.updatedDate } : {}),
      ...(anchor ? { anchor } : {}),
      ...(entry.vaultId ? { vaultId: entry.vaultId } : {}),
    };
  }

  return resolved as ResolvedJournalLinks<T>;
}
