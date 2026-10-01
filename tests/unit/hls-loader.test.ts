import { HLS_SCRIPT, loadHlsScript } from "@runtime/video/hls-loader";
import { describe, expect, it } from "vitest";

class FakeScript extends EventTarget {
  src = "";
  integrity = "";
  crossOrigin: string | null = null;
  referrerPolicy = "";
  async = false;
}

function fakeEnvironment() {
  const appended: FakeScript[] = [];
  const win: { Hls?: unknown } = {};
  const doc = {
    createElement: () => new FakeScript(),
    head: { append: (node: FakeScript) => appended.push(node) },
  };
  return { appended, win, doc: doc as unknown as Document };
}

describe("hls.js CDN source", () => {
  it("pins an exact version with a SHA-384 integrity hash", () => {
    expect(HLS_SCRIPT.src).toMatch(
      /^https:\/\/cdn\.jsdelivr\.net\/npm\/hls\.js@\d+\.\d+\.\d+\/dist\/hls\.min\.js$/,
    );
    expect(HLS_SCRIPT.integrity).toMatch(/^sha384-[A-Za-z0-9+/]{64}$/);
  });
});

describe("loadHlsScript", () => {
  it("injects one integrity-checked script and resolves with window.Hls", async () => {
    const { appended, win, doc } = fakeEnvironment();
    const first = loadHlsScript(doc, win as Window);
    const second = loadHlsScript(doc, win as Window);

    expect(appended).toHaveLength(1);
    const [script] = appended;
    expect(script).toMatchObject({
      src: HLS_SCRIPT.src,
      integrity: HLS_SCRIPT.integrity,
      crossOrigin: "anonymous",
      async: true,
    });

    const Hls = { isSupported: () => true };
    win.Hls = Hls;
    script!.dispatchEvent(new Event("load"));

    await expect(first).resolves.toBe(Hls);
    await expect(second).resolves.toBe(Hls);
  });

  it("resolves null when the script fails to load", async () => {
    const { appended, win, doc } = fakeEnvironment();
    const pending = loadHlsScript(doc, win as Window);

    appended[0]!.dispatchEvent(new Event("error"));

    await expect(pending).resolves.toBeNull();
  });

  it("reuses an already loaded global without injecting a script", async () => {
    const { appended, win, doc } = fakeEnvironment();
    const Hls = { isSupported: () => true };
    win.Hls = Hls;

    await expect(loadHlsScript(doc, win as Window)).resolves.toBe(Hls);
    expect(appended).toHaveLength(0);
  });
});
