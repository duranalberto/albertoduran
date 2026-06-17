import atlas_loader from "@utils/atlas_loader";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const thejournal = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/thejournal",
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        github: z.string().optional(),
        image: image().optional(),
        description: z.string().default("Without description available."),
        pubDate: z.coerce.date(),
        updatePubDate: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        order: z.number().default(100),
        draft: z.boolean().optional(),
      })
      .refine(
        (data) => {
          if (data.updatePubDate && !data.pubDate) {
            return false;
          }
          return true;
        },
        {
          message:
            "updatePubDate requires pubDate to be set. Add a pubDate field to this entry.",
          path: ["updatePubDate"],
        },
      ),
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
