import { expect, test } from "@playwright/test";
import { collectConsoleProblems } from "./support/helpers";

test("untitled overlay panel fills the body and keeps close button floating", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);

  // The production home page carries no test-only overlay.
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Open untitled overlay test" }),
  ).toHaveCount(0);

  await page.goto("/fixtures/overlays/");

  const trigger = page.getByRole("button", {
    name: "Open untitled overlay test",
  });
  const dialog = page.getByRole("dialog", { name: "Untitled overlay test" });

  await expect(trigger).toBeVisible();
  await expect(dialog).toBeHidden();

  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".ui-panel-header")).toHaveCount(0);
  await expect(dialog.locator("[data-untitled-overlay-body]")).toBeVisible();

  const closeButton = dialog.getByRole("button", {
    name: "Close untitled overlay test",
  });
  const scrollArea = dialog.locator(".ui-panel-scroll");
  await expect(closeButton).toBeVisible();

  const closeBoxBefore = await closeButton.boundingBox();
  expect(closeBoxBefore).not.toBeNull();

  await scrollArea.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  await expect(closeButton).toBeVisible();
  const closeBoxAfter = await closeButton.boundingBox();
  expect(closeBoxAfter).not.toBeNull();
  expect(Math.abs(closeBoxAfter!.y - closeBoxBefore!.y)).toBeLessThan(8);

  await closeButton.click();
  await expect(dialog).toBeHidden();
  expect(problems).toEqual([]);
});
