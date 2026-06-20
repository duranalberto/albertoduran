import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const assetDirectory = path.resolve("dist/_app");
const maximumBytes = 500 * 1024;

async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectJavaScriptFiles(target);
      return entry.isFile() && entry.name.endsWith(".js") ? [target] : [];
    }),
  );
  return files.flat();
}

const files = await collectJavaScriptFiles(assetDirectory);
const measurements = await Promise.all(
  files.map(async (file) => ({ file, bytes: (await stat(file)).size })),
);
const oversized = measurements.filter(({ bytes }) => bytes > maximumBytes);

if (oversized.length > 0) {
  const details = oversized
    .sort((left, right) => right.bytes - left.bytes)
    .map(
      ({ file, bytes }) =>
        `${path.relative(process.cwd(), file)}: ${(bytes / 1024).toFixed(1)} KiB`,
    )
    .join("\n");
  throw new Error(`JavaScript bundle limit exceeded (500 KiB):\n${details}`);
}

const largest = measurements.sort((left, right) => right.bytes - left.bytes)[0];
console.log(
  largest
    ? `JavaScript bundles are within 500 KiB; largest is ${path.relative(process.cwd(), largest.file)} at ${(largest.bytes / 1024).toFixed(1)} KiB.`
    : "No JavaScript bundles found.",
);
