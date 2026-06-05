import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

const webServer: PlaywrightTestConfig["webServer"] =
  process.env.PLAYWRIGHT_SKIP_WEBSERVER === "true"
    ? undefined
    : {
        command: "npm run preview -- --host 127.0.0.1 --port 4325",
        url: "http://127.0.0.1:4325",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      };

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
    baseURL: "http://127.0.0.1:4325",
    trace: "on-first-retry",
  },
  webServer,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
