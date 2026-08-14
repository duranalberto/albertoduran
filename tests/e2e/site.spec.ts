import { expect, test, type Locator, type Page } from "@playwright/test";

const smokeRoutes = [
  "/",
  "/profile/",
  "/projects/",
  "/projects/albertoduran/",
  "/projects/equity-valuation-engine/",
  "/projects/mlscraper/",
  "/projects/sin-pluma/",
  "/thejournal/",
  "/thejournal/ai_ops_agent/",
  "/thejournal/mlscraper/first_price_watch/",
  "/thejournal/building_albertoduran/",
  "/thejournal/building_albertoduran/authoring/routing/",
];

const responsiveRoutes = [
  "/",
  "/projects/",
  "/profile/",
  "/projects/albertoduran/",
  "/projects/equity-valuation-engine/",
  "/projects/mlscraper/",
  "/projects/sin-pluma/",
  "/thejournal/mlscraper/first_price_watch/",
  "/thejournal/building_albertoduran/rendering/chart_gallery/",
  "/thejournal/sin_pluma/innodb_cluster/",
  "/thejournal/building_albertoduran/authoring/mdx_pipeline/",
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

async function expectMockupScreenshotNotDraggable(image: Locator) {
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();

  const interactionStyles = await image.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      pointerEvents: styles.pointerEvents,
      userSelect: styles.userSelect,
      webkitUserDrag: styles.getPropertyValue("-webkit-user-drag"),
    };
  });

  expect(interactionStyles).toEqual({
    pointerEvents: "none",
    userSelect: "none",
    webkitUserDrag: "none",
  });

  await image.evaluate((element) => {
    element.setAttribute("data-drag-started", "false");
    element.addEventListener(
      "dragstart",
      () => element.setAttribute("data-drag-started", "true"),
      { once: true },
    );
  });

  const box = await image.boundingBox();
  expect(box).not.toBeNull();

  const startX = box!.x + Math.min(box!.width / 2, 40);
  const startY = box!.y + Math.min(box!.height / 2, 40);
  await image.page().mouse.move(startX, startY);
  await image.page().mouse.down();
  await image.page().mouse.move(startX + 40, startY + 20, { steps: 8 });
  await image.page().mouse.up();

  await expect(image).toHaveAttribute("data-drag-started", "false");
}

async function expectSharedFooterSpacing(page: Page, route: string) {
  const main = page.locator("main#main-content");

  await expect(main).toHaveClass(/site-main/);

  const spacingTarget =
    route === "/projects/"
      ? page.locator("[data-project-showcase] article").last()
      : main;
  const paddingBottom = await spacingTarget.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).paddingBottom),
  );

  expect(paddingBottom).toBeGreaterThanOrEqual(64);
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
      await expectSharedFooterSpacing(page, route);
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

test("projects index presents six compact showcases and ordered navigation", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects/");

  await expect(page).toHaveTitle("My Projects | Alberto Duran");
  await expect(
    page.getByRole("heading", { level: 1, name: "My Projects" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

  const mainNavigation = page.getByRole("navigation", {
    name: "Main Navigation",
  });
  await expect(
    mainNavigation.getByRole("link", { name: "Professional profile" }),
  ).toBeVisible();
  await expect(
    mainNavigation.getByRole("link", { name: "Projects", exact: true }),
  ).toBeVisible();
  await expect(
    mainNavigation.getByRole("link", { name: "TheJournal." }),
  ).toBeVisible();
  await expect(
    mainNavigation.getByRole("link", { name: "Projects" }),
  ).toHaveAttribute("aria-current", "page");

  const expectedProjects = [
    ["Pressroom", "/projects/pressroom/"],
    ["Equilyze", "/projects/equilyze/"],
    ["MLScraper", "/projects/mlscraper/"],
    ["Sin Pluma", "/projects/sin-pluma/"],
    ["Equity Valuation Engine", "/projects/equity-valuation-engine/"],
    ["albertoduran.com", "/projects/albertoduran/"],
  ] as const;

  const showcases = page.locator("[data-project-showcase]");
  await expect(showcases).toHaveCount(6);

  for (const [title, href] of expectedProjects) {
    const showcase = page.getByRole("link", {
      name: `Open the ${title} project showcase`,
    });
    await expect(showcase).toHaveAttribute("href", href);
    await expect(
      showcase.getByRole("heading", { level: 2, name: title }),
    ).toBeVisible();
    await expect(showcase.getByRole("img")).toBeVisible();
    await expect(showcase.locator("[data-project-signal]")).toBeVisible();

    const height = await showcase.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    expect(height).toBeLessThan(1000);
  }

  const firstShowcase = showcases.first();
  const secondShowcase = showcases.nth(1);
  await expect
    .poll(() =>
      firstShowcase.evaluate(
        (element) => getComputedStyle(element).borderTopWidth,
      ),
    )
    .toBe("0px");
  await expect
    .poll(() =>
      secondShowcase.evaluate(
        (element) => getComputedStyle(element).borderTopWidth,
      ),
    )
    .not.toBe("0px");

  const finalShowcaseBottom = await showcases
    .last()
    .evaluate((element) => element.getBoundingClientRect().bottom);
  const footerTop = await page
    .locator("body > footer")
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(Math.abs(footerTop - finalShowcaseBottom)).toBeLessThanOrEqual(1);

  const lightBackground = await firstShowcase.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page.locator("#theme-toggle-input").check({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() =>
      firstShowcase.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    )
    .not.toBe(lightBackground);

  await expectNoPageHorizontalOverflow(page);
  expect(problems).toEqual([]);
});

for (const route of ["/", "/profile/"] as const) {
  test(`${route} presents six accessible project cards in a responsive grid`, async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);
    const expectedProjects = [
      ["Pressroom", "/projects/pressroom/"],
      ["Equilyze", "/projects/equilyze/"],
      ["MLScraper", "/projects/mlscraper/"],
      ["Sin Pluma", "/projects/sin-pluma/"],
      ["Equity Valuation Engine", "/projects/equity-valuation-engine/"],
      ["albertoduran.com", "/projects/albertoduran/"],
    ] as const;

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route);

    const grid = page.locator("[data-project-grid]");
    const cards = grid.locator("[data-project-card]");
    await expect(cards).toHaveCount(6);
    await expect(
      page.getByRole("link", { name: "View all projects" }),
    ).toHaveCount(0);

    for (const [index, [title, href]] of expectedProjects.entries()) {
      const card = grid.getByRole("link", {
        name: `Explore the ${title} project`,
      });
      await expect(card).toHaveAttribute("href", href);
      await expect(
        card.getByRole("heading", { level: 3, name: title }),
      ).toBeVisible();
      await expect(card.getByRole("img")).toHaveCount(0);
      await expect(card.locator("[data-project-signal]")).toBeVisible();
      await expect(card.locator("[data-project-ordinal]")).toHaveText(
        String(index + 1).padStart(2, "0"),
      );
    }

    const desktopBoxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { height: rect.height, left: rect.left, top: rect.top };
      }),
    );
    expect(Math.abs(desktopBoxes[0]!.top - desktopBoxes[1]!.top)).toBeLessThan(
      2,
    );
    expect(desktopBoxes[1]!.left).toBeGreaterThan(desktopBoxes[0]!.left);
    expect(desktopBoxes[2]!.top).toBeGreaterThan(desktopBoxes[0]!.top);
    expect(Math.max(...desktopBoxes.map(({ height }) => height))).toBeCloseTo(
      Math.min(...desktopBoxes.map(({ height }) => height)),
      0,
    );

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileBoxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, top: rect.top };
      }),
    );
    expect(new Set(mobileBoxes.map(({ top }) => Math.round(top))).size).toBe(6);
    expect(new Set(mobileBoxes.map(({ left }) => Math.round(left))).size).toBe(
      1,
    );

    const firstCard = cards.first().locator("article");
    const lightBackground = await firstCard.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await page.locator("#theme-toggle-input").check({ force: true });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect
      .poll(() =>
        firstCard.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
      )
      .not.toBe(lightBackground);

    await expectNoPageHorizontalOverflow(page);
    expect(problems).toEqual([]);
  });
}

test("project showcase renders its hero actions, body, and grouped vault", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/albertoduran/");

  await expect(page).toHaveTitle("albertoduran.com");
  await expect(
    page.getByRole("heading", { level: 1, name: "albertoduran.com" }),
  ).toBeVisible();
  await expect(page.locator('dl[aria-label="Project facts"] dd')).toHaveCount(
    4,
  );

  const journalLink = page.getByRole("link", {
    name: "See how albertoduran.com works in The Journal",
  });

  const sourceLink = page.getByRole("link", {
    name: "View the albertoduran.com source code on GitHub",
  });
  await expect(sourceLink).toHaveAttribute(
    "href",
    "https://github.com/duranalberto/albertoduran",
  );
  await expect(sourceLink).toHaveAttribute("target", "_blank");
  await expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");
  await expect(sourceLink).toHaveClass(/btn-outline/);
  await expect(sourceLink).toHaveClass(/btn-md/);
  await expect(page.getByRole("link", { name: /Visit the live/ })).toHaveCount(
    0,
  );
  await expect(journalLink).toHaveAttribute(
    "href",
    "/thejournal/building_albertoduran/",
  );
  await expect(journalLink).not.toHaveAttribute("target", "_blank");
  await expect(journalLink).toContainText("Technical details");
  await expect(journalLink).toHaveClass(/btn-outline/);
  await expect(journalLink).toHaveClass(/btn-md/);

  await expect(
    page.locator(".mermaid-diagram-container").first(),
  ).toBeVisible();
  await expect(page.locator("#project-vault-coverage")).toHaveCount(0);

  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "More room than an interview",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Choose how deep to read",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "The Journal has publication rules",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "The browser can take the day off",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: /Typed content and visible publishing rules/,
    }),
  ).toHaveAttribute(
    "href",
    "/thejournal/building_albertoduran/authoring/content_model/",
  );
  await expect(
    page.getByRole("heading", { level: 2, name: "Technical deep dives" }),
  ).toBeVisible();

  const platformList = page.getByRole("list", {
    name: "Four repositories, one artifact publications",
  });
  await expect(platformList).toBeVisible();
  await expect(
    platformList.getByRole("link", {
      name: "Read Four repositories, one artifact in The Journal",
    }),
  ).toHaveAttribute("href", "/thejournal/building_albertoduran/platform/");
  await expect(
    platformList.getByText("what each repository owns", { exact: false }),
  ).toBeVisible();

  const vaultList = page.locator("#project-vault .publication-list").first();
  const lightBackground = await vaultList.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page.locator("#theme-toggle-input").check({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() =>
      vaultList.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    )
    .not.toBe(lightBackground);

  await expectNoPageHorizontalOverflow(page);
  expect(problems).toEqual([]);
});

const projectShowcases = [
  {
    route: "/projects/equity-valuation-engine/",
    title: "Equity Valuation Engine",
    github: "https://github.com/duranalberto/equity-valuation-engine",
    journal: "/thejournal/equity_valuation_engine/",
    heading: "A more disciplined way to invest",
    detailHref: "/thejournal/equity_valuation_engine/first_valuation_run/",
    detailName: "Read Run a valuation before studying the formulas",
  },
  {
    route: "/projects/mlscraper/",
    title: "MLScraper",
    github: "https://github.com/duranalberto/MLScraper",
    journal: "/thejournal/mlscraper/",
    heading: "The bargain I missed",
    detailHref: "/thejournal/mlscraper/first_price_watch/",
    detailName: "Read Follow one watch before opening the internals",
  },
  {
    route: "/projects/sin-pluma/",
    title: "Sin Pluma",
    github: "https://github.com/duranalberto/SinPluma",
    journal: "/thejournal/sin_pluma/",
    heading: "From first discovery to the next draft",
    detailHref: "/thejournal/sin_pluma/frontend/",
    detailName: /Explore the frontend engineering/,
  },
] as const;

for (const showcase of projectShowcases) {
  test(`${showcase.title} renders a complete project showcase`, async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(showcase.route);

    await expect(page).toHaveTitle(showcase.title);
    await expect(
      page.getByRole("heading", { level: 1, name: showcase.title }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator('dl[aria-label="Project facts"] dd')).toHaveCount(
      4,
    );

    const sourceLink = page.getByRole("link", {
      name: `View the ${showcase.title} source code on GitHub`,
    });
    await expect(sourceLink).toHaveAttribute("href", showcase.github);
    await expect(sourceLink).toHaveAttribute("target", "_blank");
    await expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");

    const journalLink = page.getByRole("link", {
      name: `See how ${showcase.title} works in The Journal`,
    });
    await expect(journalLink).toHaveAttribute("href", showcase.journal);
    await expect(journalLink).not.toHaveAttribute("target", "_blank");
    await expect(journalLink).toContainText("Technical details");
    await expect(sourceLink).toHaveClass(/btn-outline/);
    await expect(sourceLink).toHaveClass(/btn-md/);
    await expect(journalLink).toHaveClass(/btn-outline/);
    await expect(journalLink).toHaveClass(/btn-md/);
    await expect(journalLink.locator("svg")).toHaveAttribute("fill", "none");
    await expect(journalLink.locator("svg")).toHaveAttribute(
      "stroke",
      "currentColor",
    );
    await expect(
      page.getByRole("link", { name: /Visit the live/ }),
    ).toHaveCount(0);

    await expect(
      page.getByRole("heading", { level: 2, name: showcase.heading }),
    ).toBeVisible();
    await expect(
      page.locator(".mermaid-diagram-container").first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: showcase.detailName }).first(),
    ).toHaveAttribute("href", showcase.detailHref);
    await expect(
      page.getByRole("heading", { level: 2, name: "Technical deep dives" }),
    ).toBeVisible();
    await expect(
      page.locator(`#project-vault a[href^="${showcase.journal}"]`).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Vault publications", { exact: true }),
    ).toHaveCount(1);

    const vaultList = page.locator("#project-vault .publication-list").first();
    const lightBackground = await vaultList.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await page.locator("#theme-toggle-input").check({ force: true });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect
      .poll(() =>
        vaultList.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
      )
      .not.toBe(lightBackground);

    if (showcase.title === "Sin Pluma") {
      const projectImage = page.getByRole("img", {
        name: "A typewriter and writing desk representing the Sin Pluma publishing platform",
      });
      await expect(projectImage).toBeVisible();

      await expect(
        page.getByRole("heading", {
          level: 2,
          name: "A complete writing experience and a distributed-systems case study in the same product.",
        }),
      ).toBeVisible();

      await expect(
        page.getByRole("img", {
          name: "Sin Pluma rich-text editor showing a chapter with an analysis action",
        }),
      ).toBeVisible();
    }

    await expectNoPageHorizontalOverflow(page);
    expect(problems).toEqual([]);
  });
}

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

test("MDX list rows remain semantic, themed, safe, and responsive", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/fixtures/components/");

  const list = page.getByRole("list", {
    name: "Publication component inventory",
  });
  await expect(list).toBeVisible();
  await expect(list.getByRole("listitem")).toHaveCount(3);

  const externalAction = list.getByRole("link", {
    name: "Open the DaisyUI list documentation in a new tab",
  });
  await expect(externalAction).toHaveAttribute("target", "_blank");
  await expect(externalAction).toHaveAttribute("rel", "noopener noreferrer");

  const lightBackground = await list.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page.locator("#theme-toggle-input").check({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() =>
      list.evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .not.toBe(lightBackground);

  await expectNoPageHorizontalOverflow(page);
  await expectLocatorHorizontallyInViewport(list);
});

test("publication callouts render semantic variants and rich content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/fixtures/components/");

  const callouts = page.locator(".callout-card");
  await expect(callouts).toHaveCount(5);

  for (const variant of [
    "note",
    "information",
    "warning",
    "caution",
    "error",
  ]) {
    await expect(
      page.locator(`[data-callout-variant="${variant}"]`),
    ).toBeVisible();
  }

  await expect(
    page.locator('[data-callout-variant="note"] .callout-title'),
  ).toHaveText("Notes");
  await expect(
    page.locator('[data-callout-variant="information"] .callout-title'),
  ).toHaveText("Build context");
  await expect(page.locator('[data-callout-variant="warning"] li')).toHaveCount(
    3,
  );
  await expect(
    page.locator('[data-callout-variant="error"] pre'),
  ).toContainText("schema_identifier_too_long");

  const icons = callouts.locator(".callout-icon");
  await expect(icons).toHaveCount(5);
  for (const icon of await icons.all()) {
    await expect(icon).toHaveAttribute("aria-hidden", "true");
  }

  const customPalette = page.locator('[data-gallery-callout="custom-palette"]');
  await expect(customPalette).toHaveAttribute(
    "style",
    /--callout-icon-surface:/,
  );
  await expect(customPalette).toHaveAttribute(
    "data-callout-variant",
    "caution",
  );
  await expect(customPalette.locator(".callout-title")).toHaveText(
    "Custom editorial checkpoint",
  );

  const lightBackground = await customPalette.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page.locator("#theme-toggle-input").check({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() =>
      customPalette.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    )
    .not.toBe(lightBackground);

  await expectNoPageHorizontalOverflow(page);
  for (const callout of await callouts.all()) {
    await expectLocatorHorizontallyInViewport(callout);
  }
});

test("publication mockups render browser chrome and keep screenshots static", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/fixtures/components/");

  const browserScreenshot = page.locator(
    'figure[aria-label="Production publication browser screenshot"]',
  );
  await expect(browserScreenshot).toBeVisible();
  await expect(browserScreenshot).toContainText(
    "https://albertoduran.com/thejournal/sin_pluma/",
  );
  await expect(browserScreenshot.locator("figcaption")).toContainText(
    "production-style route",
  );

  const customBrowser = page.locator(
    'figure[aria-label="Local publication preview browser state"]',
  );
  await expect(customBrowser).toContainText("Preview");
  await expect(customBrowser).toContainText(
    "localhost:4321/thejournal/component-gallery",
  );
  await customBrowser.locator("[data-browser-demo-control]").click({
    trial: true,
  });

  const lightBackground = await customBrowser
    .locator(".mockup-browser-content")
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.locator("#theme-toggle-input").check({ force: true });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() =>
      customBrowser
        .locator(".mockup-browser-content")
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .not.toBe(lightBackground);

  await expectMockupScreenshotNotDraggable(
    browserScreenshot.locator(".mockup-browser-content > img"),
  );
  await expectMockupScreenshotNotDraggable(
    page
      .locator('figure[aria-label="Mobile publication screenshot"]')
      .locator(".mockup-phone-display > img"),
  );
  await expectMockupScreenshotNotDraggable(
    page
      .locator('figure[aria-labelledby="gallery-window-preview-title"]')
      .locator(".mockup-window-body > img"),
  );

  await expectNoPageHorizontalOverflow(page);
  await expectLocatorHorizontallyInViewport(browserScreenshot);
  await expectLocatorHorizontallyInViewport(customBrowser);
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

  const javaCredential = page.getByRole("link", {
    name: "View credential",
  }).last();
  await expect(javaCredential).toHaveAttribute(
    "href",
    "https://www.credly.com/badges/414df637-5a83-4ab1-8530-59d77fef76f9",
  );

  await expect(page.getByText(/Software Engineer II/i)).toHaveCount(0);
  await expect(page.getByText(/mid-level/i)).toHaveCount(0);
  await expectNoPageHorizontalOverflow(page);
});

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

  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto("/thejournal/");

  await expect(journalStatistics).toBeVisible();
  await expectNoPageHorizontalOverflow(page);
  await expectLocatorHorizontallyInViewport(journalStatistics);
  expect(problems).toEqual([]);
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

  await dialog.getByRole("link", { name: "Deployment and local runtime" }).click();
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
    .getByRole("link", { name: "Professional profile" })
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

  // The diagram renders as a single inline SVG in the reading view (selectable
  // text, follows the page theme) rather than a light/dark <img> pair.
  const readingSvg = shell.locator(
    ":scope > .mermaid-diagram-container .mermaid-diagram-image > svg",
  );
  await expect(readingSvg).toBeVisible();

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

  // The popover is populated at runtime with a cloned copy of the diagram SVG.
  const expandedSvg = popover.locator(
    "[data-diagram-popover-content] .mermaid-diagram-image > svg",
  );
  await expect(expandedSvg).toBeVisible();
  expect(problems).toEqual([]);
});

test("Mermaid diagrams render inline SVG without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4325",
    javaScriptEnabled: false,
  });
  const page = await context.newPage();

  await page.goto("/thejournal/ai_ops_agent/");

  // The SVG is inlined into the static HTML, so the diagram is present and
  // its label text is readable/selectable even with JavaScript disabled.
  // Note: e2e builds run with MERMAID_RENDERER_FIXTURE=true, whose fixture SVGs
  // render labels as <text> (production Worker SVGs use <foreignObject>).
  const diagramSvg = page
    .locator(".mermaid-diagram-container .mermaid-diagram-image > svg")
    .first();
  await expect(diagramSvg).toBeVisible();
  await expect(diagramSvg.locator("text").first()).toBeVisible();

  await expect(page.locator("html")).toHaveClass(/no-js/);

  await context.close();
});

test("ECharts MDX charts render static SVG without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4325",
    javaScriptEnabled: false,
  });
  const page = await context.newPage();

  await page.goto("/fixtures/charts/");

  const staticChart = page.locator("#static-chart");
  await expect(staticChart).toBeVisible();
  await expect(staticChart.locator("svg")).toBeVisible();

  const externalChartImage = page.locator("#external-chart img");
  await expect(externalChartImage).toBeVisible();
  const externalSrc = await externalChartImage.getAttribute("src");
  expect(externalSrc).toMatch(/^\/_app\/charts\/[a-f0-9]+\.svg$/);
  const externalResponse = await page.request.get(externalSrc!);
  expect(externalResponse.ok()).toBe(true);

  await expect(page.locator("html")).toHaveClass(/no-js/);

  await context.close();
});

test("ECharts MDX charts opt into browser enhancement", async ({ page }) => {
  const problems = collectConsoleProblems(page);

  await page.goto("/fixtures/charts/");

  const staticShell = page.locator(
    'echart-shell:has(#static-chart)[data-chart-enhance="none"]',
  );
  await expect(staticShell).toBeVisible();
  await expect(staticShell).not.toHaveAttribute("data-enhanced", "true");

  const enhancedShell = page.locator(
    'echart-shell:has(#enhanced-chart)[data-chart-enhance="load"]',
  );
  await expect(enhancedShell).toHaveAttribute("data-enhanced", "true");
  await expect(
    enhancedShell.locator(".echart-enhanced-surface svg"),
  ).toBeVisible();
  expect(problems).toEqual([]);
});

test("ECharts MDX charts hydrate only when media query matches", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);

  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto("/fixtures/charts/");

  const mediaShell = page.locator(
    'echart-shell:has(#media-chart)[data-chart-hydrate="media"]',
  );
  await expect(mediaShell).toHaveAttribute("data-enhanced", "false");
  await page.waitForTimeout(250);
  await expect(mediaShell).toHaveAttribute("data-enhanced", "false");

  await page.setViewportSize({ width: 1000, height: 900 });
  await expect(mediaShell).toHaveAttribute("data-enhanced", "true");
  await expect(
    mediaShell.locator(".echart-enhanced-surface svg"),
  ).toBeVisible();
  expect(problems).toEqual([]);
});
