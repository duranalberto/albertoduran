import type { AstroIntegrationLogger } from "astro";
import { minify as minifyCss } from "csso";
import glob from "fast-glob";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const MERMAID_PAGE_STYLE_ATTR = "data-mermaid-page-css";
const MERMAID_SVG_RE = /<svg\b[^>]*\bid="mermaid-[^"]+"[^>]*>[\s\S]*?<\/svg>/g;
const STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/g;
interface PageCssResult {
  html: string;
  diagramCount: number;
  extractedStyleCount: number;
  extractedCssBytes: number;
  optimizedCssBytes: number;
}

function optimizeMermaidCss(css: string): string {
  const result = minifyCss(css, {
    // Mermaid emits repeated, ID-scoped light/dark rule pairs. CSSO
    // restructuring can group selectors across different diagrams and theme
    // guards, which preserves declarations but makes the cascade fragile when
    // the CSS is cloned into expanded SVG popovers.
    restructure: false,
  });
  return result.css;
}

function injectPageCss(html: string, css: string): string {
  const styleTag = `<style ${MERMAID_PAGE_STYLE_ATTR}>${css}</style>`;
  if (html.includes("</head>")) {
    return html.replace("</head>", `${styleTag}</head>`);
  }
  throw new Error("[mermaid:page-css] Could not find </head> for CSS injection.");
}

export function optimizeMermaidPageCss(html: string): PageCssResult {
  const cssBlocks: string[] = [];
  let diagramCount = 0;
  let extractedStyleCount = 0;
  let extractedCssBytes = 0;

  const withoutSvgStyles = html.replace(MERMAID_SVG_RE, (svgMarkup) => {
    const styleMatches = [...svgMarkup.matchAll(STYLE_RE)];
    if (styleMatches.length === 0) return svgMarkup;

    diagramCount += 1;
    const extractedCss = styleMatches
      .map((match) => match[1] ?? "")
      .filter((css) => css.trim().length > 0)
      .join("\n");

    if (!extractedCss.trim()) return svgMarkup;

    extractedStyleCount += styleMatches.length;
    extractedCssBytes += extractedCss.length;
    cssBlocks.push(extractedCss);

    return svgMarkup.replace(STYLE_RE, "");
  });

  if (cssBlocks.length === 0) {
    return {
      html,
      diagramCount: 0,
      extractedStyleCount: 0,
      extractedCssBytes: 0,
      optimizedCssBytes: 0,
    };
  }

  const optimizedCss = optimizeMermaidCss(cssBlocks.join("\n"));

  return {
    html: injectPageCss(withoutSvgStyles, optimizedCss),
    diagramCount,
    extractedStyleCount,
    extractedCssBytes,
    optimizedCssBytes: optimizedCss.length,
  };
}

export async function optimizeBuiltMermaidPageCss(
  outDir: URL,
  logger?: AstroIntegrationLogger,
): Promise<void> {
  const distDir = fileURLToPath(outDir);
  const htmlFiles = await glob(join(distDir, "**/*.html"), {
    ignore: [join(distDir, "_astro/**")],
  });

  let pagesOptimized = 0;
  let diagramsOptimized = 0;
  let extractedStyleCount = 0;
  let extractedCssBytes = 0;
  let optimizedCssBytes = 0;

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, "utf-8");
    const result = optimizeMermaidPageCss(html);
    if (result.diagramCount === 0) continue;

    await writeFile(filePath, result.html, "utf-8");
    pagesOptimized += 1;
    diagramsOptimized += result.diagramCount;
    extractedStyleCount += result.extractedStyleCount;
    extractedCssBytes += result.extractedCssBytes;
    optimizedCssBytes += result.optimizedCssBytes;
  }

  if (pagesOptimized > 0) {
    logger?.info(
      `Hoisted ${extractedStyleCount} Mermaid SVG style block(s) from ${diagramsOptimized} diagram(s) on ${pagesOptimized} page(s); CSS ${extractedCssBytes}B → ${optimizedCssBytes}B.`,
    );
  }
}
