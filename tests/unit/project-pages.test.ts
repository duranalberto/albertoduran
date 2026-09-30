import {
  getProjectEntryHref,
  type ProjectLandingRoute,
} from "@data/project_pages";
import { projectStack, skills } from "@data/icons";
import { featuredProjects, projectCatalog } from "@data/projects";
import { describe, expect, it } from "vitest";

describe("project page routing", () => {
  it("exposes eight unique project landing-page summaries", () => {
    expect(projectCatalog).toHaveLength(8);

    const routes = projectCatalog.map(({ href }) => href);
    expect(new Set(routes).size).toBe(8);
    expect(routes).toEqual([
      "/projects/ravnary/",
      "/projects/serverless-vod/",
      "/projects/pressroom/",
      "/projects/equilyze/",
      "/projects/mlscraper/",
      "/projects/sin-pluma/",
      "/projects/equity-valuation-engine/",
      "/projects/albertoduran/",
    ]);
  });

  it("features four catalog projects in a fixed order", () => {
    expect(featuredProjects.map(({ href }) => href)).toEqual([
      "/projects/ravnary/",
      "/projects/serverless-vod/",
      "/projects/sin-pluma/",
      "/projects/equity-valuation-engine/",
    ]);
  });

  it("gives every project media and a stack whose icons resolve", () => {
    for (const project of projectCatalog) {
      expect(project.media.length).toBeGreaterThan(0);
      for (const tech of project.stack) {
        if (tech.icon) {
          expect(projectStack[tech.icon]?.content, tech.label).toBeTruthy();
        } else {
          expect(tech.monogram, tech.label).toMatch(/^\w{1,2}$/);
        }
      }
    }
  });

  it("keeps project-only icons out of the skills ribbon", () => {
    expect(skills.dynamodb).toBeUndefined();
    expect(projectStack.dynamodb).toBeDefined();
  });

  it("namespaces icon ids so gradients cannot collide", () => {
    expect(projectStack.next?.content).toContain('id="next-');
    expect(projectStack.python?.content).toContain("url(#python-");
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
