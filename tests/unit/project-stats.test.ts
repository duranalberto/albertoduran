import { publishedEntries } from "@content/processors/thejournal";
import { projectStatCounts, resolveProjectStat } from "@content/project_stats";
import { describe, expect, it } from "vitest";

describe("resolveProjectStat", () => {
  it("passes a static figure through", () => {
    expect(
      resolveProjectStat(
        { value: "9", label: "AI agents" },
        { journalPublications: 0 },
      ),
    ).toEqual({ value: "9", label: "AI agents" });
  });

  it("fills a counted figure from the counts", () => {
    expect(
      resolveProjectStat(
        { count: "journalPublications", label: "publications" },
        { journalPublications: 12 },
      ),
    ).toEqual({ value: "12", label: "publications" });
  });

  it("counts published Journal entries", () => {
    expect(projectStatCounts.journalPublications).toBe(publishedEntries.length);
  });
});
