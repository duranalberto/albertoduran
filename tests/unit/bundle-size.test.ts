import { describe, expect, it } from "vitest";
import path from "node:path";
import {
  createAssetReport,
  createReportWarnings,
  findOversizedJavaScript,
  formatAssetReport,
} from "../../scripts/check-bundle-size.mjs";

function asset(
  relativePath: string,
  bytes: number,
  gzipBytes: number | null = null,
  brotliBytes: number | null = null,
) {
  return {
    file: path.resolve(relativePath),
    relativePath,
    extension: path.extname(relativePath).toLowerCase(),
    bytes,
    gzipBytes,
    brotliBytes,
  };
}

describe("bundle size report", () => {
  it("keeps the hard failure scoped to oversized _app JavaScript files", () => {
    const measurements = [
      asset(path.join("custom-dist", "_app", "large.js"), 501 * 1024),
      asset(path.join("custom-dist", "scripts", "large.js"), 800 * 1024),
      asset(path.join("dist", "page.html"), 20 * 1024 * 1024),
      asset(path.join("dist", "_app", "diagram.svg"), 20 * 1024 * 1024),
    ];

    const oversized = findOversizedJavaScript(measurements);

    expect(oversized).toHaveLength(1);
    expect(oversized[0]?.relativePath).toBe(
      path.join("custom-dist", "_app", "large.js"),
    );
  });

  it("reports non-JS thresholds as warnings only", () => {
    const measurements = [
      asset(path.join("dist", "_app", "small.js"), 20 * 1024),
      asset(path.join("dist", "large.html"), 11 * 1024 * 1024, 64, 32),
      asset(path.join("dist", "_app", "font.woff2"), 700 * 1024),
    ];

    const report = createAssetReport(measurements);

    expect(report.oversizedJavaScript).toHaveLength(0);
    expect(createReportWarnings(measurements).join("\n")).toContain(
      "total HTML raw size",
    );
    expect(createReportWarnings(measurements).join("\n")).toContain(
      "font report threshold",
    );
  });

  it("formats raw, gzip, and Brotli totals for compressible extensions", () => {
    const report = createAssetReport([
      asset(path.join("dist", "index.html"), 1000, 100, 80),
      asset(path.join("dist", "_app", "entry.js"), 2000, 200, 120),
    ]);

    const formatted = formatAssetReport(report);

    expect(formatted).toContain(".html: 1 file, raw");
    expect(formatted).toContain("gzip");
    expect(formatted).toContain("br");
  });
});
