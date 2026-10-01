/** Shared assertions and page helpers for the e2e specs. */
import { expect, type Locator, type Page } from "@playwright/test";

export function collectConsoleProblems(page: Page) {
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

export async function expectNoPageHorizontalOverflow(page: Page) {
  const { clientWidth, scrollWidth } = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    ),
  }));

  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

export async function expectLocatorHorizontallyInViewport(locator: Locator) {
  const box = await locator.boundingBox();
  const viewport = locator.page().viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1);
}

export async function expectMockupScreenshotNotDraggable(image: Locator) {
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

export async function expectSharedFooterSpacing(page: Page, route: string) {
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

export async function getFirstRowChildCount(locator: Locator) {
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

export async function wheelOutsideDialog(page: Page) {
  const viewport = page.viewportSize();
  await page.mouse.move(20, Math.floor((viewport?.height ?? 720) / 2));
  await page.mouse.wheel(0, 700);
}

export async function wheelInside(locator: Locator, deltaY: number) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  await locator
    .page()
    .mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await locator.page().mouse.wheel(0, deltaY);
}

export async function waitForPageScrollToSettle(page: Page) {
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

export async function getHeroMetrics(page: Page, route: string) {
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

export type HeroMetrics = Awaited<ReturnType<typeof getHeroMetrics>>;
