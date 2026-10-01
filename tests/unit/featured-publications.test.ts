import type { EntryContext } from "@appTypes/content_context";
import { entryManifest } from "@content/processors/thejournal";
import {
  featuredPublicationIds,
  resolveFeaturedPublications,
} from "@data/featured_publications";
import { describe, expect, it } from "vitest";

const entry = (id: string) => ({ id, title: id }) as EntryContext;

describe("featured publications", () => {
  it("resolves ids in the order they are listed", () => {
    const manifest = { b: entry("b"), a: entry("a") };

    expect(
      resolveFeaturedPublications(manifest, ["a", "b"]).map(({ id }) => id),
    ).toEqual(["a", "b"]);
  });

  it("fails the build for an id that is not published", () => {
    expect(() => resolveFeaturedPublications({}, ["missing"])).toThrow(
      'Featured publication "missing" is not a published Journal entry.',
    );
  });

  it("only lists published Journal entries", () => {
    for (const id of featuredPublicationIds) {
      expect(entryManifest[id], id).toBeDefined();
    }
  });
});
