import { completedSteps, stepMarker } from "@utils/steps";
import { describe, expect, it } from "vitest";

describe("step numbering", () => {
  it.each([
    [0, "01"],
    [8, "09"],
    [9, "10"],
  ])("marks index %i as %s", (index, marker) => {
    expect(stepMarker(index)).toBe(marker);
  });

  it("numbers steps from 1 and marks them complete", () => {
    expect(completedSteps(["Load", "Fetch"])).toEqual([
      { label: "Load", marker: "1", color: "success" },
      { label: "Fetch", marker: "2", color: "success" },
    ]);
  });
});
