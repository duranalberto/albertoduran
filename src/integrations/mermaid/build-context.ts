import { AstroDiskBus } from "../../lib/astro-disk-bus.ts";
import { DEFAULT_MERMAID_MANIFEST_SUBDIR, RENDERER_VERSION } from "./constants.ts";
import {
  getMermaidDiagramType,
  getMermaidStableId,
  normalizeMermaidDefinition,
} from "./definition.ts";
import type { RegisteredDiagram } from "./pipeline.ts";

export interface ResolvedMermaidDiagram {
  stableId: string;
  diagramType: string;
  diagram: RegisteredDiagram;
}

// Astro's static-output build reloads component chunks in a fresh module
// instance to prerender pages, so an in-memory registry populated by the
// astro:build:start hook is not visible here. The per-build manifest
// (written by DiagramPipeline.prepareDiagrams for every diagram, including
// render-failure placeholders) is the only state that survives that module
// boundary, so diagrams are resolved straight from it.
const manifestBus = new AstroDiskBus<RegisteredDiagram>({
  subDir: DEFAULT_MERMAID_MANIFEST_SUBDIR,
  version: RENDERER_VERSION,
});

export function resolvePreparedMermaidDiagram(
  code: string,
): ResolvedMermaidDiagram {
  const normalizedCode = normalizeMermaidDefinition(code);

  if (!normalizedCode) {
    throw new Error("[mermaid] MermaidDiagram received an empty diagram.");
  }

  const stableId = getMermaidStableId(normalizedCode);
  const diagram = manifestBus.getSync(stableId);

  if (!diagram) {
    throw new Error(
      `[mermaid] Diagram "${stableId}" was not prepared before Astro component rendering. ` +
        "The diagram source was not discovered during build preparation. " +
        "Use defineMermaidDiagram() with a static string or String.raw template literal.",
    );
  }

  return {
    stableId,
    diagramType: getMermaidDiagramType(normalizedCode),
    diagram,
  };
}
