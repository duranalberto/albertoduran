import type { StepItem } from "bloomwright-ui/components/display/Steps.astro";

/** "01", "02"… for a zero-based list position. */
export function stepMarker(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/** Steps component items numbered 1…n, all marked complete. */
export function completedSteps(labels: readonly string[]): StepItem[] {
  return labels.map((label, index) => ({
    label,
    marker: String(index + 1),
    color: "success",
  }));
}
