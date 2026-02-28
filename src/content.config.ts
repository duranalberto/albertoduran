import { type Sites } from "@appTypes/navigation";
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const site: Sites = "/thejournal";

const thejournal = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: `./src${site}`,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      github: z.string().optional(),
      image: image().optional(),
      description: z.string().default("Without description available."),
      pubDate: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      order: z.number().default(100),
    }),
});

export const collections = { thejournal };
