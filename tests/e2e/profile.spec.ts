import { expect, test } from "@playwright/test";
import {
  expectNoPageHorizontalOverflow,
  getFirstRowChildCount,
} from "./support/helpers";

test("profile skills grid only switches to three columns at desktop width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/profile/");

  const skillsGrid = page.locator("#skills > .grid").first();
  await expect(skillsGrid).toBeVisible();
  expect(await getFirstRowChildCount(skillsGrid)).toBe(1);
  await expectNoPageHorizontalOverflow(page);

  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/profile/");

  await expect(skillsGrid).toBeVisible();
  expect(await getFirstRowChildCount(skillsGrid)).toBe(3);
  await expectNoPageHorizontalOverflow(page);
});

test("profile presents systems evidence while preserving skills and experience contracts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/profile/");

  await expect(page).toHaveTitle(
    "Alberto Duran | Full-Stack and Backend Systems Engineer",
  );
  await expect(
    page.getByText("Software Engineer | Python · Java · TypeScript"),
  ).toBeVisible();
  await expect(page.locator("[data-profile-impact]")).toBeVisible();
  await expect(page.locator("[data-role-fit]")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Technical skills" }),
  ).toBeVisible();

  const timeline = page.locator("#experience .experience-timeline");
  await expect(timeline).toBeVisible();
  await expect(timeline.locator(":scope > li")).toHaveCount(2);

  const javaCredential = page
    .getByRole("link", {
      name: "View credential",
    })
    .last();
  await expect(javaCredential).toHaveAttribute(
    "href",
    "https://www.credly.com/badges/414df637-5a83-4ab1-8530-59d77fef76f9",
  );

  await expect(page.getByText(/Software Engineer II/i)).toHaveCount(0);
  await expect(page.getByText(/mid-level/i)).toHaveCount(0);
  await expectNoPageHorizontalOverflow(page);
});
