import { robotsTxt, rssXml, sitemapXml } from "@utils/seo_files";
import { describe, expect, it } from "vitest";

const site = new URL("https://example.test");

describe("robotsTxt", () => {
  it("allows crawling and points at the sitemap", () => {
    const text = robotsTxt(site);

    expect(text).toMatch(/^User-agent: \*\nAllow: \/\n/);
    expect(text).toContain("Disallow: /fixtures/");
    expect(text).toContain("Sitemap: https://example.test/sitemap.xml");
  });
});

describe("sitemapXml", () => {
  it("lists absolute, sorted, unique URLs with optional lastmod dates", () => {
    const xml = sitemapXml(site, [
      { path: "/b/" },
      { path: "/a/", lastmod: new Date("2026-07-01T12:00:00Z") },
      { path: "/b/" },
    ]);

    expect(xml.match(/<loc>/g)).toHaveLength(2);
    expect(xml.indexOf("https://example.test/a/")).toBeLessThan(
      xml.indexOf("https://example.test/b/"),
    );
    expect(xml).toContain("<lastmod>2026-07-01</lastmod>");
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
  });

  it("escapes XML special characters", () => {
    expect(sitemapXml(site, [{ path: "/q?a=1&b=2" }])).toContain(
      "<loc>https://example.test/q?a=1&amp;b=2</loc>",
    );
  });
});

describe("rssXml", () => {
  const feed = {
    title: "Feed & Co",
    description: "About <things>",
    path: "/thejournal/",
    feedPath: "/thejournal/rss.xml",
    items: [
      {
        title: "Old",
        path: "/thejournal/old/",
        description: "o",
        published: new Date("2026-01-01T00:00:00Z"),
      },
      {
        title: "New",
        path: "/thejournal/new/",
        description: "n",
        published: new Date("2026-03-01T00:00:00Z"),
        categories: ["aws"],
      },
    ],
  };

  it("orders items newest first and dates the build by the newest item", () => {
    const xml = rssXml(site, feed);

    expect(xml.indexOf("<title>New</title>")).toBeLessThan(
      xml.indexOf("<title>Old</title>"),
    );
    expect(xml).toContain(
      "<lastBuildDate>Sun, 01 Mar 2026 00:00:00 GMT</lastBuildDate>",
    );
    expect(xml).toContain(
      '<guid isPermaLink="true">https://example.test/thejournal/new/</guid>',
    );
    expect(xml).toContain("<category>aws</category>");
  });

  it("links to itself and escapes text", () => {
    const xml = rssXml(site, feed);

    expect(xml).toContain(
      '<atom:link href="https://example.test/thejournal/rss.xml" rel="self"',
    );
    expect(xml).toContain("<title>Feed &amp; Co</title>");
    expect(xml).toContain("<description>About &lt;things&gt;</description>");
  });
});
