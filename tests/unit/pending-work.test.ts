import {
  describePending,
  track,
  trackedCache,
  trackFetch,
} from "../../src/integrations/pending-work";
import type { DiagramCacheStore } from "bloomwright-ui/cache";
import { afterEach, describe, expect, it, vi } from "vitest";

const listed = (label: string) =>
  describePending().some((entry) => entry.startsWith(label));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("track", () => {
  it("lists work until it settles, including on failure", async () => {
    let resolve!: () => void;
    const ok = track("ok work", new Promise<void>((r) => (resolve = r)));
    const failed = track("failed work", Promise.reject(new Error("x")));

    expect(listed("ok work")).toBe(true);
    await expect(failed).rejects.toThrow("x");
    expect(listed("failed work")).toBe(false);

    resolve();
    await ok;
    expect(listed("ok work")).toBe(false);
  });
});

describe("trackFetch", () => {
  it("tracks the request and its body read, then restores fetch", async () => {
    let sendBody!: (body: string) => void;
    const body = new Promise<string>((r) => (sendBody = r));
    const response = {
      status: 200,
      text: () => body,
      json: async () => ({}),
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
    };
    const original = vi.fn(async () => response as unknown as Response);
    vi.stubGlobal("fetch", original);

    const restore = trackFetch();
    const res = await fetch("https://example.test/a.svg");
    const reading = res.text();
    expect(listed("read body 200 https://example.test/a.svg")).toBe(true);

    sendBody("<svg/>");
    await expect(reading).resolves.toBe("<svg/>");
    expect(listed("read body 200")).toBe(false);

    restore();
    expect(globalThis.fetch).toBe(original);
  });

  it("rejects a body read that never finishes, so the caller can fall back", async () => {
    vi.useFakeTimers();
    const response = {
      status: 200,
      text: () => new Promise<string>(() => {}),
      json: async () => ({}),
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response as unknown as Response),
    );

    const restore = trackFetch({ bodyTimeoutMs: 5_000 });
    const res = await fetch("https://example.test/stuck.svg");
    const reading = res.text();
    const settled = expect(reading).rejects.toThrow(
      "read body 200 https://example.test/stuck.svg did not finish within 5s",
    );

    await vi.advanceTimersByTimeAsync(5_000);
    await settled;
    expect(listed("read body 200 https://example.test/stuck.svg")).toBe(false);

    restore();
    vi.useRealTimers();
  });
});

describe("trackedCache", () => {
  it("delegates to the wrapped store", async () => {
    const values = new Map<string, number>();
    const store = {
      namespace: "ns",
      version: "v1",
      get: async (key: string) => values.get(key) ?? null,
      getSync: (key: string) => values.get(key) ?? null,
      set: async (key: string, value: number) => void values.set(key, value),
      clear: async () => values.clear(),
      readAllSync: () => [...values.values()],
      ensureDir: async () => {},
    } satisfies DiagramCacheStore<number>;

    const tracked = trackedCache(
      <T>() => store as unknown as DiagramCacheStore<T>,
    )<number>("ns", "v1");

    await tracked.set("a", 1);
    expect(await tracked.get("a")).toBe(1);
    expect(tracked.readAllSync()).toEqual([1]);
    expect(tracked.namespace).toBe("ns");
    expect(describePending()).toEqual([]);
  });
});
