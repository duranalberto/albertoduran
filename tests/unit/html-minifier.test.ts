import { describe, expect, it } from "vitest";
import { minifyHtmlDocument } from "@integrations/html-minifier/plugin";

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
});
