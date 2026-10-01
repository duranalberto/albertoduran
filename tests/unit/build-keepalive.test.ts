import { buildKeepAlive } from "../../src/integrations/build-keepalive";
import { track } from "../../src/integrations/pending-work";
import type { AstroIntegrationLogger } from "astro";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const logger = {
  warn: vi.fn(),
  error: vi.fn(),
} as unknown as AstroIntegrationLogger;

// The hooks only read `logger`; the rest of Astro's hook arguments are unused.
function hooksOf(integration: ReturnType<typeof buildKeepAlive>) {
  const hooks = integration.hooks as Record<string, (args: unknown) => void>;
  return {
    start: () => hooks["astro:build:start"]!({ logger }),
    done: () => hooks["astro:build:done"]!({ logger }),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.mocked(logger.warn).mockClear();
  vi.mocked(logger.error).mockClear();
});

describe("buildKeepAlive", () => {
  it("holds a timer open and tracks fetch from build start until build done", () => {
    const fetchBefore = globalThis.fetch;
    const { start, done } = hooksOf(buildKeepAlive());

    start();
    expect(vi.getTimerCount()).toBe(1);
    expect(globalThis.fetch).not.toBe(fetchBefore);

    done();
    expect(vi.getTimerCount()).toBe(0);
    expect(globalThis.fetch).toBe(fetchBefore);
  });

  it("reports pending work, then fails the build at the timeout", () => {
    const { start, done } = hooksOf(
      buildKeepAlive({ reportAfterMs: 60_000, timeoutMs: 180_000 }),
    );
    void track("stuck request", new Promise(() => {}));

    start();
    vi.advanceTimersByTime(60_000);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /after 60s\. Pending work \(\d+\): .*stuck request/,
      ),
    );
    expect(process.exit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(120_000);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Build still running after 180s"),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
    done();
  });
});
