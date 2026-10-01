import { journalSchema } from "@content/journal_schema";
import atlas_loader from "@utils/atlas_loader";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const thejournal = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/thejournal",
  }),
  schema: ({ image }) => journalSchema({ image }),
});

const atlasData = defineCollection({
  loader: atlas_loader,
  schema: z.object({
    standing: z.string(),
    record: z.string(),
    points: z.number(),
    homeTeam: z.string(),
    awayTeam: z.string(),
    rawDate: z.string(),
    stadium: z.string(),
    city: z.string(),
  }),
});

export const collections = {
  thejournal,
  atlasData,
};
