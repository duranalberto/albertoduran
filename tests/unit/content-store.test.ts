import { entryManifest, vaultsManifest } from "@content/processors/thejournal";
import glob from "fast-glob";
import { describe, expect, it } from "vitest";

/**
 * Many tests loop over the Journal manifest and would pass with zero entries.
 * Fail loudly if the content store did not load (see tests/setup).
 */
describe("content store", () => {
  it("loads every published Journal source file", () => {
    const sources = glob.sync("src/thejournal/**/[^_]*.{md,mdx}", {
      cwd: process.cwd(),
    });
    const entries = Object.keys(entryManifest).length;

    expect(sources.length).toBeGreaterThan(0);
    expect(entries).toBeGreaterThan(sources.length / 2);
    expect(Object.keys(vaultsManifest).length).toBeGreaterThan(0);
  });
});
