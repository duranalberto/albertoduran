/**
 * pipeline.ts
 *
 * Build-time diagram pipeline: registry, batch orchestration, and cache.
 *
 * ## Public API (consumed by integration.ts and plugin.ts)
 *   createPipeline(svgBus, themes, logger) → DiagramPipeline
 *   DiagramPipeline.registerDiagram(stableId, code) → Promise<HastElement>
 *   DiagramPipeline.logBuildSummary(astroLogger?)
 *
 * ## Design
 * All mutable state is encapsulated in DiagramPipeline. Callers receive an
 * instance from createPipeline() and pass it through the integration hooks
 * via closure — no module-level singletons, no manual reset calls.
 *
 * Batch orchestration is tuned for the CloudflareWorker service (batched
 * POST). When MermaidInk is the active service it serialises its own
 * requests internally; the debounce here still coalesces diagram registration
 * so the Ink renderer receives all diagrams in a single render() call rather
 * than one call per remark file.
 */

import type { AstroIntegrationLogger } from "astro";
import type { Element as HastElement } from "hast";
import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";
import type { AstroDiskBus } from "../../lib/astro-disk-bus.ts";
import { BuildLogger } from "./build-logger.ts";
import {
  CHUNK_SIZE,
  FLUSH_DEBOUNCE_MS,
  INTER_CHUNK_DELAY_MS,
} from "./constants.ts";
import { createHastElement, sanitizeStyleAttributes } from "./hast.ts";
import { fetchDiagrams, isFallbackSvg } from "./renderers.ts";
import { buildMergedThemeNode } from "./transform.ts";
import { RenderService, type MermaidPalette } from "./types.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Internal types
// ─────────────────────────────────────────────────────────────────────────────

interface BatchItem {
  id: string;
  code: string;
  cacheKey: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildCacheKey(code: string, version: string): string {
  return createHash("sha256").update(`${version}::${code}`).digest("hex");
}

function makeFallbackNode(): HastElement {
  return createHastElement("div", { className: ["mermaid-error"] }, [
    { type: "text", value: "Failed to render Mermaid diagram." },
  ]);
}

/** Returns true when every SVG in the map is a known failure/placeholder. */
function isRenderFailure(svgMap: Map<string, string>): boolean {
  for (const svg of svgMap.values()) {
    if (!isFallbackSvg(svg)) return false;
  }
  return true;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────────────────────
// DiagramPipeline
// ─────────────────────────────────────────────────────────────────────────────

export class DiagramPipeline {
  private readonly svgBus: AstroDiskBus<HastElement>;
  private readonly themes: Map<string, MermaidPalette>;
  private readonly rendererVersion: string;
  private readonly buildLogger: BuildLogger;

  private currentBatch: BatchItem[] = [];
  private batchPromise: Promise<Record<string, HastElement>> | null = null;
  private readonly memoryCache = new Map<string, HastElement>();

  constructor(
    svgBus: AstroDiskBus<HastElement>,
    themes: Map<string, MermaidPalette>,
    rendererVersion: string,
  ) {
    this.svgBus = svgBus;
    this.themes = themes;
    this.rendererVersion = rendererVersion;
    this.buildLogger = new BuildLogger();
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Register a diagram for rendering. Returns the resolved HAST node.
   *
   * Cache hierarchy: memory → disk → batch network render.
   */
  async registerDiagram(stableId: string, code: string): Promise<HastElement> {
    const cacheKey = buildCacheKey(code, this.rendererVersion);

    // 1. Memory cache hit
    const fromMemory = this.memoryCache.get(cacheKey);
    if (fromMemory) {
      const clone = structuredClone(fromMemory);
      sanitizeStyleAttributes(clone);
      return clone;
    }

    // 2. Disk cache hit
    const fromDisk = await this.svgBus.get(cacheKey);
    if (fromDisk) {
      const clone = structuredClone(fromDisk);
      sanitizeStyleAttributes(clone);
      this.memoryCache.set(cacheKey, fromDisk);
      return clone;
    }

    // 3. Queue for batch rendering (deduplicated by stableId)
    if (!this.currentBatch.some((item) => item.id === stableId)) {
      this.currentBatch.push({ id: stableId, code, cacheKey });
    }

    // 4. Arm the debounced batch flush
    if (!this.batchPromise) {
      this.batchPromise = new Promise((resolve) => {
        setTimeout(async () => {
          const results = await this.runBatchFlush();
          resolve(results);
        }, FLUSH_DEBOUNCE_MS);
      });
    }

    const resultsMap = await this.batchPromise;
    return resultsMap[stableId] ?? makeFallbackNode();
  }

  logBuildSummary(logger?: AstroIntegrationLogger): void {
    this.buildLogger.logBuildSummary(logger);
  }

  // ── Private: batch orchestration ────────────────────────────────────────

  private async runBatchFlush(): Promise<Record<string, HastElement>> {
    const items = [...this.currentBatch];
    this.currentBatch = [];
    this.batchPromise = null;

    if (items.length === 0) return {};

    this.buildLogger.logBatchFlush(items.length);

    const finalResults: Record<string, HastElement> = {};
    const chunks = chunkArray(items, CHUNK_SIZE);

    for (let i = 0; i < chunks.length; i++) {
      if (i > 0) {
        this.buildLogger.logRateLimitPause(INTER_CHUNK_DELAY_MS / 1000);
        await sleep(INTER_CHUNK_DELAY_MS);
      }
      const chunkResults = await this.renderChunk(chunks[i]!);
      Object.assign(finalResults, chunkResults);
    }

    return finalResults;
  }

  private async renderChunk(
    items: BatchItem[],
  ): Promise<Record<string, HastElement>> {
    const t0 = performance.now();
    const results: Record<string, HastElement> = {};

    const fetchResp = await fetchDiagrams(
      items.map((d) => ({ id: d.id, code: d.code })),
      this.themes,
    ).catch((err) => {
      console.error("[mermaid:pipeline] fetchDiagrams threw unexpectedly:", err);
      return {
        results: {} as Record<string, Map<string, string>>,
        service: RenderService.FailurePlaceholder,
      };
    });

    const { results: batchResults, service } = fetchResp;

    for (const item of items) {
      const itemT0 = performance.now();
      const svgMap = batchResults[item.id];
      let node: HastElement;

      if (
        svgMap &&
        svgMap.size > 0 &&
        service !== RenderService.FailurePlaceholder &&
        !isRenderFailure(svgMap)
      ) {
        try {
          node = await buildMergedThemeNode(svgMap, item.id, service);
          await this.svgBus.set(item.cacheKey, node);
          this.memoryCache.set(item.cacheKey, node);

          this.buildLogger.logDiagramResult({
            stableId: item.id,
            service,
            duration: Math.round(performance.now() - itemT0),
            themes: Array.from(this.themes.keys()),
          });
        } catch (err) {
          this.buildLogger.logDiagramError(item.id, err);
          node = makeFallbackNode();
          // Do not cache — transform failure may be transient.
        }
      } else {
        node = makeFallbackNode();
        if (service !== RenderService.FailurePlaceholder) {
          this.buildLogger.logDiagramError(
            item.id,
            new Error(`Render produced no usable SVG for "${item.id}"`),
          );
        }
        // Do not cache placeholder/failure nodes.
      }

      results[item.id] = node;
    }

    this.buildLogger.logChunkDone(performance.now() - t0, service);
    return results;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates and returns a new DiagramPipeline instance.
 * Call once per build in the astro:build:start hook.
 */
export function createPipeline(
  svgBus: AstroDiskBus<HastElement>,
  themes: Map<string, MermaidPalette>,
  rendererVersion: string,
): DiagramPipeline {
  return new DiagramPipeline(svgBus, themes, rendererVersion);
}
