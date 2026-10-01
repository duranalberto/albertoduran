import {
  enforce,
  isIndexFileFor,
  requiresChildEntry,
  requiresRootImage,
  requiresRootIndex,
  requiresSectionIndex,
  requiresStandaloneImage,
} from "@content/processors/vault_rules";
import { describe, expect, it } from "vitest";

const e = (id: string, filepath: string, image?: string) => ({
  id,
  filepath,
  ...(image ? { image } : {}),
});

describe("vault rules", () => {
  it("recognizes .md and .mdx index files", () => {
    expect(isIndexFileFor("v/index.mdx", "v")).toBe(true);
    expect(isIndexFileFor("v/index.md", "v")).toBe(true);
    expect(isIndexFileFor("v/s/index.mdx", "v")).toBe(false);
  });

  it("requires a root index", () => {
    expect(requiresRootIndex([e("v", "v/index.mdx")], "v")).toBeNull();
    expect(requiresRootIndex([e("v/a", "v/a.mdx")], "v")).toBe(
      '[thejournal] Vault "v" is missing a required root index. Add v/index.mdx or v/index.md before adding entries under this folder.',
    );
    expect(requiresRootIndex([], "v")).toContain(
      "missing a required root index",
    );
  });

  it("requires a section index", () => {
    expect(requiresSectionIndex([e("v/s", "v/s/index.md")], "v/s")).toBeNull();
    expect(requiresSectionIndex([e("v/s/a", "v/s/a.mdx")], "v/s")).toBe(
      '[thejournal] Vault section "v/s" is missing a required index. Add v/s/index.mdx or v/s/index.md before adding entries under this folder.',
    );
  });

  it("requires the root index to carry an image", () => {
    expect(requiresRootImage(e("v", "v/index.mdx", "img"), "v")).toBeNull();
    expect(requiresRootImage(e("v", "v/index.mdx"), "v")).toBe(
      '[thejournal] Vault root entry "v" is missing a required image. Every vault root index (v/index.mdx or v/index.md) must declare an image in its frontmatter.',
    );
  });

  it("requires a child entry besides the index", () => {
    const only = [e("v", "v/index.mdx")];

    expect(
      requiresChildEntry([...only, e("v/a", "v/a.mdx")], "v", "Vault"),
    ).toBeNull();
    expect(requiresChildEntry(only, "v", "Vault")).toBe(
      '[thejournal] Vault "v" contains only an index entry. Add at least one child publication, or make it a standalone publication at src/thejournal/v.mdx.',
    );
    expect(requiresChildEntry(only, "v/s", "Vault section")).toContain(
      'Vault section "v/s" contains only an index entry',
    );
  });

  it("requires standalone publications to carry an image", () => {
    expect(requiresStandaloneImage(e("p", "p.mdx", "img"))).toBeNull();
    expect(requiresStandaloneImage(e("p", "p.mdx"))).toBe(
      '[thejournal] Entry "p" is missing a required image. Standalone publications must declare an image in their frontmatter.',
    );
  });

  it("throws the first failing message only", () => {
    expect(() => enforce(null, "first", "second")).toThrow(/^first$/);
    expect(() => enforce(null, null)).not.toThrow();
  });
});
