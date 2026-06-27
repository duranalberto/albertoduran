import { randomUUID, createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { AstroDiskBus } from "@lib/astro-disk-bus";
import { DARK_PALETTE, LIGHT_PALETTE } from "@integrations/mermaid/palette";
import { createPipeline } from "@integrations/mermaid/pipeline";
import type { MermaidPalette } from "@integrations/mermaid/types";
import type { Element } from "hast";

function diagramId(code: string): string {
  return createHash("sha256").update(code).digest("hex").slice(0, 8);
}

describe("DiagramPipeline prepared registry", () => {
  it("prepares diagrams for synchronous lookup and emits SVG assets", async () => {
    const previousFixtureMode = process.env.MERMAID_RENDERER_FIXTURE;
    process.env.MERMAID_RENDERER_FIXTURE = "true";

    const outDir = await mkdtemp(path.join(tmpdir(), "mermaid-assets-"));

    try {
      const themes = new Map<string, MermaidPalette>([
        ["light", LIGHT_PALETTE],
        ["dark", DARK_PALETTE],
      ]);
      const bus = new AstroDiskBus<Element>({
        subDir: `mermaid-test-${randomUUID()}`,
        version: "test",
      });
      await bus.ensureDir();

      const pipeline = createPipeline(bus, themes, "test", undefined);
      const code = "graph TD\n  Registry --> Assets";
      const stableId = diagramId(code);

      await pipeline.prepareDiagrams(new Map([[stableId, code]]));

      const diagram = pipeline.getDiagram(stableId);
      expect(diagram).not.toBeNull();
      expect(diagram?.stableId).toBe(stableId);
      expect(diagram?.assetHref).toMatch(
        new RegExp(`/_app/mermaid/${stableId}-.*\\.svg$`),
      );
      expect(diagram?.assetHrefDark).toMatch(
        new RegExp(`/_app/mermaid/${stableId}-.*-dark\\.svg$`),
      );
      expect(diagram?.node.tagName).toBe("svg");

      await pipeline.emitAssets(pathToFileURL(`${outDir}/`));

      const emittedFiles = await readdir(path.join(outDir, "_app", "mermaid"));
      const lightFile = path.basename(diagram!.assetHref);
      const darkFile = path.basename(diagram!.assetHrefDark);
      expect(emittedFiles).toContain(lightFile);
      expect(emittedFiles).toContain(darkFile);

      const darkSvg = await readFile(
        path.join(outDir, "_app", "mermaid", darkFile),
        "utf-8",
      );
      expect(darkSvg).toContain("data-mermaid-standalone-background");
    } finally {
      if (previousFixtureMode === undefined) {
        delete process.env.MERMAID_RENDERER_FIXTURE;
      } else {
        process.env.MERMAID_RENDERER_FIXTURE = previousFixtureMode;
      }
      await rm(outDir, { recursive: true, force: true });
    }
  });
});
