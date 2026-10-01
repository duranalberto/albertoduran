import { createMermaidRenderPipeline } from "../../src/mermaid/render-pipeline";
import {
  DARK_PALETTE,
  isFallbackSvg,
  LIGHT_PALETTE,
  RenderService,
} from "bloomwright-ui/mermaid";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const diagrams = [{ id: "d1", code: "flowchart LR\n  A --> B" }];
const themes = new Map([
  ["light", LIGHT_PALETTE],
  ["dark", DARK_PALETTE],
]);
const WORKER_URL = "https://worker.test/render";

const workerOk = () =>
  new Response(
    JSON.stringify({
      results: { d1: { light: "<svg>L</svg>", dark: "<svg>D</svg>" } },
    }),
    { status: 200 },
  );
const inkOk = (body = "<svg>ink</svg>") => new Response(body, { status: 200 });
const status = (code: number) => new Response("", { status: code });

// Each mock call builds a fresh Response: a body can only be read once.
let fetchMock: ReturnType<typeof vi.fn>;
const isWorkerCall = (input: unknown) => String(input) === WORKER_URL;
const inkCalls = () =>
  fetchMock.mock.calls.filter(([url]) => !isWorkerCall(url));

/**
 * Settle a pipeline call while advancing fake timers (ink delays, backoff).
 * zlib's deflate completes on Node's thread pool, not a timer, so yield to
 * the real event loop between clock advances until the promise settles.
 */
async function settle<T>(pending: Promise<T>): Promise<T> {
  let done = false;
  pending.then(
    () => (done = true),
    () => (done = true),
  );
  while (!done) {
    await vi.advanceTimersByTimeAsync(1_000);
    await new Promise((resolve) => setImmediate(resolve));
  }
  return pending;
}

const run = (config: Parameters<typeof createMermaidRenderPipeline>[0]) =>
  settle(createMermaidRenderPipeline(config)(diagrams, themes));

beforeEach(() => {
  // setImmediate stays real so settle() can yield to zlib callbacks.
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("createMermaidRenderPipeline", () => {
  it("renders through the Worker when it is configured", async () => {
    fetchMock.mockImplementationOnce(async () => workerOk());

    const result = await run({ url: WORKER_URL, apiKey: "secret" });

    expect(result.service).toBe(RenderService.CloudflareWorker);
    expect(result.results["d1"]?.get("dark")).toBe("<svg>D</svg>");
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer secret");
    const body = JSON.parse(init.body);
    expect(body.batch).toEqual(diagrams);
    expect(Object.keys(body.themes)).toEqual(["light", "dark"]);
  });

  it("falls back to mermaid.ink when the Worker fails", async () => {
    fetchMock
      .mockImplementationOnce(async () => status(500))
      .mockImplementation(async () => inkOk());

    const result = await run({ url: WORKER_URL });

    expect(result.service).toBe(RenderService.MermaidInk);
    expect(result.results["d1"]?.get("light")).toBe("<svg>ink</svg>");
    expect(inkCalls()).toHaveLength(2);
    expect(String(inkCalls()[0]![0])).toMatch(
      /^https:\/\/mermaid\.ink\/svg\/pako:/,
    );
  });

  it.each([
    ["no Worker URL", {}],
    ["the Worker disabled", { url: WORKER_URL, disableWorker: true }],
  ])("skips the Worker with %s", async (_case, config) => {
    fetchMock.mockImplementation(async () => inkOk());

    const result = await run(config);

    expect(result.service).toBe(RenderService.MermaidInk);
    expect(fetchMock.mock.calls.some(([url]) => isWorkerCall(url))).toBe(false);
  });

  it("skips the Worker when the payload is too large", async () => {
    fetchMock.mockImplementation(async () => inkOk());
    const big = [{ id: "d1", code: "x".repeat(1024 * 1024) }];

    const result = await settle(
      createMermaidRenderPipeline({ url: WORKER_URL })(big, themes),
    );

    expect(result.service).toBe(RenderService.MermaidInk);
    expect(fetchMock.mock.calls.some(([url]) => isWorkerCall(url))).toBe(false);
  });

  it("retries mermaid.ink after a 503 with backoff", async () => {
    fetchMock
      .mockImplementationOnce(async () => status(503))
      .mockImplementation(async () => inkOk());

    const result = await run({});

    expect(result.service).toBe(RenderService.MermaidInk);
    expect(inkCalls()).toHaveLength(3); // one retry for light, then dark
  });

  it("returns cache-safe placeholders for every theme when all providers fail", async () => {
    fetchMock.mockImplementation(async () => status(500));

    const result = await run({ url: WORKER_URL });

    expect(result.service).toBe(RenderService.FailurePlaceholder);
    const perTheme = result.results["d1"]!;
    expect([...perTheme.keys()]).toEqual(["light", "dark"]);
    for (const svg of perTheme.values()) {
      // bloomwright-ui must recognize it so a failed render is never cached.
      expect(isFallbackSvg(svg)).toBe(true);
    }
  });
});
