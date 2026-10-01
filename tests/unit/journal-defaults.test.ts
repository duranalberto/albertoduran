import { journalSchema } from "@content/journal_schema";
import { DEFAULT_DESCRIPTION, DEFAULT_ORDER } from "@content/journal_defaults";
import { mapEntryToContext } from "@content/processors/thejournal-manifest";
import { z } from "astro/zod";
import { describe, expect, it } from "vitest";

describe("journal defaults", () => {
  it("apply the same values in the schema and the manifest", () => {
    const parsed = journalSchema({ image: () => z.string() }).parse({
      title: "Entry",
      pubDate: "2026-07-01",
    });
    const context = mapEntryToContext({
      id: "entry",
      filePath: "src/thejournal/entry.mdx",
      data: { title: "Entry", pubDate: new Date("2026-07-01") },
    });

    expect(parsed.description).toBe(DEFAULT_DESCRIPTION);
    expect(context.description).toBe(DEFAULT_DESCRIPTION);
    expect(parsed.order).toBe(DEFAULT_ORDER);
    expect(context.order).toBe(DEFAULT_ORDER);
  });
});
