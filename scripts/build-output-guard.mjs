import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const markerPath = path.resolve(".astro/build-output-guard.json");
const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");
const command = process.argv[2];

async function markBuildStart() {
  await mkdir(path.dirname(markerPath), { recursive: true });
  await writeFile(
    markerPath,
    `${JSON.stringify({ startedAt: Date.now() })}\n`,
    "utf-8",
  );
}

async function readBuildStart() {
  try {
    const marker = JSON.parse(await readFile(markerPath, "utf-8"));
    return typeof marker.startedAt === "number" ? marker.startedAt : null;
  } catch {
    return null;
  }
}

async function assertBuildOutput() {
  const distStats = await stat(distDir).catch(() => null);
  if (!distStats?.isDirectory()) {
    throw new Error(
      'Astro build finished without creating "dist". Refusing to deploy an empty Workers asset directory.',
    );
  }

  const entries = await readdir(distDir);
  if (entries.length === 0) {
    throw new Error(
      'Astro build created "dist", but it is empty. Refusing to deploy empty output.',
    );
  }

  const indexStats = await stat(indexPath).catch(() => null);
  if (!indexStats?.isFile()) {
    throw new Error(
      'Astro build output is missing "dist/index.html". Refusing to deploy incomplete output.',
    );
  }

  const startedAt = await readBuildStart();
  if (startedAt && indexStats.mtimeMs + 2_000 < startedAt) {
    throw new Error(
      '"dist/index.html" predates this build run. Astro likely exited before generating fresh output.',
    );
  }

  console.log("Build output verified: dist/index.html");
}

if (command === "mark") {
  await markBuildStart();
} else if (command === "assert") {
  await assertBuildOutput();
} else {
  throw new Error('Usage: node scripts/build-output-guard.mjs <mark|assert>');
}
