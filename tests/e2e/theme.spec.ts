import { expect, test } from "@playwright/test";
import { THEME_META_COLORS } from "../../src/runtime/managers/theme_config";
import { collectConsoleProblems } from "./support/helpers";

test("theme toggle persists across Astro navigation", async ({ page }) => {
  const problems = collectConsoleProblems(page);

  await page.goto("/");

  await page.locator("#theme-toggle-input").check({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#meta-theme-color")).toHaveAttribute(
    "content",
    THEME_META_COLORS.dark,
  );

  await page
    .getByRole("navigation", { name: "Main Navigation" })
    .getByRole("link", { name: "Professional profile" })
    .click();
  await expect(page).toHaveURL(/\/profile\/$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#theme-toggle-input")).toBeChecked();
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("dark");
  await expect(page.locator("#meta-theme-color")).toHaveAttribute(
    "content",
    THEME_META_COLORS.dark,
  );

  // Toggle back the way a visitor does: by clicking the visible switch.
  await page.getByLabel("Toggle dark mode").click();
  await expect(page.locator("#theme-toggle-input")).not.toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("#meta-theme-color")).toHaveAttribute(
    "content",
    THEME_META_COLORS.light,
  );
  expect(problems).toEqual([]);
});

test.describe("stored theme preference", () => {
  test.use({ colorScheme: "dark" });

  test("an invalid stored theme falls back to the system preference", async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "purple"));
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("#meta-theme-color")).toHaveAttribute(
      "content",
      THEME_META_COLORS.dark,
    );
  });
});
