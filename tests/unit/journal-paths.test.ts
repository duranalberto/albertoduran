import {
  journalEntryIdFromPath,
  journalIndexScope,
  journalRelativePath,
} from "@content/journal_paths";
import { describe, expect, it } from "vitest";

describe("journalRelativePath", () => {
  it.each([
    ["src/thejournal/post.mdx", "post.mdx"],
    ["src/thejournal/vault/section/leaf.md", "vault/section/leaf.md"],
    ["/abs/repo/src/thejournal/vault/index.mdx", "vault/index.mdx"],
    ["src\\thejournal\\vault\\index.mdx", "vault/index.mdx"],
  ])("%s -> %s", (input, expected) => {
    expect(journalRelativePath(input)).toBe(expected);
  });

  it.each(["src/pages/index.astro", "lib/mysrc/thejournal/x.mdx"])(
    "returns null outside src/thejournal (%s)",
    (input) => {
      expect(journalRelativePath(input)).toBeNull();
    },
  );
});

describe("journalEntryIdFromPath", () => {
  it.each([
    ["src/thejournal/post.mdx", "post"],
    ["src/thejournal/post.md", "post"],
    ["src/thejournal/vault/index.mdx", "vault"],
    ["src/thejournal/vault/section/index.md", "vault/section"],
    ["src/thejournal/vault/section/leaf.mdx", "vault/section/leaf"],
  ])("%s -> %s", (input, expected) => {
    expect(journalEntryIdFromPath(input)).toBe(expected);
  });

  it.each(["src/thejournal/.markdownlint.json", "src/pages/post.mdx"])(
    "returns null for %s",
    (input) => {
      expect(journalEntryIdFromPath(input)).toBeNull();
    },
  );
});

describe("journalIndexScope", () => {
  it.each([
    ["src/thejournal/vault/index.mdx", "vault"],
    ["src/thejournal/vault/section/index.md", "vault/section"],
    ["src/thejournal/vault/leaf.mdx", null],
    ["src/thejournal/index.mdx", null],
  ])("%s -> %s", (input, expected) => {
    expect(journalIndexScope(input)).toBe(expected);
  });
});
