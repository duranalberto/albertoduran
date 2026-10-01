import { entryManifest } from "@content/processors/thejournal";
import { journalHref } from "@utils/routes";
import glob from "fast-glob";
import { describe, expect, it } from "vitest";
import { sitemapUrls } from "../../src/pages/sitemap.xml";

const paths = new Set(sitemapUrls().map(({ path }) => path));

/** Route for a static page file: src/pages/projects/mlscraper.astro -> /projects/mlscraper/. */
const routeOf = (file: string) =>
  `/${file.replace(/^src\/pages\//, "").replace(/(index)?\.astro$/, "")}`.replace(
    /([^/])$/,
    "$1/",
  );

describe("sitemap", () => {
  it("lists every static page except the 404 and test fixtures", () => {
    const pages = glob
      .sync("src/pages/**/*.astro", { cwd: process.cwd() })
      .filter((file) => !file.includes("[") && !file.endsWith("404.astro"));

    expect(pages.length).toBeGreaterThan(10);
    for (const file of pages) expect(paths, file).toContain(routeOf(file));
  });

  it("lists every published Journal entry", () => {
    for (const id of Object.keys(entryManifest)) {
      expect(paths, id).toContain(journalHref(id));
    }
  });

  it("never lists the 404 page or fixtures", () => {
    for (const path of paths) expect(path).not.toMatch(/404|fixtures/);
  });
});
