import { expect, test, type Page } from "@playwright/test";

/**
 * Visual regression baseline for refactors that should not change pixels.
 *
 * Tagged @visual and excluded from `npm run test:e2e`: snapshots are
 * platform-specific, so they are recorded and compared locally with
 * `npm run test:visual` / `npm run test:visual:update`.
 */

const visualRoutes = [
  { name: "home", path: "/" },
  { name: "profile", path: "/profile/" },
  { name: "projects", path: "/projects/" },
  { name: "project-mlscraper", path: "/projects/mlscraper/" },
  { name: "project-ravnary", path: "/projects/ravnary/" },
  { name: "journal", path: "/thejournal/" },
  { name: "article-standalone", path: "/thejournal/ai_ops_agent/" },
  {
    name: "article-vault-child",
    path: "/thejournal/mlscraper/first_price_watch/",
  },
  { name: "fixture-components", path: "/fixtures/components/" },
  { name: "not-found", path: "/this-page-does-not-exist/" },
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const themes = ["light", "dark"] as const;

/** Force every lazy image to load and decode so full-page shots are complete. */
async function settlePage(page: Page) {
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    for (const image of images) image.loading = "eager";

    await Promise.all(
      images.map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    );
    await Promise.all(images.map((image) => image.decode().catch(() => {})));
    await document.fonts.ready;
    window.scrollTo(0, 0);
  });
}

for (const theme of themes) {
  for (const viewport of viewports) {
    test.describe(`visual ${theme} ${viewport.name}`, () => {
      test.use({
        colorScheme: theme,
        reducedMotion: "reduce",
        viewport: { width: viewport.width, height: viewport.height },
      });

      for (const route of visualRoutes) {
        test(
          `${route.name} matches the ${theme} ${viewport.name} baseline`,
          { tag: "@visual" },
          async ({ page }) => {
            test.setTimeout(90_000);

            await page.goto(route.path);
            await expect(page.locator("html")).toHaveAttribute(
              "data-theme",
              theme,
            );
            await settlePage(page);

            await expect(page).toHaveScreenshot(
              `${route.name}-${theme}-${viewport.name}.png`,
              { fullPage: true, animations: "disabled", caret: "hide" },
            );
          },
        );
      }
    });
  }
}
