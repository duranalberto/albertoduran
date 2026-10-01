import glob from "fast-glob";
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

function readAll(patterns: string[], options: { cwd?: string } = {}): string {
  const cwd = options.cwd ?? root;
  return glob
    .sync(patterns, { cwd, absolute: true, dot: false })
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}

function containsToken(corpus: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`).test(corpus);
}

/**
 * The Atlas section is parked, not dead: it will be reactivated later, so the
 * refactor phases must leave it intact. These checks fail if it is removed.
 */
describe("Atlas preservation", () => {
  const atlasFiles = [
    "src/components/index/AtlasStats.astro",
    "src/components/index/AtlasNote.astro",
    "src/runtime/elements/atlas-schedule.ts",
    "src/utils/atlas_loader.ts",
    "src/types/atlas_data.ts",
    "src/types/espn.ts",
    "src/assets/atlas/atlas_background.jpg",
    "src/assets/atlas/atlas_logo.png",
    "src/styles/index/_atlas-note.css",
    "src/styles/layout/_parallax.css",
    "src/layouts/ParallaxHero.astro",
    "tests/unit/atlas-loader.test.ts",
  ];

  it.each(atlasFiles)("keeps %s", (file) => {
    expect(existsSync(join(root, file))).toBe(true);
  });

  it("keeps the atlasData collection registered", () => {
    const config = read("src/content.config.ts");

    expect(config).toMatch(/const atlasData = defineCollection\(/);
    expect(config).toMatch(/collections = \{[^}]*\batlasData\b/);
  });

  it("keeps the Atlas story overlay mounted on the home page", () => {
    const home = read("src/pages/index.astro");

    expect(home).toContain('const atlasNoteToggleId = "atlas-story-modal";');
    expect(home).toContain("toggleId={atlasNoteToggleId}");
    expect(home).toContain("<AtlasNote />");
  });

  it("keeps the Atlas stylesheets in the global bundle", () => {
    const globalCss = read("src/styles/global.css");

    expect(globalCss).toContain('@import "./index/_atlas-note.css";');
    expect(globalCss).toContain('@import "./layout/_parallax.css";');
  });
});

/**
 * Every class selector in the app stylesheets must be used by app source or by
 * the bloomwright packages whose markup those stylesheets target.
 */
describe("unused CSS classes", () => {
  /** Built at runtime (`project-media--${variant}`, `project-visual-${tone}`). */
  const dynamicPrefixes = ["project-media--", "project-visual-"];

  /**
   * Known dead today. Must stay empty: a class used only by an unused
   * component still counts as used here, so delete both together.
   */
  const KNOWN_DEAD: string[] = [];

  const sourceCorpus = readAll(["src/**/*.{astro,ts,mdx,md}"]);
  const packageCorpus = readAll(
    [
      "bloomwright-ui/src/**/*.{astro,ts,js,mjs,css}",
      "bloomwright-mdx/src/**/*.{astro,ts,js,mjs}",
    ],
    { cwd: join(root, "node_modules") },
  );

  function unusedClasses(): string[] {
    const dead = new Set<string>();

    for (const file of glob.sync("src/styles/**/*.css", { cwd: root })) {
      const css = read(file).replace(/\/\*[\s\S]*?\*\//g, "");

      for (const [, name] of css.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)) {
        if (
          !name ||
          dynamicPrefixes.some((prefix) => name.startsWith(prefix))
        ) {
          continue;
        }
        if (
          containsToken(sourceCorpus, name) ||
          containsToken(packageCorpus, name)
        ) {
          continue;
        }
        dead.add(name);
      }
    }

    return [...dead].sort();
  }

  it("has no class selectors beyond the known-dead list", () => {
    expect(unusedClasses()).toEqual([...KNOWN_DEAD].sort());
  });
});

/** Every non-icon asset must be referenced by file name somewhere. */
describe("unused assets", () => {
  /** Known dead today. Must stay empty: delete unreferenced assets. */
  const KNOWN_DEAD: string[] = [];

  const corpus = [
    readAll([
      "src/**/*.{astro,ts,mdx,md,css,json}",
      "scripts/**/*.{mjs,js,ts}",
    ]),
    read("astro.config.mjs"),
  ].join("\n");

  it("has no unreferenced assets beyond the known-dead list", () => {
    const unused = glob
      .sync("src/assets/**/*", { cwd: root, ignore: ["src/assets/icons/**"] })
      .filter((file) => !corpus.includes(basename(file)))
      .sort();

    expect(unused).toEqual([...KNOWN_DEAD].sort());
  });
});

/**
 * Tailwind only generates classes it can read literally in source, so a class
 * assembled at runtime (`px-${n}`) silently produces no CSS.
 */
describe("interpolated Tailwind utilities", () => {
  const utility =
    /(?<![\w-])(?:[a-z0-9]+:)*-?(?:p|m)[xytblrse]?-\$\{|(?<![\w-])(?:[a-z0-9]+:)*(?:gap|gap-[xy]|w|h|size|min-w|max-w|min-h|max-h|text|col-span|row-span|grid-cols)-\$\{/;

  it("never builds utility class names from template expressions", () => {
    const offenders = glob
      .sync("src/**/*.{astro,ts}", { cwd: root })
      .flatMap((file) =>
        read(file)
          .split("\n")
          .map((line, index) => ({ file, line: index + 1, text: line }))
          .filter(({ text }) => utility.test(text))
          .map(({ file, line, text }) => `${file}:${line}: ${text.trim()}`),
      );

    expect(offenders).toEqual([]);
  });
});

/**
 * Ratchet: app stylesheets may lose `!important`, never gain it. Lower the
 * ceiling when you remove one. (bloomwright-ui's own partials are excluded.)
 */
describe("!important in app stylesheets", () => {
  const CEILING = 26;

  it(`stays at or below ${CEILING}`, () => {
    const count = glob.sync("src/styles/**/*.css", { cwd: root }).reduce(
      (total, file) =>
        total +
        (read(file)
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .match(/!important/g)?.length ?? 0),
      0,
    );

    expect(count).toBeLessThanOrEqual(CEILING);
  });
});

/** Numbered items derive their marker from list position (src/utils/steps.ts). */
describe("project page step markers", () => {
  it("are never typed by hand", () => {
    const offenders = glob
      .sync("src/pages/projects/*.astro", { cwd: root })
      .filter((file) => /\bmarker: "\d+"/.test(read(file)));

    expect(offenders).toEqual([]);
  });
});

/** Hero image, alt text and title come from projectCatalog via defineProjectPage. */
describe("project landing pages", () => {
  const pages = glob.sync("src/pages/projects/*.astro", {
    cwd: root,
    ignore: ["src/pages/projects/index.astro"],
  });

  it.each(pages)("%s is configured through defineProjectPage", (file) => {
    const source = read(file);

    expect(source).toContain("defineProjectPage(");
    expect(source).not.toMatch(/ProjectPageConfig|\bimageAlt:/);
  });
});

/** Cards and stats render what they are given; containers query content. */
describe("presentational components", () => {
  it.each([
    "src/components/projects/ProjectStat.astro",
    "src/components/projects/ProjectCard.astro",
    "src/components/projects/ProjectsCatalog.astro",
    "src/components/shared/JournalCard.astro",
  ])("%s does not read the content store", (file) => {
    expect(read(file)).not.toMatch(/@content\/processors/);
  });
});
