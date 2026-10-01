import { expect, test } from "@playwright/test";
import {
  collectConsoleProblems,
  expectLocatorHorizontallyInViewport,
  expectNoPageHorizontalOverflow,
  wheelInside,
  wheelOutsideDialog,
} from "./support/helpers";

test("home hero waits for wide desktop before showing the side panel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/");

  const sidePanel = page.locator(".hero-grid > div").nth(1);
  await expect(sidePanel).toBeHidden();
  await expectNoPageHorizontalOverflow(page);
  await expectLocatorHorizontallyInViewport(page.locator(".hero-primary"));

  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto("/");

  await expect(sidePanel).toBeVisible();
  await expectNoPageHorizontalOverflow(page);
  await expectLocatorHorizontallyInViewport(page.locator(".hero-primary"));
  await expectLocatorHorizontallyInViewport(sidePanel);
});

// Skipped: the home Atlas note currently renders as a static inline article
// (see src/components/index/AtlasNote.astro), not an interactive modal. Re-enable
// when the modal trigger + dialog are reintroduced.
test.skip("home Atlas note modal opens and closes", async ({ page }) => {
  const problems = collectConsoleProblems(page);

  await page.goto("/");

  const trigger = page.getByRole("button", {
    name: /If I explain it to you/,
  });
  const dialog = page.getByRole("dialog", {
    name: "Atlas championship story",
  });

  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute(
    "aria-controls",
    "atlas-story-modal-dialog",
  );
  await expect(dialog).toBeHidden();

  await trigger.scrollIntoViewIfNeeded();

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Space");
  await expect(dialog).toBeHidden();

  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close Atlas story" }).focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();

  const pageScrollBeforeOpen = await page.evaluate(() => window.scrollY);
  expect(pageScrollBeforeOpen).toBeGreaterThan(0);

  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Some stories take years")).toBeVisible();
  await expect(dialog.getByText("Si te lo explico")).toBeVisible();
  await expect(
    dialog.getByText("It was one of the most memorable days"),
  ).toBeVisible();

  await expect(page.locator("body")).toHaveAttribute(
    "data-overlay-scroll-locked",
    "true",
  );
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBe(pageScrollBeforeOpen);

  await wheelOutsideDialog(page);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBe(pageScrollBeforeOpen);

  const scrollArea = dialog.locator(".ui-panel-scroll");
  const panelScrollBefore = await scrollArea.evaluate(
    (element) => element.scrollTop,
  );
  await wheelInside(scrollArea, 700);
  await expect
    .poll(() => scrollArea.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(panelScrollBefore);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBe(pageScrollBeforeOpen);

  await scrollArea.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await wheelInside(scrollArea, 700);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBe(pageScrollBeforeOpen);

  await dialog.getByRole("button", { name: "Close Atlas story" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator("body")).not.toHaveAttribute(
    "data-overlay-scroll-locked",
    "true",
  );
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBe(pageScrollBeforeOpen);

  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(20, 20);
  await expect(dialog).toBeHidden();
  expect(problems).toEqual([]);
});

// Skipped: see note above — the Atlas note is a static inline article for now.
// Re-enable alongside the modal when it returns.
test.skip("home Atlas note modal works without JavaScript", async ({
  browser,
}) => {
  test.setTimeout(60_000);

  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  try {
    await page.goto("/");

    const trigger = page.getByRole("button", {
      name: /If I explain it to you/,
    });
    const dialog = page.getByRole("dialog", {
      name: "Atlas championship story",
    });

    await expect(trigger).toBeVisible();
    await expect(dialog).toBeHidden();

    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Some stories take years")).toBeVisible();

    // No-JS keeps the checkbox modal usable. Outside-panel scroll locking is
    // script-enhanced so sticky headers and scroll-timeline parallax do not reset.

    await dialog.getByRole("button", { name: "Close Atlas story" }).click();
    await expect(dialog).toBeHidden();
  } finally {
    await context.close();
  }
});
