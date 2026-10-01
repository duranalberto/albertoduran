/**
 * Vitest global setup: load the content collections before any test runs.
 *
 * Tests read collections through Astro's Vite plugin, which uses the
 * development data store at .astro/data-store.json. Only `astro dev` writes
 * that file; `astro sync` writes the build cache copy instead. A fresh
 * checkout (CI) has neither, so every Journal-backed test would see no
 * entries. Sync in test mode (no network for the Atlas loader) and place the
 * store where the tests read it.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export default async function setup(): Promise<void> {
  const root = process.cwd();
  process.env["ALBERTODURAN_TEST_MODE"] = "true";
  // Import by file URL: under Vitest, Astro's Vite plugins rewrite the bare
  // "astro" specifier, which hides the programmatic API.
  const astro = pathToFileURL(
    join(root, "node_modules", "astro", "dist", "index.js"),
  );
  const { sync } = (await import(
    /* @vite-ignore */ astro.href
  )) as typeof import("astro");
  await sync({ root, logLevel: "error" });

  const built = join(root, "node_modules", ".astro", "data-store.json");
  if (!existsSync(built)) {
    throw new Error(`astro sync did not produce ${built}`);
  }
  mkdirSync(join(root, ".astro"), { recursive: true });
  copyFileSync(built, join(root, ".astro", "data-store.json"));
}
