import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import {
  minifyGeneratedHtml,
  minifyHtmlDocument,
} from "@integrations/html-minifier/plugin";

const silentLogger = {
  log() {},
  error() {},
};

describe("custom HTML minifier", () => {
  it("minifies document HTML while preserving code-oriented fragments", async () => {
    const html = `
      <!doctype html>
      <html>
        <head>
          <!-- remove me -->
          <style>.box { color: red; }</style>
        </head>
        <body>
          <main>
            <p>Lots       of       space</p>
            <pre>const value = 1;
console.log(value);</pre>
            <code>  npm run build  </code>
            <kbd> Ctrl + K </kbd>
          </main>
        </body>
      </html>
    `;

    const minified = await minifyHtmlDocument(html);

    expect(minified).not.toContain("remove me");
    expect(minified).toContain("<p>Lots of space</p>");
    expect(minified).toContain(`<pre>const value = 1;
console.log(value);</pre>`);
    expect(minified).toContain("<code>  npm run build  </code>");
    expect(minified).toContain("<kbd> Ctrl + K </kbd>");
  });

  it("throws after a generated HTML file fails to minify", async () => {
    const distDir = await mkdtemp(path.join(tmpdir(), "html-minifier-"));

    try {
      await mkdir(path.join(distDir, "nested"), { recursive: true });
      await mkdir(path.join(distDir, "_app"), { recursive: true });
      await writeFile(path.join(distDir, "index.html"), "<p>good</p>");
      await writeFile(path.join(distDir, "nested", "bad.html"), "<p>bad</p>");
      await writeFile(path.join(distDir, "_app", "skip.html"), "<p>skip</p>");

      await expect(
        minifyGeneratedHtml({
          distDir,
          logger: silentLogger,
          minifier: async (html) => {
            if (html.includes("bad")) {
              throw new Error("fixture failure");
            }
            return html.replace("good", "minified");
          },
        }),
      ).rejects.toThrow("fixture failure");

      await expect(
        readFile(path.join(distDir, "index.html"), "utf-8"),
      ).resolves.toBe("<p>minified</p>");
      await expect(
        readFile(path.join(distDir, "_app", "skip.html"), "utf-8"),
      ).resolves.toBe("<p>skip</p>");
    } finally {
      await rm(distDir, { recursive: true, force: true });
    }
  });
});
