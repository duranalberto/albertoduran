import { expect, test } from "@playwright/test";
import {
  collectConsoleProblems,
  expectLocatorHorizontallyInViewport,
  expectMockupScreenshotNotDraggable,
  expectNoPageHorizontalOverflow,
} from "./support/helpers";

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
