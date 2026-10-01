/**
 * Loads hls.js from the jsDelivr CDN on demand, pinned to an exact version and
 * verified with Subresource Integrity. It is not bundled: the full build
 * (~600 KB, needed for the separate audio renditions our streams use) would
 * exceed the per-chunk budget for a player that few pages render.
 *
 * To upgrade, update both values:
 *   curl -sL <src> | openssl dgst -sha384 -binary | openssl base64 -A
 */
export const HLS_SCRIPT = {
  src: "https://cdn.jsdelivr.net/npm/hls.js@1.7.3/dist/hls.min.js",
  integrity:
    "sha384-cciJ0zi8d1uMKC2zJd7jvPY4HQt7W4ByUI/FlMkltvBi31aW61rcpVBhpmW8/NwX",
} as const;

export interface HlsLevel {
  width: number;
  height: number;
}

export interface HlsInstance {
  currentLevel: number;
  attachMedia(video: HTMLVideoElement): void;
  loadSource(url: string): void;
  destroy(): void;
  recoverMediaError(): void;
  on(event: string, callback: (event: string, data: unknown) => void): void;
}

export interface HlsStatic {
  isSupported(): boolean;
  Events: {
    MEDIA_ATTACHED: string;
    MANIFEST_PARSED: string;
    ERROR: string;
  };
  ErrorTypes: {
    MEDIA_ERROR: string;
    NETWORK_ERROR: string;
  };
  new (config?: Record<string, unknown>): HlsInstance;
}

declare global {
  interface Window {
    Hls?: HlsStatic;
  }
}

const pending = new WeakMap<Document, Promise<HlsStatic | null>>();

/**
 * Resolve the hls.js global, injecting its script at most once per document.
 * Resolves null if the script fails to load (network or integrity failure).
 */
export function loadHlsScript(
  doc: Document = document,
  win: Window = window,
): Promise<HlsStatic | null> {
  if (win.Hls) return Promise.resolve(win.Hls);

  let promise = pending.get(doc);
  if (!promise) {
    promise = new Promise((resolve) => {
      const script = doc.createElement("script");
      script.src = HLS_SCRIPT.src;
      script.integrity = HLS_SCRIPT.integrity;
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      script.async = true;
      script.addEventListener("load", () => resolve(win.Hls ?? null), {
        once: true,
      });
      script.addEventListener("error", () => resolve(null), { once: true });
      doc.head.append(script);
    });
    pending.set(doc, promise);
  }

  return promise;
}
