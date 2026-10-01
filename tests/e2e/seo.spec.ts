import { expect, test, type Page } from "@playwright/test";
import { smokeRoutes } from "./support/routes";

const SITE = "https://albertoduran.com";
const indexable = smokeRoutes.filter((route) => !route.startsWith("/404"));

const meta = (page: Page, key: string) =>
  page.locator(`meta[property="${key}"], meta[name="${key}"]`).first();

async function jsonLdTypes(page: Page): Promise<string[]> {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(blocks).toHaveLength(1);
  const graph = JSON.parse(blocks[0]!)["@graph"] as { "@type": string }[];
  return graph.map((node) => node["@type"]);
}

test.describe("page metadata", () => {
  for (const route of indexable) {
    test(`${route} has a canonical URL, share metadata and structured data`, async ({
      page,
    }) => {
      await page.goto(route);

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${SITE}${route}`,
      );
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(meta(page, "og:site_name")).toHaveAttribute(
        "content",
        "Alberto Duran",
      );
      await expect(meta(page, "og:url")).toHaveAttribute(
        "content",
        `${SITE}${route}`,
      );
      await expect(meta(page, "og:image")).toHaveAttribute(
        "content",
        /^https:\/\/.+\.webp$/,
      );
      await expect(meta(page, "og:image:alt")).toHaveAttribute("content", /\S/);
      await expect(meta(page, "og:image:width")).toHaveAttribute(
        "content",
        "1200",
      );
      await expect(meta(page, "description")).toHaveAttribute(
        "content",
        /^.{50,170}$/s,
      );
      expect(await jsonLdTypes(page)).toContain("Person");
    });
  }

  test("articles are marked up as articles", async ({ page }) => {
    await page.goto("/thejournal/mlscraper/first_price_watch/");

    await expect(meta(page, "og:type")).toHaveAttribute("content", "article");
    await expect(meta(page, "article:published_time")).toHaveAttribute(
      "content",
      /^\d{4}-\d{2}-\d{2}T/,
    );
    expect(await jsonLdTypes(page)).toEqual(
      expect.arrayContaining(["BlogPosting", "BreadcrumbList"]),
    );
  });

  test("the 404 page is kept out of search results", async ({ page }) => {
    await page.goto("/404.html");

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test("pages advertise the feed, manifest and touch icon", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.locator('link[rel="alternate"][type="application/rss+xml"]'),
    ).toHaveAttribute("href", "/thejournal/rss.xml");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      "/site.webmanifest",
    );
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      "href",
      "/apple-touch-icon.png",
    );
  });
});

test.describe("crawler files", () => {
  test("robots.txt allows crawling and names the sitemap", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");

    expect(response.ok()).toBe(true);
    const text = await response.text();
    expect(text).toContain("User-agent: *");
    expect(text).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  test("sitemap.xml lists the indexable pages and not the 404", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");

    expect(response.ok()).toBe(true);
    const xml = await response.text();
    for (const route of indexable)
      expect(xml).toContain(`<loc>${SITE}${route}</loc>`);
    expect(xml).not.toContain("404");
  });

  test("the theJournal feed and its assets are served", async ({ request }) => {
    const feed = await request.get("/thejournal/rss.xml");
    expect(feed.ok()).toBe(true);
    expect(await feed.text()).toMatch(/<rss version="2.0"[\s\S]*<item>/);

    const manifest = await request.get("/site.webmanifest");
    expect((await manifest.json()).icons).toHaveLength(3);

    for (const icon of [
      "/apple-touch-icon.png",
      "/icon-192.png",
      "/icon-512.png",
    ]) {
      const response = await request.get(icon);
      expect(response.ok(), icon).toBe(true);
      expect(response.headers()["content-type"], icon).toContain("image/png");
    }
  });
});
