/**
 * Keeps Node's event loop alive from `astro:build:start` to `astro:build:done`.
 *
 * Node exits with code 0 as soon as nothing holds the event loop open, even
 * while a promise is still pending. On Cloudflare's build machines the Mermaid
 * prepass has left a promise in that state, so the build "succeeded" with no
 * `dist/`. This timer keeps the process alive so a stall fails visibly.
 *
 * While the build runs, fetch and the diagram cache are tracked (see
 * pending-work.ts). Past `reportAfterMs` the build logs what is still pending
 * every check; past `timeoutMs` it fails with that list.
 */
import type { AstroIntegration } from "astro";
import { describePending, trackFetch } from "./pending-work";

const CHECK_INTERVAL_MS = 60_000;
const MAX_LISTED = 20;

export function buildKeepAlive({
  reportAfterMs = 2 * 60_000,
  timeoutMs = 10 * 60_000,
}: { reportAfterMs?: number; timeoutMs?: number } = {}): AstroIntegration {
  let timer: ReturnType<typeof setInterval> | undefined;
  let restoreFetch: (() => void) | undefined;

  return {
    name: "build-keepalive",
    hooks: {
      "astro:build:start": ({ logger }) => {
        const started = Date.now();
        restoreFetch = trackFetch();
        timer = setInterval(() => {
          const elapsed = Date.now() - started;
          if (elapsed < reportAfterMs) return;

          const work = describePending();
          const summary =
            `Build still running after ${Math.round(elapsed / 1000)}s. ` +
            `Pending work (${work.length}): ` +
            (work.slice(0, MAX_LISTED).join("; ") || "none tracked") +
            `. Open handles: ${process.getActiveResourcesInfo().join(", ") || "none"}.`;

          if (elapsed < timeoutMs) {
            logger.warn(summary);
            return;
          }
          logger.error(summary);
          process.exit(1);
        }, CHECK_INTERVAL_MS);
      },
      "astro:build:done": () => {
        clearInterval(timer);
        timer = undefined;
        restoreFetch?.();
        restoreFetch = undefined;
      },
    },
  };
}
