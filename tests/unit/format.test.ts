import { formatDate, formatDuration, formatReadTime } from "@utils/format";
import { describe, expect, it } from "vitest";

describe("formatReadTime", () => {
  it.each([
    [0, null],
    [1, "1 min read"],
    [5, "5 min read"],
    [59, "59 min read"],
  ])("formats %i minutes as %s", (minutes, expected) => {
    expect(formatReadTime(minutes)).toBe(expected);
  });
});

describe("formatDate", () => {
  // Frontmatter dates are parsed as UTC midnight; the build machine's time
  // zone must not move them to the previous day.
  const firstOfMonth = new Date("2026-07-01T00:00:00.000Z");

  it("formats short dates in UTC", () => {
    expect(formatDate(firstOfMonth, "short")).toBe("Jul 1, 2026");
  });

  it("formats long dates in UTC", () => {
    expect(formatDate(firstOfMonth, "long")).toBe("July 1, 2026");
  });

  it("keeps the last day of the year in its own year", () => {
    expect(formatDate(new Date("2026-12-31T00:00:00.000Z"), "short")).toBe(
      "Dec 31, 2026",
    );
  });
});

describe("formatDuration", () => {
  it.each([
    [0, "0h"],
    [45, "0h 45m"],
    [60, "1h"],
    [61, "1h 1m"],
    [125, "2h 5m"],
  ])("formats %i minutes as %s", (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });
});
