import {
  getProjectEntryHref,
  type ProjectLandingRoute,
} from "@data/project_pages";
import { projectCatalog } from "@data/projects";
import { describe, expect, it } from "vitest";

describe("project page routing", () => {
  it("exposes six unique project landing-page summaries", () => {
    expect(projectCatalog).toHaveLength(6);

    const routes = projectCatalog.map(({ href }) => href);
    expect(new Set(routes).size).toBe(6);
    expect(routes).toEqual([
      "/projects/pressroom/",
      "/projects/equilyze/",
      "/projects/mlscraper/",
      "/projects/sin-pluma/",
      "/projects/equity-valuation-engine/",
      "/projects/albertoduran/",
    ]);
  });

  it.each([
    ["building_albertoduran", "/projects/albertoduran/"],
    ["equity_valuation_engine", "/projects/equity-valuation-engine/"],
    ["mlscraper", "/projects/mlscraper/"],
    ["sin_pluma", "/projects/sin-pluma/"],
  ])("registers %s at %s", (journalId, expectedRoute) => {
    expect(getProjectEntryHref(journalId)).toBe(expectedRoute);
  });

  it("uses a registered landing page as the canonical project destination", () => {
    const routes: Record<string, ProjectLandingRoute> = {
      example_project: "/projects/example/",
    };

    expect(getProjectEntryHref("example_project", routes)).toBe(
      "/projects/example/",
    );
  });

  it("falls back to the Journal route for an unmigrated project", () => {
    expect(getProjectEntryHref("unmigrated_project", {})).toBe(
      "/thejournal/unmigrated_project/",
    );
  });
});
