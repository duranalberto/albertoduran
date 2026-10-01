import {
  entryKind,
  isStandalone,
  isVaultChild,
  isVaultRoot,
} from "@content/entry_kind";
import { describe, expect, it } from "vitest";

describe("entryKind", () => {
  it.each([
    [{ id: "post", vaultId: "" }, "standalone"],
    [{ id: "post" }, "standalone"],
    [{ id: "vault", vaultId: "vault" }, "vaultRoot"],
    [{ id: "vault/section", vaultId: "vault" }, "vaultChild"],
    [{ id: "vault/section/leaf", vaultId: "vault" }, "vaultChild"],
  ] as const)("classifies %o as %s", (entry, kind) => {
    expect(entryKind(entry)).toBe(kind);
    expect(isStandalone(entry)).toBe(kind === "standalone");
    expect(isVaultRoot(entry)).toBe(kind === "vaultRoot");
    expect(isVaultChild(entry)).toBe(kind === "vaultChild");
  });
});
