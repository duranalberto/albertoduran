import { projectStack } from "@data/icons";
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
});
