import { expect, test } from "@playwright/test";
import {
  collectConsoleProblems,
  expectLocatorHorizontallyInViewport,
  expectNoPageHorizontalOverflow,
  waitForPageScrollToSettle,
} from "./support/helpers";

test("journal article sidebars wait until the content column can stay readable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/thejournal/building_albertoduran/authoring/mdx_pipeline/");

  await expect(page.locator(".sidebar-right")).toBeHidden();
  await expect(page.locator(".dock-wrapper")).toBeVisible();
  await expectNoPageHorizontalOverflow(page);

  const mainAt1280 = await page.locator(".journal-main-content").boundingBox();
  expect(mainAt1280).not.toBeNull();
  expect(mainAt1280!.width).toBeGreaterThan(900);

  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto("/thejournal/building_albertoduran/authoring/mdx_pipeline/");

  await expect(page.locator(".sidebar-right")).toBeVisible();
  await expect(page.locator(".dock-wrapper")).toBeHidden();
  await expectNoPageHorizontalOverflow(page);

  const mainAt1536 = await page.locator(".journal-main-content").boundingBox();
  expect(mainAt1536).not.toBeNull();
  expect(mainAt1536!.width).toBeGreaterThan(640);
});

test("journal catalog links to generated article routes", async ({ page }) => {
  const problems = collectConsoleProblems(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/thejournal/");

  const journalStatistics = page.getByRole("group", {
    name: "Journal statistics",
  });
  const publicationCount = journalStatistics.locator(
    "[data-journal-publication-count]",
  );
  const catalogCards = page.locator('a[href^="/thejournal/"] > .card');

  await expect(journalStatistics.getByText("Publications")).toBeVisible();
  await expect(journalStatistics.getByText("Total read time")).toBeVisible();
  await expect(publicationCount).toHaveText(/^\s*\d+\s*$/);
  await expect(journalStatistics).toContainText(/\d+h(?: \d+m)?/);
  await expect(publicationCount).toHaveText(String(await catalogCards.count()));
  await expectNoPageHorizontalOverflow(page);
  await expectLocatorHorizontallyInViewport(journalStatistics);

  await expect(
    page.locator('a[href="/thejournal/ai_ops_agent/"]').first(),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/thejournal/building_albertoduran/"]').first(),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/thejournal/aws_serverless_vod_manager/"] > .card'),
  ).toBeVisible();
  await expect(page.locator('a[href^="/projects/"] > .card')).toHaveCount(0);

  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto("/thejournal/");

  await expect(journalStatistics).toBeVisible();
  await expectNoPageHorizontalOverflow(page);
  await expectLocatorHorizontallyInViewport(journalStatistics);
  expect(problems).toEqual([]);
});

test("article pages expose article navigation, headings, and vault context", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);

  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto("/thejournal/sin_pluma/architecture/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Journal entry navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "On this page" }).first(),
  ).toBeVisible();
  await expect(page.getByText("Vault Explorer").first()).toBeVisible();

  const h2 = page.locator("h2#logical-layers");
  const h3 = page.locator("h3#saving-a-draft-notebook");

  await expect(h2).toBeVisible();
  await expect(h3).toBeVisible();
  await expect(h2.locator("[data-anchor-trigger]")).toBeVisible();
  await expect(h3.locator("[data-anchor-trigger]")).toBeVisible();
  await expect(page.locator("h2#saving-a-draft-notebook")).toHaveCount(0);

  expect(problems).toEqual([]);
});

test("vault navigation marks the nested active entry per surface", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);
  const activeHref = "/thejournal/building_albertoduran/authoring/routing/";

  // Desktop sidebar: the active entry, even when nested, gets the side line.
  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto(activeHref);

  const sidebar = page.locator(".sidebar-left");
  await expect(sidebar.locator(`a[href="${activeHref}"]`)).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(sidebar.locator(".vault-active-line")).toHaveCount(1);

  // Mobile overlay: static tree, so no side line at any depth.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open Vault Explorer" }).click();

  const dialog = page.getByRole("dialog", { name: "Vault Explorer" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(`a[href="${activeHref}"]`)).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(dialog.locator(".vault-active-line")).toHaveCount(0);

  expect(problems).toEqual([]);
});

test("On This Page keeps tracking after client-side navigation", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);

  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto("/thejournal/mlscraper/first_price_watch/");
  await expect(page.locator("on-this-page")).toHaveCount(1);

  // Astro's ClientRouter swaps the page without a full reload.
  await page
    .getByRole("navigation", { name: "Journal entry navigation" })
    .getByRole("link", { name: /Next/ })
    .click();
  await expect(page).not.toHaveURL(/first_price_watch/);
  await expect(page.locator("on-this-page")).toHaveCount(1);

  const sidebarLinks = page.locator(".sidebar-right .onthispage-link");
  const lastLink = sidebarLinks.last();
  const lastTarget = await lastLink.getAttribute("href");
  expect(lastTarget).toMatch(/^#/);

  await page.locator(lastTarget!).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 5000);
  await expect(
    page.locator('.sidebar-right .onthispage-link[aria-current="location"]'),
  ).toHaveCount(1);

  expect(problems).toEqual([]);
});

test("mobile On This Page panel preserves selected heading scroll after close", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/thejournal/sin_pluma/architecture/");

  await page.evaluate(() => window.scrollTo(0, 0));
  const pageScrollBeforeOpen = await page.evaluate(() => window.scrollY);

  const trigger = page.getByRole("button", { name: "Open Table of Contents" });
  await expect(trigger).toHaveAttribute(
    "aria-controls",
    "otp-modal-toggle-dialog",
  );
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "On This Page" });
  await expect(dialog).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute(
    "data-overlay-scroll-locked",
    "true",
  );

  const focusableDialogControls = await dialog
    .locator("[data-modal-close], a[href]")
    .count();
  expect(focusableDialogControls).toBeGreaterThan(1);

  for (let index = 0; index < focusableDialogControls + 2; index += 1) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        Boolean(document.activeElement?.closest("[role='dialog']")),
      ),
    ).toBe(true);
  }

  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(() =>
      Boolean(document.activeElement?.closest("[role='dialog']")),
    ),
  ).toBe(true);

  await dialog
    .getByRole("link", { name: "Deployment and local runtime" })
    .click();
  await expect(page).toHaveURL(/#deployment-and-local-runtime$/);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(pageScrollBeforeOpen + 500);
  await waitForPageScrollToSettle(page);

  const selectedHeadingScroll = await page.evaluate(() => window.scrollY);

  await dialog.getByRole("button", { name: "Close Table of Contents" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator("body")).not.toHaveAttribute(
    "data-overlay-scroll-locked",
    "true",
  );
  await expect
    .poll(() =>
      page.evaluate(
        (expectedScrollY) => Math.abs(window.scrollY - expectedScrollY),
        selectedHeadingScroll,
      ),
    )
    .toBeLessThan(4);

  expect(problems).toEqual([]);
});
