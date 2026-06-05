/// <reference types="vitest" />

import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,astro}"],
      exclude: [
        "src/**/*.d.ts",
        "src/types/**",
        "src/**/*.astro",
        "src/content.config.ts",
      ],
    },
  },
});
