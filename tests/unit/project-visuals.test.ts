import { projectCatalog } from "@data/projects";
import {
  compositeValue,
  dispersionBand,
  money,
  projectVisuals,
  valuationSample,
} from "@data/project_visuals";
import { describe, expect, it } from "vitest";

describe("valuation sample", () => {
  it("derives the composite from the base cases", () => {
    expect(money(compositeValue(valuationSample))).toBe("$51.20");
  });

  it("derives the dispersion band as composite ± population sd", () => {
    expect(dispersionBand(valuationSample).map(money)).toEqual([
      "$41.83",
      "$60.57",
    ]);
  });
});

describe("project visuals", () => {
  it("only references visuals that exist", () => {
    const used = projectCatalog.flatMap((project) =>
      project.media.flatMap((slide) =>
        slide.kind === "visual" ? [slide.visual] : [],
      ),
    );

    expect(used.length).toBeGreaterThan(0);
    for (const id of used) expect(projectVisuals[id], id).toBeDefined();
  });

  it("uses every registered visual", () => {
    const used = new Set(
      projectCatalog.flatMap((project) =>
        project.media.flatMap((slide) =>
          slide.kind === "visual" ? [slide.visual] : [],
        ),
      ),
    );

    expect([...used].sort()).toEqual(Object.keys(projectVisuals).sort());
  });

  it("marks flow checkpoints with a step that exists", () => {
    for (const spec of Object.values(projectVisuals)) {
      if (spec.kind === "flow" && "checkpoint" in spec) {
        expect(spec.steps).toContain(spec.checkpoint);
      }
    }
  });
});
