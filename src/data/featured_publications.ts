import type { EntryContext } from "@appTypes/content_context";

/** The Journal entries starred on the home page, in display order. */
export const featuredPublicationIds = [
  "siliconboutique",
  "langchain_ollama",
  "aws_serverless_vod",
] as const;

/** Look up each id; an unpublished or misspelled id fails the build. */
export function resolveFeaturedPublications(
  manifest: Readonly<Record<string, EntryContext>>,
  ids: readonly string[] = featuredPublicationIds,
): EntryContext[] {
  return ids.map((id) => {
    const entry = manifest[id];
    if (!entry) {
      throw new Error(
        `[home] Featured publication "${id}" is not a published Journal entry.`,
      );
    }
    return entry;
  });
}
