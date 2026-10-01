/**
 * Text and XML documents for crawlers and feed readers: robots.txt,
 * sitemap.xml and the theJournal RSS feed. Pure builders; the endpoints in
 * src/pages pass in the site URL and data.
 */

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const SITEMAP_PATH = "/sitemap.xml";

export function robotsTxt(site: URL): string {
  return [
    "User-agent: *",
    "Allow: /",
    // Test-only pages; never deployed, excluded in case a test build is.
    "Disallow: /fixtures/",
    "",
    `Sitemap: ${new URL(SITEMAP_PATH, site).href}`,
    "",
  ].join("\n");
}

export interface SitemapUrl {
  path: string;
  lastmod?: Date | undefined;
}

export function sitemapXml(site: URL, urls: readonly SitemapUrl[]): string {
  const unique = new Map(urls.map((url) => [url.path, url]));
  const entries = [...unique.values()]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(({ path, lastmod }) =>
      [
        "  <url>",
        `    <loc>${escapeXml(new URL(path, site).href)}</loc>`,
        ...(lastmod
          ? [`    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>`]
          : []),
        "  </url>",
      ].join("\n"),
    );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

export interface FeedItem {
  title: string;
  path: string;
  description: string;
  published: Date;
  categories?: readonly string[] | undefined;
}

export interface Feed {
  title: string;
  description: string;
  /** Path of the page the feed belongs to. */
  path: string;
  /** Path of the feed itself (for atom:link rel="self"). */
  feedPath: string;
  items: readonly FeedItem[];
}

/** RSS 2.0, newest first. lastBuildDate follows the newest item so builds stay repeatable. */
export function rssXml(site: URL, feed: Feed): string {
  const items = [...feed.items].sort(
    (a, b) => b.published.getTime() - a.published.getTime(),
  );
  const newest = items[0]?.published;
  const link = (path: string) => escapeXml(new URL(path, site).href);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(feed.title)}</title>`,
    `    <link>${link(feed.path)}</link>`,
    `    <description>${escapeXml(feed.description)}</description>`,
    "    <language>en</language>",
    `    <atom:link href="${link(feed.feedPath)}" rel="self" type="application/rss+xml"/>`,
    ...(newest
      ? [`    <lastBuildDate>${newest.toUTCString()}</lastBuildDate>`]
      : []),
    ...items.map((item) =>
      [
        "    <item>",
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${link(item.path)}</link>`,
        `      <guid isPermaLink="true">${link(item.path)}</guid>`,
        `      <pubDate>${item.published.toUTCString()}</pubDate>`,
        `      <description>${escapeXml(item.description)}</description>`,
        ...(item.categories ?? []).map(
          (category) => `      <category>${escapeXml(category)}</category>`,
        ),
        "    </item>",
      ].join("\n"),
    ),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
