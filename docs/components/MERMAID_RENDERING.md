# Mermaid Rendering Release Notes

The site uses a custom build-time Mermaid pipeline. Diagrams are rendered to
inline SVG for article pages and to standalone light/dark SVG assets under
`/_app/mermaid/` for the "Open diagram" links.

Project-local Mermaid AI skills are documented in `docs/ai/AI_SKILLS.md`. Review
that file when using or updating assistant skills for diagram creation,
rendering, or design-document generation.

## Production Incident: June 8, 2026

After a CSS cleanup release, Mermaid diagrams on production rendered with
broken styling. The first reported page was:

- `/thejournal/ai_ops_agent/`
- `/_app/mermaid/81e521b3-90cd67863b26c5d2fcb6cdc8003a1d148eea1917278baf398a89226fe88aae9f-dark.svg`

Two things combined to create the failure:

1. Mermaid page CSS was hoisted out of each inline SVG and minified with CSSO
   using `restructure: true`.
2. Standalone Mermaid SVG asset URLs were immutable and keyed by
   `RENDERER_VERSION` plus the diagram source, but the renderer version had not
   been bumped for the style-output change.

CSSO restructuring is unsafe for Mermaid page CSS. Mermaid emits repeated,
ID-scoped rule pairs such as:

```css
#mermaid-a { fill: #111; }
[data-theme="dark"] #mermaid-a { fill: #fff; }
#mermaid-b { fill: #fff; }
```

With restructuring enabled, CSSO can legally rewrite that into grouped selectors
such as:

```css
#mermaid-b,
[data-theme="dark"] #mermaid-a {
  fill: #fff;
}
```

That is valid CSS, but it makes Mermaid styling fragile because page diagrams,
theme switching, and expanded popover clones all depend on stable per-diagram
cascade order. The browser may still compute some colors correctly, while labels,
edges, popover clones, or standalone links drift out of sync.

The stale asset key made the bug more visible in production. Cloudflare served
the old dark SVG from an immutable cached URL, so deploying fixed SVG generation
logic without changing the URL would not reliably update existing assets.

## Current Guardrails

- `src/integrations/mermaid/page-css.ts` minifies hoisted Mermaid CSS with
  `restructure: false`.
- `tests/unit/mermaid-page-css.test.ts` verifies that hoisted page CSS does not
  group selectors across different diagrams and theme guards.
- `src/integrations/mermaid/constants.ts` owns `RENDERER_VERSION`. Bump it
  whenever a code change can alter emitted Mermaid SVG or Mermaid CSS bytes for
  the same diagram source.
- `tests/e2e/site.spec.ts` checks inline SVG rendering, expanded popover cloning,
  clone ID rewriting, and theme-specific open-link URLs.

## Release Checklist

For any change touching these files, treat it as a Mermaid rendering release:

- `src/integrations/mermaid/**`
- `src/runtime/elements/mermaid-diagram-shell.ts`
- `src/styles/**/_diagram.css`
- Mermaid theme palette or DaisyUI theme tokens used by Mermaid
- Cloudflare Worker Mermaid renderer behavior or Mermaid package/version

Before merging:

1. If emitted SVG, inline SVG CSS, standalone SVG CSS, ID rewriting, theme
   merging, background injection, or foreignObject handling changes, bump
   `RENDERER_VERSION`.
2. Keep CSSO restructuring disabled for Mermaid page CSS unless a regression test
   proves selector grouping cannot cross diagram IDs or theme guards.
3. Run:

```bash
npm run check
npm test
npm run build:test
npm run test:e2e
```

4. Inspect the built article HTML for a known diagram:

```bash
rg "data-mermaid-page-css|/_app/mermaid/81e521b3-" dist/thejournal/ai_ops_agent/index.html
```

5. Confirm the old asset hash is gone after a renderer-version bump.
6. In browser preview or production, verify:
   - inline diagram has nonzero dimensions;
   - light and dark computed SVG colors differ as expected;
   - "Open diagram" switches between `.svg` and `-dark.svg`;
   - expanded popover renders the cloned diagram with styles intact.

## Production Validation Pattern

After deployment, validate both the page and the standalone asset:

```bash
curl -sSL https://albertoduran.com/thejournal/ai_ops_agent/ -o /tmp/ai_ops_agent.html
rg "/_app/mermaid/81e521b3-|data-mermaid-page-css" /tmp/ai_ops_agent.html

curl -sSL -D /tmp/mermaid.headers \
  https://albertoduran.com/_app/mermaid/<current-dark-asset>.svg \
  -o /tmp/mermaid-dark.svg
rg "mermaid-standalone-theme|#mermaid-81e521b3|data-theme" /tmp/mermaid-dark.svg
```

Expected signals:

- The article references the new Mermaid asset hash.
- The old broken hash is absent.
- The new standalone SVG is a `200` response.
- First request for a newly versioned asset may be `cf-cache-status: MISS`.
- The SVG includes standalone background CSS and unguarded dark rules for the
  dark asset.
