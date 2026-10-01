import { journalSchema } from "@content/journal_schema";
import { z } from "astro/zod";
import { describe, expect, it } from "vitest";

// Astro supplies `image()` at build time; a string stands in for it here.
const schema = journalSchema({ image: () => z.string() });

const minimal = { title: "Entry", pubDate: "2026-07-01" };

describe("journal frontmatter schema", () => {
  it("applies defaults for optional fields", () => {
    const data = schema.parse(minimal);

    expect(data).toMatchObject({
      title: "Entry",
      description: "Without description available.",
      tags: [],
      order: 100,
    });
    expect(data.pubDate).toEqual(new Date("2026-07-01T00:00:00.000Z"));
  });

  it("accepts every declared field", () => {
    const data = schema.parse({
      ...minimal,
      author: "Alberto Duran",
      github: "albertoduran",
      image: "../assets/cover.jpg",
      description: "Described.",
      updatePubDate: "2026-08-01",
      tags: ["astro"],
      order: 10,
      draft: true,
    });

    expect(data.author).toBe("Alberto Duran");
    expect(data.updatePubDate).toEqual(new Date("2026-08-01T00:00:00.000Z"));
  });

  it("requires pubDate", () => {
    expect(schema.safeParse({ title: "Entry" }).success).toBe(false);
  });

  it("rejects undeclared keys instead of silently dropping them", () => {
    const result = schema.safeParse({ ...minimal, pubdate: "2026-07-02" });

    expect(result.success).toBe(false);
  });
});
