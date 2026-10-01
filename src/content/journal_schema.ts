import { z } from "astro/zod";
import { DEFAULT_DESCRIPTION, DEFAULT_ORDER } from "./journal_defaults";

interface JournalSchemaContext<Image extends z.ZodType> {
  /** Astro's `image()` helper from the collection schema context. */
  image: () => Image;
}

/**
 * Frontmatter schema for theJournal entries. Strict, so a misspelled or
 * undeclared key fails the build instead of being dropped silently.
 */
export function journalSchema<Image extends z.ZodType>({
  image,
}: JournalSchemaContext<Image>) {
  return z
    .object({
      title: z.string(),
      author: z.string().optional(),
      github: z.string().optional(),
      image: image().optional(),
      description: z.string().default(DEFAULT_DESCRIPTION),
      pubDate: z.coerce.date(),
      updatePubDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      order: z.number().default(DEFAULT_ORDER),
      draft: z.boolean().optional(),
    })
    .strict();
}
