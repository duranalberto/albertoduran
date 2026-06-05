import { expect, test, type Page } from "@playwright/test";

const smokeRoutes = [
  "/",
  "/profile/",
  "/thejournal/",
  "/thejournal/my_first_publication/",
  "/thejournal/building_albertoduran/",
  "/thejournal/building_albertoduran/publications/slug_generation/",
];

function collectConsoleProblems(page: Page) {
  const problems: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    problems.push(error.message);
  });

  return problems;
}

test.describe("production preview smoke coverage", () => {
  for (const route of smokeRoutes) {
    test(`renders ${route} without browser errors`, async ({ page }) => {
      const problems = collectConsoleProblems(page);

      await page.goto(route);

      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator("main#main-content")).toBeVisible();
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
      expect(problems).toEqual([]);
    });
  }
});

test("journal catalog links to generated article routes", async ({ page }) => {
  const problems = collectConsoleProblems(page);

  await page.goto("/thejournal/");

  await expect(
    page.locator('a[href="/thejournal/my_first_publication/"]').first(),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/thejournal/building_albertoduran/"]').first(),
  ).toBeVisible();
  expect(problems).toEqual([]);
});

test("article pages expose article navigation, headings, and vault context", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);

  await page.goto("/thejournal/building_albertoduran/publications/slug_generation/");

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
  expect(problems).toEqual([]);
});

test("theme toggle persists across Astro navigation", async ({ page }) => {
  const problems = collectConsoleProblems(page);

  await page.goto("/");

  await page.locator("#theme-toggle-input").check({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#meta-theme-color")).toHaveAttribute(
    "content",
    "#121212",
  );

  await page
    .getByRole("navigation", { name: "Main Navigation" })
    .getByRole("link", { name: "Professional Profile" })
    .click();
  await expect(page).toHaveURL(/\/profile\/$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#theme-toggle-input")).toBeChecked();
  await expect.poll(async () => page.evaluate(() => localStorage.getItem("theme"))).toBe(
    "dark",
  );
  expect(problems).toEqual([]);
});

test("Mermaid diagram shell expands diagrams and switches asset links by theme", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);

  await page.goto("/thejournal/ai_ops_agent/");

  const shell = page.locator("mermaid-diagram-shell").first();
  await expect(shell).toBeVisible();

  const inlineSvg = shell.locator(":scope > .mermaid-diagram-container svg");
  await expect(inlineSvg).toBeVisible();
  const inlineId = await inlineSvg.getAttribute("id");
  expect(inlineId).toBeTruthy();

  const openLink = shell.locator("[data-diagram-open-link]");
  await expect(openLink).toHaveAttribute("href", /\/_app\/mermaid\/.*\.svg$/);

  await page.locator("#theme-toggle-input").check({ force: true });
  await expect(openLink).toHaveAttribute(
    "href",
    /\/_app\/mermaid\/.*-dark\.svg$/,
  );

  await shell.getByRole("button", { name: "Expand diagram" }).click();

  const popover = shell.locator(".diagram-popover");
  await expect(popover).toBeVisible();

  const clone = popover.locator("[data-diagram-popover-content] svg");
  await expect(clone).toBeVisible();
  await expect(clone).toHaveAttribute("id", `${inlineId}--expanded`);
  expect(problems).toEqual([]);
});
