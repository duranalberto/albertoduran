import { expect, test, type Locator, type Page } from "@playwright/test";

const smokeRoutes = [
  "/",
  "/profile/",
  "/thejournal/",
  "/thejournal/my_first_publication/",
  "/thejournal/building_albertoduran/",
  "/thejournal/building_albertoduran/publications/slug_generation/",
];

const responsiveRoutes = [
  "/",
  "/profile/",
  "/thejournal/sin_pluma/innodb_cluster/",
  "/thejournal/building_albertoduran/publications/codeblocks/",
  "/404.html",
];

const responsiveViewports = [
  { width: 390, height: 844 },
  { width: 767, height: 900 },
  { width: 768, height: 900 },
  { width: 1023, height: 900 },
  { width: 1024, height: 900 },
  { width: 1279, height: 900 },
  { width: 1280, height: 900 },
  { width: 1536, height: 900 },
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

async function expectNoPageHorizontalOverflow(page: Page) {
  const { clientWidth, scrollWidth } = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    ),
  }));

  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

async function expectLocatorHorizontallyInViewport(locator: Locator) {
  const box = await locator.boundingBox();
  const viewport = locator.page().viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1);
}

async function getFirstRowChildCount(locator: Locator) {
  return locator.evaluate((element) => {
    const rects = Array.from(element.children).map((child) =>
      child.getBoundingClientRect(),
    );
    const firstTop = Math.min(...rects.map((rect) => Math.round(rect.top)));

    return rects.filter(
      (rect) => Math.abs(Math.round(rect.top) - firstTop) <= 2,
    ).length;
  });
}

async function wheelOutsideDialog(page: Page) {
  const viewport = page.viewportSize();
  await page.mouse.move(20, Math.floor((viewport?.height ?? 720) / 2));
  await page.mouse.wheel(0, 700);
}

async function wheelInside(locator: Locator, deltaY: number) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  await locator
    .page()
    .mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await locator.page().mouse.wheel(0, deltaY);
}

async function waitForPageScrollToSettle(page: Page) {
  let previousScrollY = -1;
  let stableFrames = 0;

  await expect
    .poll(
      async () => {
        const scrollY = await page.evaluate(() => Math.round(window.scrollY));
        stableFrames = scrollY === previousScrollY ? stableFrames + 1 : 0;
        previousScrollY = scrollY;

        return stableFrames;
      },
      { intervals: [100, 100, 100, 100, 100], timeout: 3_000 },
    )
    .toBeGreaterThanOrEqual(2);
}

async function getHeroMetrics(page: Page, route: string) {
  await page.goto(route);

  const sectionBox = await page.locator(".hero-section").boundingBox();
  const eyebrowBox = await page.locator(".hero-eyebrow").boundingBox();
  const headingBox = await page.locator(".hero-heading").boundingBox();

  expect(sectionBox).not.toBeNull();
  expect(eyebrowBox).not.toBeNull();
  expect(headingBox).not.toBeNull();

  return {
    eyebrowGap: Math.round(headingBox!.y - eyebrowBox!.y - eyebrowBox!.height),
    eyebrowX: Math.round(eyebrowBox!.x),
    eyebrowY: Math.round(eyebrowBox!.y),
    headingX: Math.round(headingBox!.x),
    headingY: Math.round(headingBox!.y),
    sectionY: Math.round(sectionBox!.y),
  };
}

type HeroMetrics = Awaited<ReturnType<typeof getHeroMetrics>>;

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

test("top-level heroes keep eyebrow and heading geometry aligned", async ({
  page,
}) => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ];
  const routes = ["/", "/profile/", "/thejournal/"];

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

test("journal article sidebars wait until the content column can stay readable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/thejournal/building_albertoduran/publications/codeblocks/");

  await expect(page.locator(".sidebar-right")).toBeHidden();
  await expect(page.locator(".dock-wrapper")).toBeVisible();
  await expectNoPageHorizontalOverflow(page);

  const mainAt1280 = await page.locator(".journal-main-content").boundingBox();
  expect(mainAt1280).not.toBeNull();
  expect(mainAt1280!.width).toBeGreaterThan(900);

  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto("/thejournal/building_albertoduran/publications/codeblocks/");

  await expect(page.locator(".sidebar-right")).toBeVisible();
  await expect(page.locator(".dock-wrapper")).toBeHidden();
  await expectNoPageHorizontalOverflow(page);

  const mainAt1536 = await page.locator(".journal-main-content").boundingBox();
  expect(mainAt1536).not.toBeNull();
  expect(mainAt1536!.width).toBeGreaterThan(640);
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

test("home Atlas note modal opens and closes", async ({ page }) => {
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

test("home Atlas note modal works without JavaScript", async ({ browser }) => {
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

test("untitled overlay panel fills the body and keeps close button floating", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);

  await page.goto("/");

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

test("article pages expose article navigation, headings, and vault context", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);

  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto(
    "/thejournal/building_albertoduran/publications/slug_generation/",
  );

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

test("mobile On This Page panel preserves selected heading scroll after close", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    "/thejournal/building_albertoduran/publications/slug_generation/",
  );

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
    .getByRole("link", { name: "Building the Table of Contents" })
    .click();
  await expect(page).toHaveURL(/#building-the-table-of-contents$/);
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
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("dark");
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
