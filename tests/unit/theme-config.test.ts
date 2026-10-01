import {
  resolveTheme,
  THEME_META_COLORS,
  THEME_STORAGE_KEY,
} from "@runtime/managers/theme_config";
import { describe, expect, it } from "vitest";

describe("resolveTheme", () => {
  it.each([
    ["dark", false, "dark"],
    ["dark", true, "dark"],
    ["light", true, "light"],
    ["light", false, "light"],
    [null, true, "dark"],
    [null, false, "light"],
    ["purple", true, "dark"],
    ["", false, "light"],
  ] as const)(
    "stored %j with prefersDark=%s resolves to %s",
    (stored, prefersDark, expected) => {
      expect(resolveTheme(stored, prefersDark)).toBe(expected);
    },
  );
});

describe("theme constants", () => {
  it("defines a meta theme color per theme", () => {
    expect(Object.keys(THEME_META_COLORS).sort()).toEqual(["dark", "light"]);
    for (const color of Object.values(THEME_META_COLORS)) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("keeps the storage key stable for returning visitors", () => {
    expect(THEME_STORAGE_KEY).toBe("theme");
  });
});
