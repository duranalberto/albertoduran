import { afterEach, describe, expect, it } from "vitest";
import { resolveRemoteCacheBaseUrl } from "@integrations/mermaid/pipeline";

const originalEnv = {
  MERMAID_DISABLE_REMOTE_CACHE: process.env.MERMAID_DISABLE_REMOTE_CACHE,
  MERMAID_ENABLE_REMOTE_CACHE: process.env.MERMAID_ENABLE_REMOTE_CACHE,
  MERMAID_RENDERER_URL: process.env.MERMAID_RENDERER_URL,
};

function restoreEnv() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("resolveRemoteCacheBaseUrl", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("uses the deployed site cache when no primary worker renderer is configured", () => {
    delete process.env.MERMAID_DISABLE_REMOTE_CACHE;
    delete process.env.MERMAID_ENABLE_REMOTE_CACHE;
    delete process.env.MERMAID_RENDERER_URL;

    expect(resolveRemoteCacheBaseUrl("https://example.com/")).toBe(
      "https://example.com",
    );
  });

  it("skips the deployed site cache when the primary worker renderer is configured", () => {
    delete process.env.MERMAID_DISABLE_REMOTE_CACHE;
    delete process.env.MERMAID_ENABLE_REMOTE_CACHE;
    process.env.MERMAID_RENDERER_URL = "https://renderer.example.com/";

    expect(resolveRemoteCacheBaseUrl("https://example.com/")).toBeNull();
  });

  it("allows explicit remote cache opt-in with a primary worker renderer", () => {
    delete process.env.MERMAID_DISABLE_REMOTE_CACHE;
    process.env.MERMAID_ENABLE_REMOTE_CACHE = "true";
    process.env.MERMAID_RENDERER_URL = "https://renderer.example.com/";

    expect(resolveRemoteCacheBaseUrl("https://example.com/")).toBe(
      "https://example.com",
    );
  });

  it("honors the explicit remote cache disable flag", () => {
    process.env.MERMAID_DISABLE_REMOTE_CACHE = "true";
    process.env.MERMAID_ENABLE_REMOTE_CACHE = "true";
    delete process.env.MERMAID_RENDERER_URL;

    expect(resolveRemoteCacheBaseUrl("https://example.com/")).toBeNull();
  });
});
