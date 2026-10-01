/**
 * Records in-flight build work (network requests, diagram cache reads and
 * writes) so a stalled build can say what it was waiting on. buildKeepAlive()
 * prints the list when the build runs too long, and installs trackFetch() for
 * the length of the build.
 */
import type {
  CacheStoreFactory,
  DiagramCacheStore,
} from "bloomwright-ui/cache";

const pending = new Map<number, { label: string; since: number }>();
let nextId = 0;

/** Track `work` under `label` until it settles. */
export function track<T>(label: string, work: Promise<T>): Promise<T> {
  const id = nextId++;
  pending.set(id, { label, since: Date.now() });
  return work.finally(() => pending.delete(id));
}

/** Pending work, oldest first, as "<label> (<seconds>s)". */
export function describePending(now = Date.now()): string[] {
  return [...pending.values()]
    .sort((a, b) => a.since - b.since)
    .map(
      ({ label, since }) => `${label} (${Math.round((now - since) / 1000)}s)`,
    );
}

const BODY_READERS = ["text", "json", "arrayBuffer", "blob"] as const;

/** Reject `work` if it has not settled after `ms`. */
function withDeadline<T>(
  work: Promise<T>,
  ms: number,
  what: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${what} did not finish within ${ms / 1000}s`)),
      ms,
    );
  });
  return Promise.race([work, deadline]).finally(() => clearTimeout(timer));
}

/**
 * Wrap the global fetch so each request is tracked until its headers arrive,
 * and each body read until it completes. Returns a function that restores it.
 *
 * Body reads also get a deadline. On Cloudflare's build machines some response
 * bodies stop arriving and never settle, and the request's AbortSignal does not
 * end them. Rejecting lets the caller fall back: for the Mermaid prepass, a
 * failed production-cache download just renders that diagram again.
 */
export function trackFetch({
  bodyTimeoutMs = 30_000,
}: { bodyTimeoutMs?: number } = {}): () => void {
  const original = globalThis.fetch;

  globalThis.fetch = async (input, init) => {
    const url = String(input instanceof Request ? input.url : input);
    const response = await track(`fetch ${url}`, original(input, init));
    for (const reader of BODY_READERS) {
      const read = response[reader].bind(response) as () => Promise<unknown>;
      const label = `read body ${response.status} ${url}`;
      Object.defineProperty(response, reader, {
        value: () => track(label, withDeadline(read(), bodyTimeoutMs, label)),
      });
    }
    return response;
  };

  return () => {
    globalThis.fetch = original;
  };
}

/** A cache factory whose stores track every asynchronous read and write. */
export function trackedCache(factory: CacheStoreFactory): CacheStoreFactory {
  return <T>(namespace: string, version: string): DiagramCacheStore<T> => {
    const store = factory<T>(namespace, version);
    return {
      namespace: store.namespace,
      version: store.version,
      get: (key) => track(`${namespace} get ${key}`, store.get(key)),
      getSync: (key) => store.getSync(key),
      set: (key, value) =>
        track(`${namespace} set ${key}`, store.set(key, value)),
      clear: () => track(`${namespace} clear`, store.clear()),
      readAllSync: () => store.readAllSync(),
      ensureDir: () => track(`${namespace} ensureDir`, store.ensureDir()),
    };
  };
}
