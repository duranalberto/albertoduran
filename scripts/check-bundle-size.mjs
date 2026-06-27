import { brotliCompressSync, gzipSync } from "node:zlib";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const ASSET_BUDGETS = {
  jsFileBytes: 500 * 1024,
  totalJsBytes: 1 * 1024 * 1024,
  totalCssBytes: 250 * 1024,
  totalHtmlBytes: 10 * 1024 * 1024,
  totalSvgBytes: 15 * 1024 * 1024,
  totalRasterBytes: 50 * 1024 * 1024,
  fontFileBytes: 512 * 1024,
};

const COMPRESSIBLE_EXTENSIONS = new Set([".html", ".css", ".js", ".svg"]);
const RASTER_EXTENSIONS = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp"]);
const FONT_EXTENSIONS = new Set([".otf", ".ttf", ".woff", ".woff2"]);

export function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

export async function collectAssetFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectAssetFiles(target);
      return entry.isFile() ? [target] : [];
    }),
  );
  return files.flat();
}

export async function measureAsset(file, rootDir = process.cwd()) {
  const { size } = await stat(file);
  const extension = path.extname(file).toLowerCase() || "(none)";
  const measurement = {
    file,
    relativePath: path.relative(rootDir, file),
    extension,
    bytes: size,
    gzipBytes: null,
    brotliBytes: null,
  };

  if (COMPRESSIBLE_EXTENSIONS.has(extension)) {
    const contents = await readFile(file);
    measurement.gzipBytes = gzipSync(contents).length;
    measurement.brotliBytes = brotliCompressSync(contents).length;
  }

  return measurement;
}

export async function measureAssets(distDir = path.resolve("dist")) {
  const files = await collectAssetFiles(distDir);
  return Promise.all(files.map((file) => measureAsset(file)));
}

export function summarizeByExtension(measurements) {
  const summary = new Map();

  for (const measurement of measurements) {
    const entry = summary.get(measurement.extension) ?? {
      extension: measurement.extension,
      count: 0,
      bytes: 0,
      gzipBytes: 0,
      brotliBytes: 0,
      hasCompressedSizes: false,
    };

    entry.count += 1;
    entry.bytes += measurement.bytes;

    if (measurement.gzipBytes !== null && measurement.brotliBytes !== null) {
      entry.gzipBytes += measurement.gzipBytes;
      entry.brotliBytes += measurement.brotliBytes;
      entry.hasCompressedSizes = true;
    }

    summary.set(measurement.extension, entry);
  }

  return [...summary.values()].sort((left, right) => right.bytes - left.bytes);
}

function sumBytes(measurements, predicate) {
  return measurements
    .filter(predicate)
    .reduce((total, measurement) => total + measurement.bytes, 0);
}

function isAppAsset(measurement) {
  return measurement.relativePath.split(/[\\/]+/).includes("_app");
}

export function findOversizedJavaScript(measurements, budgets = ASSET_BUDGETS) {
  return measurements
    .filter(
      (measurement) =>
        measurement.extension === ".js" &&
        isAppAsset(measurement) &&
        measurement.bytes > budgets.jsFileBytes,
    )
    .sort((left, right) => right.bytes - left.bytes);
}

export function createReportWarnings(measurements, budgets = ASSET_BUDGETS) {
  const warnings = [];
  const totals = {
    js: sumBytes(
      measurements,
      (measurement) => measurement.extension === ".js",
    ),
    css: sumBytes(
      measurements,
      (measurement) => measurement.extension === ".css",
    ),
    html: sumBytes(
      measurements,
      (measurement) => measurement.extension === ".html",
    ),
    svg: sumBytes(
      measurements,
      (measurement) => measurement.extension === ".svg",
    ),
    raster: sumBytes(measurements, (measurement) =>
      RASTER_EXTENSIONS.has(measurement.extension),
    ),
  };

  if (totals.js > budgets.totalJsBytes) {
    warnings.push(
      `total JavaScript raw size is ${formatBytes(totals.js)} (report threshold ${formatBytes(
        budgets.totalJsBytes,
      )})`,
    );
  }

  if (totals.css > budgets.totalCssBytes) {
    warnings.push(
      `total CSS raw size is ${formatBytes(totals.css)} (report threshold ${formatBytes(
        budgets.totalCssBytes,
      )})`,
    );
  }

  if (totals.html > budgets.totalHtmlBytes) {
    warnings.push(
      `total HTML raw size is ${formatBytes(totals.html)} (report threshold ${formatBytes(
        budgets.totalHtmlBytes,
      )})`,
    );
  }

  if (totals.svg > budgets.totalSvgBytes) {
    warnings.push(
      `total SVG raw size is ${formatBytes(totals.svg)} (report threshold ${formatBytes(
        budgets.totalSvgBytes,
      )})`,
    );
  }

  if (totals.raster > budgets.totalRasterBytes) {
    warnings.push(
      `total raster image raw size is ${formatBytes(
        totals.raster,
      )} (report threshold ${formatBytes(budgets.totalRasterBytes)})`,
    );
  }

  for (const measurement of measurements) {
    if (
      FONT_EXTENSIONS.has(measurement.extension) &&
      measurement.bytes > budgets.fontFileBytes
    ) {
      warnings.push(
        `${measurement.relativePath} is ${formatBytes(
          measurement.bytes,
        )} (font report threshold ${formatBytes(budgets.fontFileBytes)})`,
      );
    }
  }

  return warnings;
}

export function createAssetReport(measurements, budgets = ASSET_BUDGETS) {
  return {
    byExtension: summarizeByExtension(measurements),
    topFiles: [...measurements]
      .sort((left, right) => right.bytes - left.bytes)
      .slice(0, 10),
    oversizedJavaScript: findOversizedJavaScript(measurements, budgets),
    warnings: createReportWarnings(measurements, budgets),
  };
}

export function formatAssetReport(report) {
  const lines = ["Asset size report by extension:"];

  for (const entry of report.byExtension) {
    const compressed = entry.hasCompressedSizes
      ? `, gzip ${formatBytes(entry.gzipBytes)}, br ${formatBytes(entry.brotliBytes)}`
      : "";
    lines.push(
      `  ${entry.extension}: ${entry.count} file${
        entry.count === 1 ? "" : "s"
      }, raw ${formatBytes(entry.bytes)}${compressed}`,
    );
  }

  lines.push("", "Top raw assets:");
  for (const file of report.topFiles) {
    lines.push(`  ${formatBytes(file.bytes)}  ${file.relativePath}`);
  }

  if (report.warnings.length > 0) {
    lines.push("", "Report-only warnings:");
    for (const warning of report.warnings) {
      lines.push(`  - ${warning}`);
    }
  }

  return lines.join("\n");
}

export async function runBundleSizeCheck({
  distDir = path.resolve("dist"),
  budgets = ASSET_BUDGETS,
  logger = console,
} = {}) {
  const measurements = await measureAssets(distDir);
  const report = createAssetReport(measurements, budgets);

  if (report.oversizedJavaScript.length > 0) {
    const details = report.oversizedJavaScript
      .map(
        ({ relativePath, bytes }) => `${relativePath}: ${formatBytes(bytes)}`,
      )
      .join("\n");
    throw new Error(`JavaScript bundle limit exceeded (500 KiB):\n${details}`);
  }

  const largestJs = measurements
    .filter((measurement) => measurement.extension === ".js")
    .sort((left, right) => right.bytes - left.bytes)[0];

  logger.log(
    largestJs
      ? `JavaScript bundles are within 500 KiB; largest is ${largestJs.relativePath} at ${formatBytes(
          largestJs.bytes,
        )}.`
      : "No JavaScript bundles found.",
  );
  logger.log(formatAssetReport(report));

  return report;
}

const isCli =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  await runBundleSizeCheck();
}
