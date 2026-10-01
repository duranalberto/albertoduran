import { defineConfig, devices } from "@playwright/test";

const HOST = "127.0.0.1";
const PORT = 4325;
const baseURL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html"], ["github"]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // Playwright starts the preview of the current dist/ and stops it when the
  // run ends. Build first (npm run build:test). --ignore-lock keeps Astro in
  // the foreground: Astro 7 otherwise backgrounds `astro preview` when it
  // detects an AI agent, and the detached server would outlive the run.
  webServer: {
    command: `npx astro preview --host ${HOST} --port ${PORT} --ignore-lock`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
