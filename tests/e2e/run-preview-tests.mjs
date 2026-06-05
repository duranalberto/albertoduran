import { spawn } from "node:child_process";

const baseUrl = "http://127.0.0.1:4325";

function spawnLogged(command, args, options = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
}

async function waitForPreview(timeoutMs = 120_000) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(
    `Timed out waiting for Astro preview at ${baseUrl}. Last error: ${
      lastError instanceof Error ? lastError.message : "none"
    }`,
  );
}

function stopPreview(preview) {
  if (preview.killed) return;
  preview.kill("SIGTERM");
}

const preview = spawnLogged("npm", [
  "run",
  "preview",
  "--",
  "--host",
  "127.0.0.1",
  "--port",
  "4325",
]);

try {
  await waitForPreview();

  const playwright = spawnLogged(
    "npx",
    ["playwright", "test"],
    {
      env: {
        ...process.env,
        PLAYWRIGHT_SKIP_WEBSERVER: "true",
      },
    },
  );

  const exitCode = await new Promise((resolve) => {
    playwright.on("exit", (code) => resolve(code ?? 1));
  });

  stopPreview(preview);
  process.exit(exitCode);
} catch (error) {
  stopPreview(preview);
  console.error(error);
  process.exit(1);
}
