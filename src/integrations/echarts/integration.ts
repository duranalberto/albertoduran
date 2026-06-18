import type { AstroIntegration } from "astro";
import {
  emitEChartArtifacts,
  resetEChartArtifacts,
  setEChartArtifactBuildMode,
} from "./artifacts.ts";

export function echartsIntegration(): AstroIntegration {
  return {
    name: "astro-echarts",
    hooks: {
      "astro:build:start": () => {
        resetEChartArtifacts();
        setEChartArtifactBuildMode(true);
      },
      "astro:build:done": async ({ dir, logger }) => {
        await emitEChartArtifacts(dir, logger);
        setEChartArtifactBuildMode(false);
        resetEChartArtifacts();
      },
    },
  };
}
