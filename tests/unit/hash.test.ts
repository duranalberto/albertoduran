import { stableHash } from "@utils/hash";
import { describe, expect, it } from "vitest";

describe("stableHash", () => {
  it("returns the same short base-36 id for the same input", () => {
    expect(stableHash("ribbon")).toBe(stableHash("ribbon"));
    expect(stableHash("ribbon")).toMatch(/^[0-9a-z]{1,7}$/);
  });

  it("returns different ids for different inputs", () => {
    const ids = new Set(
      ["a", "b", "ab", "ba", "", "master.m3u8", "master.m3u9"].map(stableHash),
    );

    expect(ids.size).toBe(7);
  });

  it("matches the FNV-1a reference value", () => {
    // FNV-1a 32-bit of "a" is 0xe40c292c.
    expect(stableHash("a")).toBe((0xe40c292c).toString(36));
  });
});
