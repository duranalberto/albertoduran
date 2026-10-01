import { expect, test } from "@playwright/test";
import { socialLinks } from "../../src/data/identity";
import {
  collectConsoleProblems,
  expectLocatorHorizontallyInViewport,
  expectNoPageHorizontalOverflow,
  expectSharedFooterSpacing,
  getHeroMetrics,
  type HeroMetrics,
} from "./support/helpers";
import {
  responsiveRoutes,
  responsiveViewports,
  smokeRoutes,
} from "./support/routes";

test.describe("production preview smoke coverage", () => {
  for (const route of smokeRoutes) {
    test(`renders ${route} without browser errors`, async ({ page }) => {
      const problems = collectConsoleProblems(page);

      await page.goto(route);

      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator("main#main-content")).toBeVisible();
      // Exactly one main landmark: pages must not nest their own <main>.
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
      await expectSharedFooterSpacing(page, route);
      expect(problems).toEqual([]);
    });
  }
});

test("profile links use the canonical identity URLs", async ({ page }) => {
  const canonical = new Set<string>(
    Object.values(socialLinks).map(({ href }) => href),
  );

  for (const route of ["/", "/profile/", "/projects/mlscraper/"]) {
    await page.goto(route);

    const profileHrefs = await page
      .locator('a[href*="linkedin.com"], a[href^="https://github.com/"]')
      .evaluateAll((links) =>
        links
          .map((link) => link.getAttribute("href") ?? "")
          .filter((href) => !/github\.com\/[^/]+\/[^/]+/.test(href)),
      );

    expect(profileHrefs.length, route).toBeGreaterThan(0);
    for (const href of profileHrefs) {
      expect(canonical.has(href), `${route}: ${href}`).toBe(true);
    }
  }
});

test("document scrolling stays native", async ({ page }) => {
  // Bounce/overscroll must not be disabled on the root or body: that broke
  // Safari's scrollbar hit-testing.
  for (const route of ["/", "/thejournal/mlscraper/first_price_watch/"]) {
    await page.goto(route);

    const overscroll = await page.evaluate(() => ({
      html: getComputedStyle(document.documentElement).overscrollBehaviorY,
      body: getComputedStyle(document.body).overscrollBehaviorY,
    }));

    expect(overscroll, route).toEqual({ html: "auto", body: "auto" });
  }
});

test("top-level heroes keep eyebrow and heading geometry aligned", async ({
  page,
}) => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ];
  const routes = ["/", "/profile/", "/projects/", "/thejournal/"];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    const routeMetrics: HeroMetrics[] = [];
    for (const route of routes) {
      routeMetrics.push(await getHeroMetrics(page, route));
    }

    const baseline = routeMetrics[0];
    if (!baseline) {
      throw new Error("Expected at least one top-level hero route to measure.");
    }

    for (const metrics of routeMetrics.slice(1)) {
      expect(
        Math.abs(metrics.sectionY - baseline.sectionY),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(metrics.eyebrowX - baseline.eyebrowX),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(metrics.eyebrowY - baseline.eyebrowY),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(metrics.headingX - baseline.headingX),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(metrics.headingY - baseline.headingY),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(metrics.eyebrowGap - baseline.eyebrowGap),
      ).toBeLessThanOrEqual(1);
    }
  }
});

test("responsive pages avoid horizontal overflow at breakpoint edges", async ({
  page,
}) => {
  test.setTimeout(90_000);

  for (const viewport of responsiveViewports) {
    await page.setViewportSize(viewport);

    for (const route of responsiveRoutes) {
      await page.goto(route);
      await expect(page.locator("main#main-content")).toBeVisible();
      await expectNoPageHorizontalOverflow(page);
      await expectLocatorHorizontallyInViewport(
        page.locator("main#main-content"),
      );
    }
  }
});
