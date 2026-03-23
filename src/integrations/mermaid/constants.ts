/**
 * constants.ts
 *
 * Build-time constants shared across the mermaid integration.
 *
 * ## RENDERER_VERSION
 * Seeds the SHA-256 cache key together with the diagram source code.
 * Bump this value whenever a change would produce different SVG output
 * for the same input code — e.g.:
 *   - theme generation logic in theme.ts changes
 *   - transform / SVG post-processing logic in transform.ts changes
 *   - a new Mermaid version is deployed to the Cloudflare Worker
 *
 * Leaving it stale causes the disk cache to serve SVGs built with
 * old logic without re-rendering.
 *
 * v4.2 — normalizesvgIntrinsicSize: SVG width="100%" replaced with
 *         pixel value from viewBox so CSS width: auto resolves to the
 *         diagram's natural dimensions rather than filling the container.
 */
export const RENDERER_VERSION = "v4.2";

/**
 * Debounce window (ms) before the collected batch is flushed to the
 * render service.  Gives all concurrent remark pipelines time to register
 * their diagrams so a single network round-trip handles the whole build.
 */
export const FLUSH_DEBOUNCE_MS = 800;

/**
 * Maximum number of diagrams sent in a single Worker request.
 * Prevents the JSON payload from exceeding the ~900 KB limit.
 */
export const CHUNK_SIZE = 40;

/**
 * Pause between Worker chunk requests (ms).
 * Respects the Cloudflare Worker's rate limit.
 * Not used when the MermaidInk service is active — Ink serialises
 * its own requests internally with a per-fetch courtesy delay.
 */
export const INTER_CHUNK_DELAY_MS = 22_000;
