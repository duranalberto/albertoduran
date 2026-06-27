import { spawnSync } from "node:child_process";
import path from "node:path";

const source = path.resolve(
  "src/assets/fonts/FiraCodeNerdFontMono-Regular.woff2",
);
const output = path.resolve(
  "src/assets/fonts/FiraCodeNerdFontMono-Regular-subset.woff2",
);

const unicodeRanges = [
  "U+0000-00FF", // ASCII and Latin-1 punctuation used in code samples.
  "U+2000-206F", // General punctuation.
  "U+2070-209F", // Superscripts/subscripts.
  "U+2190-21FF", // Arrows.
  "U+2300-23FF", // Technical symbols.
  "U+2500-257F", // Box drawing.
  "U+25A0-25FF", // Geometric shapes.
  "U+2600-26FF", // Misc symbols.
  "U+E0A0-E0A3", // Powerline symbols.
  "U+E0B0-E0C8",
  "U+E0CA",
  "U+E0CC-E0D7",
];

const args = [
  source,
  `--output-file=${output}`,
  "--flavor=woff2",
  `--unicodes=${unicodeRanges.join(",")}`,
  "--layout-features=*",
  "--glyph-names",
  "--symbol-cmap",
  "--legacy-cmap",
  "--notdef-glyph",
  "--notdef-outline",
  "--recommended-glyphs",
  "--name-IDs=*",
  "--name-legacy",
  "--name-languages=*",
];

const result = spawnSync("pyftsubset", args, { stdio: "inherit" });

if (result.error?.code === "ENOENT") {
  throw new Error(
    [
      "pyftsubset was not found.",
      "Install FontTools with WOFF2 support, then rerun `npm run font:subset`:",
      "  python3 -m pip install 'fonttools[woff]'",
    ].join("\n"),
  );
}

if (result.status !== 0) {
  throw new Error(`pyftsubset failed with exit code ${result.status}.`);
}
