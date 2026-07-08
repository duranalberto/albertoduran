/**
 * render-pipeline.ts — albertoduran's caller-owned Mermaid render pipeline.
 *
 * bloomwright-ui's `mermaidRenderer()` owns all addressing/caching/emit but does
 * NOT ship a real renderer — it only invokes built-in fixtures (dev/tests). This
 * file is the production `MermaidRenderPipeline` the app injects via
 * `mermaidRenderer({ render })`. It is the render backend that previously lived
 * in src/integrations/mermaid/renderers.ts, re-expressed against the injected
 * port: it turns diagram text into themed SVGs and nothing else.
 *
 * Provider chain: batched Cloudflare Worker → serialized mermaid.ink → placeholder
 * SVG (so a render outage never crashes the build). Theme generation and the
 * RenderService/RenderResult contract come from bloomwright-ui/mermaid.
 *
 * astro.config.mjs resolves MERMAID_RENDERER_URL / _API_KEY / _DISABLE_WORKER
 * (via Vite loadEnv + shell env) and passes them to createMermaidRenderPipeline.
 * When MERMAID_RENDERER_FIXTURE=true the config omits `render` entirely, so this
 * pipeline is never invoked and the build stays offline/deterministic.
 */
import { promisify } from "node:util";
import { deflate as zlibDeflate } from "node:zlib";
import {
  RenderService,
  generateMermaidTheme,
  type MermaidPalette,
  type MermaidRenderPipeline,
  type MermaidRenderer,
  type RenderResult,
} from "bloomwright-ui/mermaid";

export interface MermaidRendererConfig {
  /** Cloudflare Worker endpoint. Omit → skip straight to mermaid.ink. */
  url?: string | undefined;
  /** Bearer token for the Worker (sent as `Authorization: Bearer …`). */
  apiKey?: string | undefined;
  /** Force the mermaid.ink fallback even when a Worker URL is present. */
  disableWorker?: boolean | undefined;
}

const deflateAsync = promisify(zlibDeflate);
const WORKER_RENDER_TIMEOUT_MS = 90_000;

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

function resolveFontFamily(themes: Map<string, MermaidPalette>): string {
  const firstPalette = themes.values().next().value as
    | MermaidPalette
    | undefined;
  return firstPalette?.fontFamily ?? "sans-serif";
}

// ── Cloudflare Worker (batched, primary) ─────────────────────────────────────
class CloudflareWorkerRenderer implements MermaidRenderer {
  name = RenderService.CloudflareWorker;

  constructor(private readonly config: MermaidRendererConfig) {}

  isEnabled(): boolean {
    return this.config.disableWorker !== true && !!this.config.url;
  }

  async render(
    diagrams: Array<{ id: string; code: string }>,
    themes: Map<string, MermaidPalette>,
  ): Promise<RenderResult> {
    const workerUrl = this.config.url!;
    const apiKey = this.config.apiKey;

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
    if (Object.keys(themesPayload).length > 0) body["themes"] = themesPayload;

    const requestBody = JSON.stringify(body);
    if (Buffer.byteLength(requestBody, "utf8") > 900 * 1024) {
      throw new Error("Payload too large for Cloudflare Worker");
    }

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: requestBody,
      signal: AbortSignal.timeout(WORKER_RENDER_TIMEOUT_MS),
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

// ── mermaid.ink (serialized fetches, fallback) ───────────────────────────────
const INK_INTER_REQUEST_DELAY_MS = 1_200;
const INK_MAX_RETRIES = 4;

class MermaidInkRenderer implements MermaidRenderer {
  name = RenderService.MermaidInk;
  private tail: Promise<void> = Promise.resolve();

  isEnabled(): boolean {
    return true;
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
        diagramResults.set("default", await this.fetchSingle(d.code, null));
      } else {
        for (const [themeName, palette] of themeEntries) {
          diagramResults.set(themeName, await this.fetchSingle(d.code, palette));
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
          fontFamily: palette.fontFamily,
          flowchart: { htmlLabels: true, useMaxWidth: true },
          securityLevel: "loose",
        }
      : {
          flowchart: { htmlLabels: true, useMaxWidth: true },
          securityLevel: "loose",
        };

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

    for (let attempt = 0; attempt <= INK_MAX_RETRIES; attempt++) {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });

      if (res.ok) {
        const svg = await res.text();
        await new Promise((r) => setTimeout(r, INK_INTER_REQUEST_DELAY_MS));
        return svg;
      }

      if (res.status === 503 && attempt < INK_MAX_RETRIES) {
        const backoff = Math.pow(2, attempt + 1) * 1_000;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      throw new Error(`mermaid.ink ${res.status}: ${url}`);
    }

    throw new Error(`mermaid.ink: all retries exhausted for ${url}`);
  }
}

const PLACEHOLDER_SVG = `<svg id="mermaid-placeholder" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="60" fill="none" stroke="#ccc" stroke-width="1" rx="4"/>
  <text x="100" y="34" text-anchor="middle" font-size="12" fill="#999" font-family="sans-serif">Diagram unavailable</text>
</svg>`;

/**
 * Build a `MermaidRenderPipeline` from Worker credentials. Pass the result as
 * `mermaidRenderer({ render })`.
 */
export function createMermaidRenderPipeline(
  config: MermaidRendererConfig,
): MermaidRenderPipeline {
  const inkRenderer = new MermaidInkRenderer();

  return async (diagrams, themes) => {
    const providers: MermaidRenderer[] = [
      new CloudflareWorkerRenderer(config),
      inkRenderer,
    ];

    for (const provider of providers) {
      if (!provider.isEnabled()) continue;
      try {
        return await provider.render(diagrams, themes);
      } catch (err) {
        console.warn(
          `[mermaid:renderers] ${provider.name} failed: ${(err as Error).message}`,
        );
      }
    }

    // All providers failed — placeholder SVGs so the build doesn't crash.
    const fallbackResults: Record<string, Map<string, string>> = {};
    for (const d of diagrams) {
      const perTheme = new Map<string, string>();
      fallbackResults[d.id] = perTheme;
      for (const themeName of themes.size > 0 ? themes.keys() : ["default"]) {
        perTheme.set(themeName, PLACEHOLDER_SVG);
      }
    }
    return {
      results: fallbackResults,
      service: RenderService.FailurePlaceholder,
    };
  };
}
