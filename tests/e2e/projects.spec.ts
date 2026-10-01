import { expect, test } from "@playwright/test";
import { githubRepoUrl } from "../../src/data/identity";
import { STREAM_VAULT_CATALOG_URL } from "../../src/data/stream_vault";
import {
  collectConsoleProblems,
  expectNoPageHorizontalOverflow,
} from "./support/helpers";

test("projects index presents eight showcases with media and stack", async ({
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
    ["Ravnary.com", "/projects/ravnary/"],
    ["Serverless VOD and StreamVault", "/projects/serverless-vod/"],
    ["Pressroom", "/projects/pressroom/"],
    ["Equilyze", "/projects/equilyze/"],
    ["MLScraper", "/projects/mlscraper/"],
    ["Sin Pluma", "/projects/sin-pluma/"],
    ["Equity Valuation Engine", "/projects/equity-valuation-engine/"],
    ["albertoduran.com", "/projects/albertoduran/"],
  ] as const;

  const showcases = page.locator("[data-project-showcase]");
  await expect(showcases).toHaveCount(8);

  for (const [title, href] of expectedProjects) {
    const showcase = page.locator(`[data-project-showcase="${href}"]`);
    await expect(
      showcase.getByRole("link", {
        name: `Open the ${title} project showcase`,
      }),
    ).toHaveAttribute("href", href);
    await expect(
      showcase.getByRole("heading", { level: 2, name: title }),
    ).toBeVisible();
    await expect(
      showcase.getByRole("group", { name: `${title} screenshots` }),
    ).toBeVisible();
    await expect(showcase.locator("[data-project-stat]")).toBeVisible();
    await expect(
      showcase
        .getByRole("list", { name: `${title} stack` })
        .getByRole("listitem"),
    ).not.toHaveCount(0);

    const height = await showcase.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    expect(height).toBeLessThan(1000);
  }

  const ravnaryMedia = page
    .locator('[data-project-showcase="/projects/ravnary/"]')
    .getByRole("group", { name: "Ravnary.com screenshots" });
  await ravnaryMedia.hover();
  await ravnaryMedia
    .getByRole("button", { name: "Next Ravnary.com screenshot" })
    .click();
  await expect(ravnaryMedia.locator("[data-media-counter]")).toHaveText(
    "2 / 3",
  );
  await expect(ravnaryMedia.locator("[data-media-caption]")).toHaveText(
    "A card and its diagram",
  );

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
  test(`${route} presents four featured projects in a bento grid`, async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);
    const expectedProjects = [
      ["Ravnary.com", "Ravnary.com", "/projects/ravnary/"],
      [
        "Serverless VOD and StreamVault",
        "Serverless VOD",
        "/projects/serverless-vod/",
      ],
      ["Sin Pluma", "Sin Pluma", "/projects/sin-pluma/"],
      [
        "Equity Valuation Engine",
        "Equity Valuation Engine",
        "/projects/equity-valuation-engine/",
      ],
    ] as const;

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route);

    const grid = page.locator("[data-project-grid]");
    const cards = grid.locator("[data-project-card]");
    await expect(cards).toHaveCount(4);
    await expect(
      page.getByRole("link", { name: "Browse all projects" }),
    ).toHaveAttribute("href", "/projects/");

    for (const [title, heading, href] of expectedProjects) {
      const card = grid.locator(`[data-project-card="${href}"]`);
      const link = card.getByRole("link", {
        name: `Explore the ${title} project`,
      });
      await expect(link).toHaveAttribute("href", href);
      await expect(
        card.getByRole("heading", { level: 3, name: heading }),
      ).toBeVisible();
      await expect(card.getByRole("img").first()).toBeVisible();
      await expect(card.locator("[data-project-stat]")).toBeVisible();
      await expect(
        card
          .getByRole("list", { name: `${title} stack` })
          .getByRole("listitem"),
      ).not.toHaveCount(0);
    }

    const desktopBoxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, top: rect.top, width: rect.width };
      }),
    );
    expect(Math.abs(desktopBoxes[0]!.top - desktopBoxes[1]!.top)).toBeLessThan(
      2,
    );
    expect(desktopBoxes[1]!.left).toBeGreaterThan(desktopBoxes[0]!.left);
    expect(desktopBoxes[0]!.width).toBeGreaterThan(desktopBoxes[1]!.width);
    expect(desktopBoxes[2]!.top).toBeGreaterThan(desktopBoxes[0]!.top);
    expect(desktopBoxes[3]!.width).toBeGreaterThan(desktopBoxes[2]!.width);

    const stageHeights = await grid
      .locator("[data-media-stage]")
      .evaluateAll((elements) =>
        elements.map((element) =>
          Math.round(element.getBoundingClientRect().height),
        ),
      );
    expect(new Set(stageHeights).size).toBe(1);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileBoxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, top: rect.top };
      }),
    );
    expect(new Set(mobileBoxes.map(({ top }) => Math.round(top))).size).toBe(4);
    expect(new Set(mobileBoxes.map(({ left }) => Math.round(left))).size).toBe(
      1,
    );

    const firstCard = cards.first();
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

for (const route of [
  "/projects/ravnary/",
  "/projects/serverless-vod/",
  "/projects/pressroom/",
  "/projects/equilyze/",
  "/projects/mlscraper/",
  "/projects/sin-pluma/",
  "/projects/equity-valuation-engine/",
  "/projects/albertoduran/",
] as const) {
  test(`${route} hero lists its stack with icons`, async ({ page }) => {
    await page.goto(route);

    const stack = page.locator("[data-project-stack]");
    await expect(
      stack.getByRole("heading", { level: 2, name: "Built with" }),
    ).toBeVisible();
    const items = stack.locator('[data-tech-stack="tile"] > li');
    expect(await items.count()).toBeGreaterThan(1);
    await expect(
      items.first().locator("svg, [aria-hidden]").first(),
    ).toBeVisible();
    await expect(
      items
        .first()
        .evaluate((element) => getComputedStyle(element).borderTopWidth),
    ).resolves.toBe("0px");
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
    githubRepoUrl("albertoduran"),
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
    github: githubRepoUrl("equity-valuation-engine"),
    journal: "/thejournal/equity_valuation_engine/",
    heading: "A more disciplined way to invest",
    detailHref: "/thejournal/equity_valuation_engine/first_valuation_run/",
    detailName: "Read Run a valuation before studying the formulas",
  },
  {
    route: "/projects/mlscraper/",
    title: "MLScraper",
    github: githubRepoUrl("MLScraper"),
    journal: "/thejournal/mlscraper/",
    heading: "The bargain I missed",
    detailHref: "/thejournal/mlscraper/first_price_watch/",
    detailName: "Read Follow one watch before opening the internals",
  },
  {
    route: "/projects/sin-pluma/",
    title: "Sin Pluma",
    github: githubRepoUrl("SinPluma"),
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

    // Every labelled section points at a heading that exists on the page.
    const sectionLabels = await page
      .locator("main section[aria-labelledby]")
      .evaluateAll((sections) =>
        sections.map((section) => {
          const id = section.getAttribute("aria-labelledby") ?? "";
          const target = document.getElementById(id);
          return { id, isHeading: !!target && /^H[1-6]$/.test(target.tagName) };
        }),
      );
    expect(sectionLabels.length).toBeGreaterThan(3);
    for (const label of sectionLabels) {
      expect(label.isHeading, label.id).toBe(true);
    }

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

test("Serverless VOD and StreamVault showcases two projects with one public repository", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page);
  const title = "Serverless VOD and StreamVault";

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/serverless-vod/");

  await expect(page).toHaveTitle(title);
  await expect(
    page.getByRole("heading", { level: 1, name: title }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator('dl[aria-label="Project facts"] dd')).toHaveCount(
    4,
  );

  const sourceLink = page.getByRole("link", {
    name: `View the ${title} source code on GitHub`,
  });
  await expect(sourceLink).toHaveAttribute(
    "href",
    githubRepoUrl("stream-vault"),
  );
  await expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");

  const liveLink = page.getByRole("link", {
    name: `Visit the live ${title} site`,
  });
  await expect(liveLink).toHaveAttribute(
    "href",
    "https://duranalberto.github.io/stream-vault/",
  );
  await expect(liveLink).toHaveAttribute("target", "_blank");

  await expect(
    page.getByRole("link", { name: `See how ${title} works in The Journal` }),
  ).toHaveCount(0);

  await expect(page.locator("video").first()).toBeAttached();
  await expect(
    page.locator(".mermaid-diagram-container").first(),
  ).toBeVisible();

  // hls.js is injected once, pinned and integrity-checked; a hash mismatch
  // would block it and leave window.Hls undefined.
  const hlsScript = page.locator('script[src*="cdn.jsdelivr.net/npm/hls.js@"]');
  await expect(hlsScript).toHaveCount(1);
  await expect(hlsScript).toHaveAttribute("integrity", /^sha384-/);
  await expect(hlsScript).toHaveAttribute("crossorigin", "anonymous");
  await expect
    .poll(() => page.evaluate(() => typeof (window as { Hls?: unknown }).Hls))
    .toBe("function");

  const deepDives = page.locator("#go-deeper");
  await expect(
    deepDives.locator('a[href="/thejournal/aws_serverless_vod/"]'),
  ).toBeVisible();
  await expect(
    deepDives.locator('a[href="/thejournal/aws_serverless_vod_manager/"]'),
  ).toBeVisible();
  await expect(page.locator("#project-vault")).toHaveCount(0);
  await expect(page.locator('a[href*="aws-serverless-vod"]')).toHaveCount(0);

  await expectNoPageHorizontalOverflow(page);
  expect(problems).toEqual([]);
});

test("video player shows catalog metadata for its stream", async ({ page }) => {
  const problems = collectConsoleProblems(page);

  await page.route(STREAM_VAULT_CATALOG_URL, async (route) => {
    const src = await page
      .locator("video-player-shell")
      .first()
      .getAttribute("data-video-src");
    await route.fulfill({
      json: {
        videos: [
          { playbackUrl: "https://example.test/other.m3u8", title: "Other" },
          {
            playbackUrl: src,
            title: "Mocked match",
            description: "From the catalog",
            tags: ["splatoon", 3],
          },
        ],
      },
    });
  });

  await page.goto("/projects/serverless-vod/");
  const player = page.locator("video-player-shell").first();

  await expect(player).toHaveAttribute(
    "data-catalog-url",
    STREAM_VAULT_CATALOG_URL,
  );
  await expect(player.locator("[data-video-metadata-title]")).toHaveText(
    "Mocked match",
  );
  await expect(player.locator("[data-video-metadata-description]")).toHaveText(
    "From the catalog",
  );
  await expect(player.locator("[data-video-metadata-tags] span")).toHaveText([
    "#splatoon",
  ]);
  expect(problems).toEqual([]);
});
