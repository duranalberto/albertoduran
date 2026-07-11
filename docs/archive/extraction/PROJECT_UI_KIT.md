# Project 1 — `@albertoduran/ui` (DaisyUI + Astro UI Kit)

> **Read [`EXTRACTION_STRATEGY.md`](./EXTRACTION_STRATEGY.md) first.** This document is the
> build sheet for the **UI Kit** — the presentation-only leaf package consumed by _both_
> `albertoduran` and the [MDX Integrations](./PROJECT_MDX_INTEGRATIONS.md).

## 1. Purpose & scope

A framework of **DaisyUI-styled Astro components**, their **pure domain logic**, the
**client-side web components** that progressively enhance them, the **CSS**, and the
**shared types**. It has **no build-time magic** and **no dependency** on the integrations
or on `albertoduran`. It is the visual "reference" the MDX Integrations mirror when they
render raw HTML from code fences.

**In scope**

- Display components: `Callout`, `ChatBubble`, `List`, `Steps`, `MockupBrowser`,
  `MockupPhone`, `MockupWindow`, `SectionHeader`.
- Primitives: `SVGIcon`, `Button`, `GlassPanel`, `OverlayPanel`.
- Generic prose/MDX surfaces (no build coupling): `CodeBlock`, `ProseTable`,
  `HeadingAnchor`, `VideoPlayer`.
- Pure domain logic (resolvers/validators): callout, chat, list, steps, section-header.
- Client web components: `overlay-panel`, `video-player-shell`.
- Shared types: `Icon`, `RibbonIcon`, `ButtonVariant`, `ButtonSize`.
- Styles: component CSS + a DaisyUI include preset.

**Out of scope (stays in `albertoduran`)**

- Brand/content components: `AlbertoDuran` (logo), `SocialTire` (social links),
  `StripBackground` (skills ribbon).
- Icon _data_ (`@data/icons`) and `@utils/ribbon` — injected as props by consumers.
- The ECharts/Mermaid render components and their web components — those ship with the
  MDX Integrations because they consume build output.

## 2. Package identity

```jsonc
{
  "name": "@albertoduran/ui",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",                    // types + logic barrel
    "./components/*": "./src/components/*",    // .astro components (source-shipped)
    "./logic/*": "./src/logic/*.ts",
    "./runtime/*": "./src/runtime/*.ts",
    "./styles.css": "./src/styles/index.css",
    "./daisyui-preset": "./src/styles/daisyui-preset.css"
  },
  "peerDependencies": {
    "astro": "^7.0.0",
    "tailwindcss": "^4.3.0",
    "daisyui": "^5.5.0"
  },
  "devDependencies": {
    "vitest": "^4.1.0",
    "typescript": "^6.0.0"
  }
}
```

- **Source-shipped, not bundled.** Astro `.astro` components cannot be pre-bundled into a
  single JS file; ship the `src/` and let the consumer's Astro/Vite compile them. This is
  the standard pattern for Astro component libraries. Keep `.astro` and `.ts` as-is.
- `astro`, `tailwindcss`, `daisyui` are **peers** — the consumer owns the single copy.
- No runtime dependencies beyond peers. This package stays a pure leaf.

## 3. Proposed directory layout

```
@albertoduran/ui
├─ package.json
├─ tsconfig.json
├─ README.md
├─ src/
│  ├─ index.ts                      # barrel: re-exports logic + types
│  ├─ types/
│  │  ├─ icon.ts                    # Icon, RibbonIcon           (from src/types/icon.ts)
│  │  └─ button.ts                  # ButtonVariant, ButtonSize  (from src/types/button.ts)
│  ├─ logic/                        # PURE, framework-free resolvers (source of truth)
│  │  ├─ callout.ts                 # resolveCallout, CALLOUT_VARIANTS, CalloutPalette …
│  │  ├─ chat.ts                    # chatBubbleColorClass …
│  │  ├─ list.ts                    # resolveListItems …
│  │  ├─ steps.ts                   # resolveStepItems …
│  │  └─ section-header.ts          # resolveSectionHeader …
│  ├─ components/
│  │  ├─ display/
│  │  │  ├─ Callout.astro
│  │  │  ├─ ChatBubble.astro
│  │  │  ├─ List.astro
│  │  │  ├─ Steps.astro
│  │  │  ├─ MockupBrowser.astro
│  │  │  ├─ MockupPhone.astro
│  │  │  ├─ MockupWindow.astro
│  │  │  └─ SectionHeader.astro
│  │  ├─ primitive/
│  │  │  ├─ SVGIcon.astro
│  │  │  ├─ Button.astro
│  │  │  ├─ GlassPanel.astro
│  │  │  └─ OverlayPanel.astro
│  │  └─ prose/                     # generic MDX surfaces, no build coupling
│  │     ├─ CodeBlock.astro
│  │     ├─ ProseTable.astro
│  │     ├─ HeadingAnchor.astro
│  │     └─ VideoPlayer.astro
│  ├─ runtime/                      # client web components (progressive enhancement)
│  │  ├─ overlay-panel.ts
│  │  └─ video-player-shell.ts
│  └─ styles/
│     ├─ index.css                  # imports all partials below
│     ├─ daisyui-preset.css         # documents the @plugin "daisyui" include list
│     ├─ display/ (_callout, _chat, _list, _steps, _mockup-*.css …)
│     ├─ mdx/ (_code-block, _prose-table, _heading-anchor.css)
│     ├─ primitive/ (_panel.css)
│     ├─ shared/ (_daisyui-overrides.css)
│     └─ _diagram.css               # from thejournal/article/_diagram.css (shared with MDX pkg)
└─ tests/
   └─ unit/ (callout, chat, list, steps, section-header, daisyui logic tests)
```

## 4. File-by-file migration

| From `albertoduran/src` | To `@albertoduran/ui/src` | Change on move |
|--------------------------|----------------------------|-----------------|
| `types/icon.ts`, `types/button.ts` | `types/*` | none; re-export from `index.ts` |
| `integrations/daisyui/callout.ts` | `logic/callout.ts` | **becomes source of truth**; import `Icon` from `../types/icon` |
| `integrations/daisyui/chat.ts` | `logic/chat.ts` | none |
| `integrations/daisyui/list.ts` | `logic/list.ts` | none |
| `integrations/daisyui/steps.ts` | `logic/steps.ts` | none |
| `integrations/daisyui/section-header.ts` | `logic/section-header.ts` | none |
| `components/ui/display/{Callout,ChatBubble,List,Steps,MockupBrowser,MockupPhone,MockupWindow,SectionHeader}.astro` | `components/display/*` | repoint imports to `../../logic/*` and `../primitive/SVGIcon.astro` |
| `components/ui/display/*.ts` (the re-export shims) | **deleted** | superseded by `logic/*` |
| `components/ui/primitive/{SVGIcon,Button,GlassPanel,OverlayPanel}.astro` | `components/primitive/*` | repoint types to `../../types/*` |
| `components/ui/mdx/{CodeBlock,ProseTable,HeadingAnchor,VideoPlayer}.astro` | `components/prose/*` | `HeadingAnchor` becomes prop-driven (§5) |
| `runtime/elements/{overlay-panel,video-player-shell}.ts` | `runtime/*` | none (self-contained) |
| `styles/ui/**`, `styles/shared/_daisyui-overrides.css`, `styles/thejournal/article/_diagram.css` | `styles/**` | strip project-only rules; keep component rules |
| `tests/unit/{callout,chat,list,steps,daisyui-definition? }` | `tests/unit/*` | `daisyui-definition`/`markup`/`satteri` tests go to **MDX pkg**, not here |

> **Note on `_diagram.css`:** the Mermaid diagram's _visual_ styling currently lives under
> `thejournal/article/_diagram.css` and is paired with `MermaidDiagramWrapper` (which ships
> with the MDX pkg). Because the wrapper markup references `ui-panel-*` classes owned here,
> keep the diagram CSS in the UI Kit and have the MDX pkg's README tell consumers to import
> `@albertoduran/ui/styles.css`. Alternatively, move `_diagram.css` to the MDX pkg and let it
> depend on the UI Kit's `_panel.css`. Pick one; the table above assumes it stays in the UI Kit.

## 5. Decoupling refactors specific to this package

1. **Own the resolvers.** `logic/*.ts` are now the source of truth. Delete the
   `components/ui/display/*.ts` re-export shims. The MDX Integrations will import
   `resolveCallout` etc. from `@albertoduran/ui/logic/callout`.
2. **Own `Icon`.** `Callout.astro`, `SVGIcon.astro`, `Button.astro`, and `logic/callout.ts`
   import `Icon` from `../types/icon` (local). External consumers import it from the barrel:
   `import type { Icon } from "@albertoduran/ui"`.
3. **Prop-drive icons.** `HeadingAnchor.astro` must not import `@data/icons`. Give it an
   optional `icon?: Icon` prop with an inline default anchor glyph. `ThemeToggle` is
   **not** part of this package (it is brand-wired) — if you want a reusable toggle, add a
   generic `ThemeToggle.astro` here that takes its two icons as props.
4. **No `@data/*`, `@utils/*`, `@content/*`, `@integrations/*` imports may remain.** After
   the move, `grep -r "@data\|@utils\|@content\|@integrations\|@appTypes" src` in the UI Kit
   must return nothing. This is the package's "leaf" invariant and a good CI check.

## 6. Public API (what consumers import)

```ts
// Types + logic (tree-shakeable)
import type { Icon, CalloutVariant, ButtonVariant } from "@albertoduran/ui";
import { resolveCallout, resolveStepItems } from "@albertoduran/ui";

// Components (Astro)
import Callout from "@albertoduran/ui/components/display/Callout.astro";
import Button from "@albertoduran/ui/components/primitive/Button.astro";
import CodeBlock from "@albertoduran/ui/components/prose/CodeBlock.astro";

// Client enhancement (in a <script>)
import "@albertoduran/ui/runtime/overlay-panel";

// Styles (once, in the root layout)
import "@albertoduran/ui/styles.css";
```

`albertoduran` uses the components in `.astro`/`.mdx`. The MDX Integrations import the
**logic** (`resolveCallout`, …) so their fenced HTML matches these components byte-for-byte.

## 7. Styling contract

- `styles/index.css` `@import`s every partial. It assumes the consumer has already loaded
  Tailwind and DaisyUI and defined theme tokens (`--color-base-100`, `btn-primary`, …).
- Components are written against **DaisyUI semantic classes**, so they adopt the consumer's
  theme automatically. The UI Kit does **not** ship brand colors.
- `styles/daisyui-preset.css` documents the DaisyUI parts the components rely on
  (`button, card, badge, mockup, steps, chat, list, modal, join, alert, link, table, input`).
  Consumers copy this into their own `@plugin "daisyui" { include: … }`.
- Because Tailwind v4 scans source for class names, the README must instruct consumers to
  register the package as a source, e.g.
  `@source "../node_modules/@albertoduran/ui/src";` in their CSS entry.

## 8. Build & tooling

- **No bundling of components.** `tsc --noEmit` for type-checking `.ts`; `astro check`
  (run from a tiny internal example app) for `.astro`. Optionally build `logic/` + `types/`
  to `dist/` with `tsup` for consumers who prefer compiled JS, but source-shipping is fine.
- **Vitest** for the pure logic tests (they already exist and are framework-free).
- **`exports` map** gates the public surface; keep internals unexported.
- Add a CI check asserting the leaf invariant (§5.4) and running the unit tests.

## 9. Testing

Move these already-passing, framework-free suites and keep them green in isolation:
`callout.test.ts`, `chat.test.ts`, `list.test.ts`, `steps.test.ts` (+ a new
`section-header.test.ts` if not present). They exercise `logic/*` directly, so they need no
Astro runtime. A tiny `examples/` Astro app (dev-only, not published) is the smoke test for
the `.astro` components and CSS.

## 10. Definition of done

- `grep` for `@data|@utils|@content|@integrations|@appTypes` in `src/` returns nothing.
- `vitest run` green; `astro check` green in the internal example app.
- A blank Astro app can `import Callout`, load `@albertoduran/ui/styles.css`, add the
  DaisyUI include preset + a theme, and render every display component correctly.
- The barrel exports `Icon` and every resolver the MDX Integrations need (verified by
  Project 2 compiling against it).
