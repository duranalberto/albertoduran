/**
 * Fail the build when `astro build` exits successfully but left no site behind.
 *
 * Node exits with code 0 when its event loop empties, even if a promise the
 * build was waiting on never settled. A build can therefore "succeed" without
 * writing dist/, and the failure only surfaces later as a confusing deploy
 * error. Check the files a real build always produces.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const required = ["index.html", "404.html", "sitemap.xml", "robots.txt"];
const missing = required.filter((file) => !existsSync(join(distDir, file)));

if (missing.length > 0) {
  console.error(
    `Build output is incomplete: missing ${missing.map((f) => `dist/${f}`).join(", ")}.\n` +
      "astro build exited without finishing. Check the log above for the last step that ran.",
  );
  process.exit(1);
}

console.log(`Build output verified (${required.join(", ")}).`);
