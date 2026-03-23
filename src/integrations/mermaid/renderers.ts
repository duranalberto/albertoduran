/**
 * renderers.ts
 *
 * All SVG rendering backends and the provider-chain orchestrator.
 *
 * Adding a new backend: implement MermaidRenderer, add an instance to
 * PROVIDERS. Priority is first-wins — higher-priority providers go first.
 *
 * ## Service notes
 *
 * CloudflareWorker — batched POST, all diagrams × all themes in one payload.
 *   fontFamily is derived from the first palette in the themes map. All
 *   palettes are expected to share the same font family (enforced by the
 *   MermaidPalette type — a single fontFamily field per palette), so any
 *   entry in the map is equally valid as the source of truth.
 *
 * MermaidInk — strictly serialised, one fetch per diagram per theme.
 *   Config is sent via both the %%{init}%% diagram directive (parsed by
 *   the Mermaid library) and the top-level `mermaid` key (read by the
 *   mermaid.ink HTTP API before diagram parsing). Both are required.
 *
 *   After the batch-debounce refactor, all diagrams are flushed together
 *   (e.g. 16 diagrams × 2 themes = 32 sequential requests). The previous
 *   400 ms inter-request delay was too short and triggered 503 rate-limiting
 *   around request 30+. The fix raises the base delay to 1 200 ms and adds
 *   exponential backoff (2 s → 4 s → 8 s → 16 s) on 503 responses.
 */

import { promisify } from "node:util";
import { deflate as zlibDeflate } from "node:zlib";
import { generateMermaidTheme } from "./theme.ts";
import {
  RenderService,
  type MermaidPalette,
  type MermaidRenderer,
  type RenderResult,
} from "./types.ts";

const deflateAsync = promisify(zlibDeflate);

// ─────────────────────────────────────────────────────────────────────────────
// Theme generation — memoized per palette reference.
// ─────────────────────────────────────────────────────────────────────────────

const themeCache = new WeakMap<
  MermaidPalette,
  Record<string, string | boolean>
>();

function getCachedTheme(
  palette: MermaidPalette,
): Record<string, string | boolean> {
  let cached = themeCache.get(palette);
  if (!cached) {
    cached = generateMermaidTheme(palette);
    themeCache.set(palette, cached);
  }
  return cached;
}

// ─────────────────────────────────────────────────────────────────────────────
// Font resolution
//
// All palettes are expected to share the same fontFamily (they reference the
// same CSS font stack loaded on every page). Reading from the first palette
// is the explicit, documented contract rather than an implicit loop side-effect.
// ─────────────────────────────────────────────────────────────────────────────

function resolveFontFamily(themes: Map<string, MermaidPalette>): string {
  const firstPalette = themes.values().next().value as
    | MermaidPalette
    | undefined;
  return firstPalette?.fontFamily ?? "sans-serif";
}

// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Worker renderer (batched, primary)
// ─────────────────────────────────────────────────────────────────────────────

class CloudflareWorkerRenderer implements MermaidRenderer {
  name = RenderService.CloudflareWorker;

  isEnabled(): boolean {
    return (
      process.env.MERMAID_DISABLE_WORKER !== "true" &&
      !!process.env.MERMAID_RENDERER_URL
    );
  }

  async render(
    diagrams: Array<{ id: string; code: string }>,
    themes: Map<string, MermaidPalette>,
  ): Promise<RenderResult> {
    const workerUrl = process.env["MERMAID_RENDERER_URL"]!;
    const apiKey = process.env["MERMAID_RENDERER_API_KEY"];

    const themesPayload: Record<string, unknown> = {};
    for (const [name, palette] of themes) {
      themesPayload[name] = {
        theme: "base",
        themeVariables: getCachedTheme(palette),
        flowchart: { htmlLabels: true, useMaxWidth: true },
        sequence: { useMaxWidth: true },
        securityLevel: "loose",
      };
    }

    const body: Record<string, unknown> = {
      batch: diagrams.map((d) => ({ id: d.id, code: d.code })),
      fontFamily: resolveFontFamily(themes),
    };

    if (Object.keys(themesPayload).length > 0) {
      body["themes"] = themesPayload;
    }

    const requestBody = JSON.stringify(body);

    if (Buffer.byteLength(requestBody, "utf8") > 900 * 1024) {
      throw new Error("Payload too large for Cloudflare Worker");
    }

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey || "",
      },
      body: requestBody,
    });

    if (!response.ok) throw new Error(`Worker status ${response.status}`);

    const { results } = (await response.json()) as {
      results: Record<string, Record<string, string>>;
    };

    const out: Record<string, Map<string, string>> = {};
    for (const [id, themeMap] of Object.entries(results)) {
      out[id] = new Map(Object.entries(themeMap));
    }

    return { results: out, service: RenderService.CloudflareWorker };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// mermaid.ink renderer (individual fetches per theme, fallback)
//
// mermaid.ink only accepts one request at a time — concurrent requests are
// rejected or silently dropped. Requests are strictly serialized via a
// promise chain (this.tail).
//
// Unlike the Cloudflare Worker which renders all themes in a single batched
// call, mermaid.ink must be called once per diagram per theme. For a two-theme
// setup (light + dark) this means 2N requests for N diagrams.
//
// mermaid.ink always returns `id="mermaid-svg"` on the SVG root and embeds
// CSS scoped to `#mermaid-svg`. The Ink transform strategy handles re-scoping
// each SVG to its stable `mermaid-<stableId>` id and merging the per-theme
// CSS blocks with correct [data-theme] guards.
//
// Rate limiting note: after the batch-debounce refactor, all diagrams arrive
// together (e.g. 16 × 2 themes = 32 requests). The old 400 ms inter-request
// delay was enough when diagrams trickled in one file at a time, but causes
// 503s for large batches. The delay is now 1 200 ms with exponential backoff
// on 503 responses.
// ─────────────────────────────────────────────────────────────────────────────

const INK_INTER_REQUEST_DELAY_MS = 1_200;
const INK_MAX_RETRIES = 4;

class MermaidInkRenderer implements MermaidRenderer {
  name = RenderService.MermaidInk;

  /** Serialization tail — ensures mermaid.ink is never hit concurrently. */
  private tail: Promise<void> = Promise.resolve();

  isEnabled(): boolean {
    return true; // Always available as final fallback
  }

  async render(
    diagrams: Array<{ id: string; code: string }>,
    themes: Map<string, MermaidPalette>,
  ): Promise<RenderResult> {
    const out: Record<string, Map<string, string>> = {};

    const themeEntries = Array.from(themes.entries());

    for (const d of diagrams) {
      const diagramResults = new Map<string, string>();
      out[d.id] = diagramResults;

      if (themeEntries.length === 0) {
        // No palettes provided — single fetch with no theme config.
        const svg = await this.fetchSingle(d.code, null);
        diagramResults.set("default", svg);
      } else {
        // Fetch each theme independently — mermaid.ink renders one config at
        // a time. All themes are fetched so the transform can produce correct
        // [data-theme="X"] scoped CSS blocks for each one, matching exactly
        // what the Cloudflare Worker path produces.
        for (const [themeName, palette] of themeEntries) {
          const svg = await this.fetchSingle(d.code, palette);
          diagramResults.set(themeName, svg);
        }
      }
    }

    return { results: out, service: RenderService.MermaidInk };
  }

  private fetchSingle(
    code: string,
    palette: MermaidPalette | null,
  ): Promise<string> {
    const result = this.tail.then(() => this.doFetch(code, palette));
    this.tail = result.then(
      () => {},
      () => {},
    );
    return result;
  }

  private async doFetch(
    code: string,
    palette: MermaidPalette | null,
  ): Promise<string> {
    const config: Record<string, unknown> = palette
      ? {
          theme: "base",
          themeVariables: getCachedTheme(palette),
          flowchart: { htmlLabels: true, useMaxWidth: true },
          securityLevel: "loose",
        }
      : {
          flowchart: { htmlLabels: true, useMaxWidth: true },
          securityLevel: "loose",
        };

    // The payload requires BOTH fields:
    //   - `code`    — the diagram text; %%{init}%% is a Mermaid diagram
    //                 directive parsed by the Mermaid library itself.
    //   - `mermaid` — the renderer init config read by mermaid.ink at the
    //                 HTTP API level, before the diagram text is processed.
    // They serve different layers and both must be present.
    const cleanCode = code.replace(/^---[\s\S]*?---/m, "").trim();
    const payload = JSON.stringify({
      code: `%%{init: ${JSON.stringify(config)}}%%\n${cleanCode}`,
      mermaid: config,
    });

    const compressed = await deflateAsync(Buffer.from(payload, "utf-8"), {
      level: 9,
    });
    const encoded = compressed
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const url = `https://mermaid.ink/svg/pako:${encoded}`;

    // Retry with exponential backoff on 503. The batch-debounce refactor
    // collects all diagrams before flushing (e.g. 16 diagrams × 2 themes =
    // 32 sequential requests). The old 400 ms gap caused rate-limiting around
    // request 30+. Raising the inter-request delay to 1 200 ms and adding
    // backoff keeps the request rate safely below mermaid.ink's threshold.
    for (let attempt = 0; attempt <= INK_MAX_RETRIES; attempt++) {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });

      if (res.ok) {
        const svg = await res.text();
        // Inter-request courtesy delay — applied after every successful fetch.
        await new Promise((r) => setTimeout(r, INK_INTER_REQUEST_DELAY_MS));
        return svg;
      }

      if (res.status === 503 && attempt < INK_MAX_RETRIES) {
        // Exponential backoff: 2 s, 4 s, 8 s, 16 s
        const backoff = Math.pow(2, attempt + 1) * 1_000;
        console.warn(
          `[mermaid:ink] 503 on attempt ${attempt + 1}/${INK_MAX_RETRIES + 1}, retrying in ${backoff / 1_000}s…`,
        );
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      throw new Error(`mermaid.ink ${res.status}: ${url}`);
    }

    // Unreachable but satisfies TypeScript exhaustiveness.
    throw new Error(`mermaid.ink: all retries exhausted for ${url}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider chain
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_SVG = `<svg id="mermaid-placeholder" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="60" fill="none" stroke="#ccc" stroke-width="1" rx="4"/>
  <text x="100" y="34" text-anchor="middle" font-size="12" fill="#999" font-family="sans-serif">
    Diagram unavailable
  </text>
</svg>`;

/**
 * SVGs that must NOT be cached — worker error sentinel and our placeholder.
 */
export function isFallbackSvg(svg: string): boolean {
  return (
    svg.includes('id="mermaid-error"') ||
    svg.includes('id="mermaid-placeholder"')
  );
}

/**
 * Ordered by priority. First enabled provider that succeeds wins.
 */
const PROVIDERS: MermaidRenderer[] = [
  new CloudflareWorkerRenderer(),
  new MermaidInkRenderer(),
];

/**
 * Attempts each provider in order. Returns a RenderResult with placeholder
 * SVGs and FailurePlaceholder service if all providers fail.
 */
export async function fetchDiagrams(
  diagrams: Array<{ id: string; code: string }>,
  themes: Map<string, MermaidPalette>,
): Promise<RenderResult> {
  let lastError: Error | null = null;

  for (const provider of PROVIDERS) {
    if (!provider.isEnabled()) continue;

    try {
      return await provider.render(diagrams, themes);
    } catch (err) {
      lastError = err as Error;
      console.warn(
        `[mermaid:renderers] ${provider.name} failed: ${lastError.message}`,
      );
    }
  }

  // All providers failed — return placeholder SVGs so the build doesn't crash.
  const fallbackResults: Record<string, Map<string, string>> = {};
  for (const d of diagrams) {
    const diagramResults = new Map<string, string>();
    fallbackResults[d.id] = diagramResults;
    for (const themeName of themes.size > 0 ? themes.keys() : ["default"]) {
      diagramResults.set(themeName, PLACEHOLDER_SVG);
    }
  }

  return {
    results: fallbackResults,
    service: RenderService.FailurePlaceholder,
  };
}
