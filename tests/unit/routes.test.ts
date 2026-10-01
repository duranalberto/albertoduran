import { journalHref, journalIndexHref } from "@utils/routes";
import { describe, expect, it } from "vitest";

describe("journal routes", () => {
  it("exposes the index route with a trailing slash", () => {
    expect(journalIndexHref).toBe("/thejournal/");
  });

  it.each([
    ["standalone", "/thejournal/standalone/"],
    ["vault/section/child", "/thejournal/vault/section/child/"],
    ["/vault/child/", "/thejournal/vault/child/"],
  ])("builds %s as %s", (id, expected) => {
    expect(journalHref(id)).toBe(expected);
  });

  it("appends an anchor, with or without a leading #", () => {
    expect(journalHref("vault/child", "setup")).toBe(
      "/thejournal/vault/child/#setup",
    );
    expect(journalHref("vault/child", "#setup")).toBe(
      "/thejournal/vault/child/#setup",
    );
  });

  it("ignores an empty anchor", () => {
    expect(journalHref("vault", "")).toBe("/thejournal/vault/");
  });
});
