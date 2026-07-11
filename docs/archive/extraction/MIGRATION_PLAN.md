# albertoduran → bloomwright-* migration plan

> Supersedes the target-shape sections of [`EXTRACTION_STRATEGY.md`](./EXTRACTION_STRATEGY.md),
> [`PROJECT_UI_KIT.md`](./PROJECT_UI_KIT.md), and
> [`PROJECT_MDX_INTEGRATIONS.md`](./PROJECT_MDX_INTEGRATIONS.md). Those docs describe an
> earlier **three-integration / `@albertoduran/*`** design. The packages that actually
> shipped are **two GitHub packages with a different split** (below). Where they conflict,
> **this document wins**.

## 0. What actually shipped (the architecture delta)

| Old extraction docs | Shipped reality |
|---|---|
| One package `@albertoduran/astro-mdx` with **3 integrations** (`daisyuiIntegration`, `echartsIntegration`, `mermaidIntegration`) | **Two packages**, **two integrations** |
| UI kit = `@albertoduran/ui` (npm) | `bloomwright-ui` (`github:duranalberto/bloomwright-ui`) — render core **+** UI components + logic + CSS |
| MDX integrations own the render pipeline | `bloomwright-mdx` (`github:duranalberto/bloomwright-mdx`) is **fence extraction only** — it is *unaware of who renders the SVG* |
| `mermaidIntegration` renders Mermaid | **`mermaidRenderer()`** (from `bloomwright-ui/mermaid-renderer`) owns Mermaid SVG creation end-to-end |
| Built-in Cloudflare/ink renderers | Mermaid render pipeline is **caller-owned** (`render: MermaidRenderPipeline`); the package ships only fixtures |
| Built-in disk cache | Cache is **caller-owned** (`cache: CacheStoreFactory`); package default is a disk adapter |

**Target `astro.config.mjs` end-state** (two integrations, `bloomwrightMdx()` before `mdx()`):

```js
import { bloomwrightMdx } from "bloomwright-mdx";
import { createCodeBlockPlugin, createHeadingAnchorPlugin } from "bloomwright-mdx";
import { mermaidRenderer } from "bloomwright-ui/mermaid-renderer";
// palettes: package presets OR keep local (see Decision D2)
import { LIGHT_PALETTE, DARK_PALETTE } from "bloomwright-ui/mermaid";
import { customHtmlMinifier } from "./src/integrations/html-minifier/plugin.ts"; // stays
import { createMermaidRenderPipeline } from "./src/mermaid/render-pipeline.ts";   // caller-owned
import { cacheStoreFactory } from "./src/mermaid/cache-store.ts";                 // caller-owned
import {
  collectPublishableEChartDocuments,
  collectPublishableMermaidDocuments,
} from "./src/content/processors/publishable.ts"; // the current selection logic, re-exported

integrations: [
  bloomwrightMdx({
    selectSources: collectPublishableEChartDocuments, // echart fence gating
  }),
  mermaidRenderer({
    render: process.env.MERMAID_RENDERER_FIXTURE ? undefined : createMermaidRenderPipeline({ /* env */ }),
    cache: cacheStoreFactory,
    themes: new Map([["light", LIGHT_PALETTE], ["dark", DARK_PALETTE]]),
    selectSources: collectPublishableMermaidDocuments, // mermaid gating
    cacheVersion: "ad-1", // see Decision D3
  }),
  mdx(),                 // MUST stay after bloomwrightMdx()
  customHtmlMinifier(),  // app-specific, stays
],
markdown: {
  processor: satteri({
    features: { directive: true, math: { singleDollarTextMath: false }, headingAttributes: true },
    hastPlugins: [createCodeBlockPlugin(), createHeadingAnchorPlugin()], // now from bloomwright-mdx
  }),
  // shikiConfig unchanged
},
```

---

## 1. Inventory — Replace / Keep / Verify

### 1a. DELETE (fully replaced by the packages)

| Local path (delete after cutover) | Replaced by |
|---|---|
| `src/integrations/daisyui/**` (9 files) | `bloomwrightMdx()` daisyui fence + `bloomwright-ui/components/display/*` + `bloomwright-ui/logic/*` |
| `src/integrations/echarts/**` (24 files) | `bloomwright-ui/echarts` (SSR core, client) + `bloomwrightMdx()` echart fence |
| `src/integrations/mermaid/**` — **except** `renderers.ts`, `theme.ts`, `palette.ts`, `constants.ts` (see Keep) | `bloomwright-ui/mermaid` + `mermaidRenderer()` |
| `src/integrations/satteri-code-blocks.ts` | `createCodeBlockPlugin` (bloomwright-mdx) |
| `src/integrations/satteri-heading-anchors.ts` | `createHeadingAnchorPlugin` (bloomwright-mdx) |
| `src/integrations/index.ts` | rewritten to export only `customHtmlMinifier` (or delete + import directly) |
| `src/components/ui/display/{Callout,ChatBubble,List,MockupBrowser,MockupPhone,MockupWindow,SectionHeader,Steps}.astro` + `callout.ts,chat.ts,list.ts,steps.ts` | `bloomwright-ui/components/display/*` |
| `src/components/ui/mdx/{CodeBlock,EChart,HeadingAnchor,MermaidDiagram,MermaidDiagramWrapper,ProseTable,VideoPlayer}.astro` | `bloomwright-ui/components/{prose,render}/*` |
| `src/components/ui/primitive/{Button,GlassPanel,OverlayPanel,SVGIcon}.astro` | `bloomwright-ui/components/primitive/*` **(pending D1 parity check)** |
| `src/runtime/elements/{echart-shell,mermaid-diagram-shell}.ts` | `bloomwright-ui/runtime/*` |

### 1b. KEEP (app-specific — not in either package; these are the real gaps)

| Local path | Why it stays |
|---|---|
| `src/integrations/html-minifier/**` (`customHtmlMinifier`) | Not in the packages — app build step |
| `src/content/processors/thejournal-manifest.ts`, `thejournal.ts` | The journal selection logic; becomes the two `selectSources` callbacks |
| `src/integrations/mermaid/renderers.ts` (+ `theme.ts`) | Becomes the **caller-owned render pipeline** → move to `src/mermaid/render-pipeline.ts` (adapt to `MermaidRenderPipeline`) |
| Cache backend (AstroDiskBus / `.astro/*-manifest`) | Becomes the **caller-owned `CacheStoreFactory`** → `src/mermaid/cache-store.ts` |
| `src/integrations/mermaid/palette.ts` | Themes source (see D2 — keep local or switch to package presets) |
| `src/integrations/mermaid/constants.ts` `RENDERER_VERSION` | Cache-version salt (see D3) |
| `.env` + `MERMAID_RENDERER_URL/_API_KEY/_DISABLE_WORKER/_FIXTURE` | External worker contract — consumed by the caller pipeline |
| `src/components/ui/primitive/{AlbertoDuran,SocialTire}.astro`, `navigation/ThemeToggle.astro`, `display/StripBackground.astro` | App-only components |
| `src/runtime/elements/{atlas-schedule,on-this-page,overlay-panel,video-player-shell}.ts`, `managers/theme_manager.ts` | App-only runtime |

### 1c. VERIFY before replacing (parity gates)

- **D1 — primitive parity.** `Button/GlassPanel/OverlayPanel/SVGIcon` exist in both. Confirm props/classnames/`Icon` type match before swapping (the package `SVGIcon`/`Callout` expect an `Icon` shape; albertoduran feeds `@data/icons`/`@appTypes/icon`). Mismatch → adapt call sites or keep local.
- **D2 — palette parity.** Diff `src/integrations/mermaid/palette.ts` vs `bloomwright-ui/mermaid` `LIGHT_PALETTE`/`DARK_PALETTE`. Identical → use package presets; diverged → pass the local palette objects into `mermaidRenderer({ themes })`.
- **D3 — render parity + cache version.** The package's Mermaid core was *moved from* albertoduran, but its `RENDERER_VERSION` may differ from local `v4.9`, and any transform/theme drift changes SVG bytes. Treat **visual parity of rendered SVGs as the top-risk gate** (M2/M6). Set `cacheVersion` explicitly and expect a one-time cold cache rebuild.
- **D4 — render CSS ownership.** `bloomwright-ui/styles.css` ships `_echart.css` + `_mermaid-diagram.css` (ported from here). Decide: import the package partials, or keep `src/styles/thejournal/article/_diagram.css` as source of truth. Avoid shipping both (double rules).

---

## 2. Rewire points (import repointing)

| Consumer | Change |
|---|---|
| `astro.config.mjs` | 3 local integrations → `bloomwrightMdx()` + `mermaidRenderer()`; hastPlugins → bloomwright-mdx; keep `customHtmlMinifier()` |
| `src/pages/thejournal/[...slug].astro` | `@components/ui/mdx/{CodeBlock,HeadingAnchor,ProseTable,MermaidDiagramWrapper}` → `bloomwright-ui/components/{prose,render}/*`. The component map (`pre`,`h2`,`h3`,`table`,`div:MermaidDiagramWrapper`,`MermaidDiagramWrapper`) is **unchanged** |
| `src/pages/projects/*.astro` ×7 (mlscraper, equilyze, albertoduran, pressroom, equity-valuation-engine, sin-pluma) | `import MermaidDiagram`/`EChart` → `bloomwright-ui/components/render/*`; `import { defineMermaidDiagram } from "@integrations/mermaid/definition"` → `bloomwright-ui/mermaid` |
| `src/pages/fixtures/[fixture].astro` | `import EChart` → `bloomwright-ui/components/render/EChart.astro` |
| Every `.astro` importing `@components/ui/display\|primitive` or `@runtime/elements/{echart,mermaid}-shell` | repoint to `bloomwright-ui/*` |
| `src/styles/thejournal/article/_diagram.css`, `_layout.css` | reconcile with package render CSS (D4) |

**Prunable deps after cutover** (verified used *only* by `src/integrations/**`, or by soon-deleted local components): `hast-util-select`, `hast-util-to-html`, `unist-util-visit`, `fast-glob`, and `hast-util-from-html` (last local use is the replaced `MermaidDiagramWrapper.astro`). **`echarts` stays** (peer dep of both packages, resolved in the consumer).

---

## 3. Phased plan (each phase has a pass/fail oracle)

> Run everything with the fixture renderer first (`MERMAID_RENDERER_FIXTURE=true`, already wired into `npm run build:test`) so phases are deterministic and offline. Do the real-worker build only at M2's end and M6.

### M0 — Baseline & golden snapshot *(no changes)* — ✅ DONE, see [`BASELINE.txt`](./BASELINE.txt)
Establish the regression oracle from the **current** tree.
- Run: `npm run test && npm run check && npm run build:test && npm run check:bundle && npm run test:e2e`.
- Record from `dist/`: count of `_app/mermaid/*.svg`, `_app/charts/*.svg`, and per-page counts of `.mermaid-diagram-container`, `.echart-surface`, and `mermaid-error`.
- **RESULT (not pristine — this is the oracle):** check **green** (0 err/0 warn); build **green** (86 pages); check:bundle **green** (report-only raster warning). **Pre-existing red:** unit 144/148 (4 fail), e2e 32/40 (8 fail) — two clusters: stale "four projects" assertions (6 projects now) and the component-path Mermaid failures. Golden: **162** mermaid svg, **2** chart svg, **149** containers/57 pages, **53** echart-surface/8 pages, **9** `mermaid-error` on 6 project pages. The migration oracle is **parity with these**, incl. *no NEW* failures — **not** zero errors.

### M1 — Add package deps *(no wiring)*
- Add `bloomwright-ui` + `bloomwright-mdx` (`github:duranalberto/*`) to `devDependencies`; `npm install`.
- **PASS:** `npm ls bloomwright-ui bloomwright-mdx` resolves to pinned SHAs; `npm run build:test` still green (packages present, unused). *No `vite.ssr.noExternal` needed — verified in the example app; the packages ship raw `.ts` and Vite consumes them directly.*

### M2 — Adopt the render core (the two integrations)
1. Create `src/mermaid/render-pipeline.ts` — adapt `src/integrations/mermaid/renderers.ts` to the port `(diagrams, themes) => Promise<RenderResult>`. Template: `bloomwright-mdx/examples/reference/mermaid-cloudflare-renderer.ts` (`createMermaidRenderPipeline({ url, apiKey })`). Keep the Worker → ink → placeholder chain + env contract.
2. Create `src/mermaid/cache-store.ts` — a `CacheStoreFactory` backed by the existing AstroDiskBus (`bloomwright-ui/cache` exposes `DiagramCacheStore<T>`, `createDiskCacheStore`, namespaces).
3. Re-export the selection callbacks from `src/content/processors/publishable.ts` (thin barrel over `collectPublishableEChartDocuments` / `collectPublishableMermaidDocuments`).
4. Resolve **D2** (palette) and **D3** (cacheVersion) now.
5. Swap `astro.config.mjs` to the target wiring (§0). Leave the direct-authoring component imports (§2) still pointing at local files for this phase.
- **PASS (fixture):** `npm run build:test` → `_app/mermaid/*.svg` (162) and `_app/charts/*.svg` (2) counts **== M0 golden**; **no NEW** `mermaid-error` beyond the baseline 9 on the same 6 project pages (a *reduction* toward 0 is a welcome improvement — see BASELINE §4 — but is not required).
- **PASS (real):** one `npm run build` with `MERMAID_RENDERER_URL/_API_KEY` set → diagrams render; **spot visual-diff 2–3 pages against a pre-migration screenshot (D3 gate)**.

### M3 — Repoint direct-authoring + component-map imports → bloomwright-ui
- slug page, 7 project pages, fixtures page (§2). `defineMermaidDiagram` now from `bloomwright-ui/mermaid`; `MermaidDiagram`/`EChart`/`MermaidDiagramWrapper` from `bloomwright-ui/components/render/*`; `CodeBlock`/`HeadingAnchor`/`ProseTable`/`VideoPlayer` from `bloomwright-ui/components/prose/*`.
- If a custom cache is used, pass the **same** manifest store to `<MermaidDiagram store={…}>` (per the component's `store` prop) so prerender resolves the bridge.
- **PASS:** `npm run check` = 0 errors; `npm run build:test` counts **== M0**; grep shows no remaining `@components/ui/mdx/{EChart,Mermaid*}` or `@integrations/mermaid/definition` imports.

### M4 — Swap UI components (display + primitive)
- Resolve **D1** parity. Repoint every `@components/ui/display/*` and (if parity holds) `@components/ui/primitive/{Button,GlassPanel,OverlayPanel,SVGIcon}` import to `bloomwright-ui/components/*`. Keep app-only primitives (D1 list in §1b).
- **PASS:** `npm run check` = 0; `npm run test:e2e` (Playwright visual/a11y) green vs M0; `npm run check:bundle` within budget.

### M5 — Delete vendored code + prune deps
- Delete everything in §1a. Rewrite `src/integrations/index.ts` to only surface `customHtmlMinifier` (or inline the import).
- Remove prunable deps (§2) from `package.json`; `npm install`.
- **PASS:** `grep -rn "@integrations/\(daisyui\|echarts\|mermaid\)\|components/ui/mdx\|echart-shell\|mermaid-diagram-shell" src` → **only** the kept caller-pipeline/cache files; `npm run test && npm run check && npm run build:test && npm run check:bundle && npm run test:e2e` all green; counts **== M0**.

### M6 — Final validation (production build)
- Full `npm run build` with the real worker env; `npm run test:e2e` + `npm run check:bundle`; final visual-diff sweep of the journal + project pages against M0 screenshots.
- **PASS:** all green; asset/container counts == M0; bundle within budget; SVGs visually identical (D3).

---

## 4. Decisions to confirm (blocking where noted)

- **D1 (M4-blocking):** primitive component prop/`Icon`-type parity — swap vs keep local.
- **D2 (M2-blocking):** package palettes vs local `palette.ts`.
- **D3 (M2/M6-blocking):** accept a one-time cache rebuild + set `cacheVersion`; confirm SVG visual parity.
- **D4 (M5):** render-CSS ownership (package `styles.css` partials vs local `_diagram.css`).
- **D5 (non-blocking):** dependency form — keep `github:` (SSH in lockfile) or switch to `git+https://` for key-free CI; or publish to a private registry for versioned installs.

## 5. Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Mermaid SVG bytes drift post-move (D3) → visual regression + cold cache | Med | M2/M6 visual-diff gate; explicit `cacheVersion`; core was moved not rewritten |
| `Icon` type mismatch in package primitives (D1) | Med | Parity check before M4; keep local primitives if divergent |
| `selectSources` signature mismatch (`SourceDocument{filePath,content}`) vs local doc shape | Low | Adapt `collectPublishable*` return to `{filePath,content}` in the barrel |
| Custom cache store not passed to `<MermaidDiagram store>` → prerender bridge miss | Low | M3 wires `store` prop; fixture build surfaces `mermaid-error` if missed |
| Double render CSS (package + local) | Low | D4 chooses one owner |
| Pruning a still-used dep | Low | grep-verified prune list; `check`+`build` catch it |

## 6. Rollback
Each phase is a separate commit on a `migration/bloomwright` branch. Any phase failing its oracle → revert that commit; the two packages are additive until **M5** deletes local code, so M0–M4 are fully reversible by config/import revert alone.
