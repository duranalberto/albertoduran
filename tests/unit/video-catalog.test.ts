import { fetchCatalogEntry, findCatalogEntry } from "@runtime/video/catalog";
import { describe, expect, it, vi } from "vitest";

const src = "https://cdn.test/videos/a/master.m3u8";

describe("findCatalogEntry", () => {
  it("returns the entry whose playbackUrl matches", () => {
    const catalog = {
      videos: [
        { playbackUrl: "https://cdn.test/videos/b/master.m3u8", title: "B" },
        { playbackUrl: src, title: "A", description: "Desc", tags: ["x", "y"] },
      ],
    };

    expect(findCatalogEntry(catalog, src)).toEqual({
      title: "A",
      description: "Desc",
      tags: ["x", "y"],
    });
  });

  it("drops fields with the wrong type instead of trusting them", () => {
    const catalog = {
      videos: [
        { playbackUrl: src, title: 42, description: "", tags: ["ok", 7] },
      ],
    };

    expect(findCatalogEntry(catalog, src)).toEqual({ tags: ["ok"] });
  });

  it.each([
    ["no videos array", { items: [] }],
    ["not an object", "catalog"],
    ["null", null],
    ["no match", { videos: [{ playbackUrl: "other" }] }],
    ["non-object entries", { videos: ["x", null, 3] }],
  ])("returns null for %s", (_case, catalog) => {
    expect(findCatalogEntry(catalog, src)).toBeNull();
  });
});

describe("fetchCatalogEntry", () => {
  const ok = (body: unknown) =>
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }));

  it("fetches the catalog with CORS and finds the entry", async () => {
    const fetchImpl = ok({ videos: [{ playbackUrl: src, title: "A" }] });

    await expect(
      fetchCatalogEntry("https://cdn.test/catalog.json", src, fetchImpl),
    ).resolves.toEqual({ title: "A", tags: [] });
    expect(fetchImpl).toHaveBeenCalledWith("https://cdn.test/catalog.json", {
      mode: "cors",
    });
  });

  it("returns null on an HTTP error or a network failure", async () => {
    const notFound = vi.fn(async () => new Response("", { status: 404 }));
    const offline = vi.fn(async () => {
      throw new TypeError("network");
    });

    await expect(fetchCatalogEntry("u", src, notFound)).resolves.toBeNull();
    await expect(fetchCatalogEntry("u", src, offline)).resolves.toBeNull();
  });
});
