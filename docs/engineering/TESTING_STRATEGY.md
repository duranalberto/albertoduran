# Testing Strategy

This project is static-first, content-heavy, and uses a small amount of browser JavaScript for progressive enhancement. The test suite focuses on the parts most likely to break production behavior: build-time content processing, the injected Mermaid render pipeline and content selection (the render engine's own internals are tested in `bloomwright-ui`), external Atlas data loading, generated routes, theme persistence, and journal navigation.

## Testing Pyramid

| Layer                | Tool                    | Purpose                                                                                                 |
| :------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------ |
| Static diagnostics   | `npm run check`         | Astro and TypeScript diagnostics for `.astro`, content, and TS files.                                   |
| Unit and integration | `npm test`              | Pure logic and mocked integration tests with Vitest.                                                    |
| Production E2E       | `npm run test:e2e`      | Builds deterministic production output, serves `dist`, then validates browser behavior with Playwright. |
| Coverage             | `npm run test:coverage` | Vitest coverage report for TypeScript logic.                                                            |

`npm run lint` runs in CI as a required gate. The flat `eslint.config.mjs` config is in place, so lint is mandatory alongside `check`, `test`, and `test:e2e`.

## Commands

Run these from the repository root:

```bash
npm run check
npm test
npm run test:coverage
npm run test:e2e
```

For faster local iteration:

```bash
npm run test:watch
npm run build:test
npm run preview
```

`build:test` sets deterministic fixture flags:

- `ALBERTODURAN_TEST_MODE=true` makes the Atlas content loader use local data instead of ESPN.
- `MERMAID_RENDERER_FIXTURE=true` makes Mermaid use local SVG fixtures instead of remote renderers.

## Required Tests by Change Type

Run the smallest meaningful set of checks for the change. Do not run every test
suite just because tests exist. Full `npm test` plus `npm run test:e2e` is for
shared logic, routing, runtime behavior, layout changes, or release confidence,
not for every documentation or journal-content edit.

| Change type                                    | Required coverage                                                                                                                                                                                    |
| :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation-only changes                     | No automated tests required unless the docs include generated examples or command output that should be validated.                                                                                    |
| Journal content-only changes under `src/thejournal/` | Content validation with `npm run check` or a focused build/route check when frontmatter, images, Mermaid, vault shape, or generated paths are affected. Avoid the full unit and E2E suites by default. |
| Content manifest, journal routing, vault logic | Vitest tests for manifest shape, required images, draft filtering, sorting, child inheritance, and previous/next links.                                                                              |
| Mermaid rendering or SVG handling              | Vitest tests for HAST utilities, prepared registry lookup, asset emission, and theme transforms; Playwright check for rendered diagram shell behavior. Follow `docs/components/MERMAID_RENDERING.md` for release cache/version checks. |
| Runtime browser behavior                       | Playwright tests against production preview.                                                                                                                                                         |
| External data loaders                          | Vitest tests with mocked `fetch`; no live network dependency in tests.                                                                                                                               |
| Layout, navigation, or route changes           | Playwright smoke coverage for affected routes and semantic navigation assertions.                                                                                                                    |
| New Preact/Astro islands                       | Unit tests for pure logic plus Playwright coverage for user-visible interaction.                                                                                                                     |

## Critical Test Matrix

Vitest currently covers:

- Navigation path normalization and journal publication detection.
- Ribbon SVG dimensions, ID scoping, and reference rewriting.
- Atlas loader normal schedule data, zero-record standings fallback, missing match behavior, failed fetch handling, and deterministic test mode.
- The app-owned Mermaid seams: the injected `render-pipeline.ts` provider chain (Worker → mermaid.ink → placeholder) and the `publishable.ts` content selection. The HAST sanitation, registry lookup, asset emission, ID/reference rewriting, foreignObject cleanup, and theme merging now live in `bloomwright-ui`'s own suite.
- Journal manifest build rules: standalone/vault image requirements, draft standalone and draft index subtree filtering, nested vault grouping, child image inheritance, sorted traversal, previous/next links, read time, and path context lookup.
- HTML minification while preserving `<pre>`, `<code>`, and `<kbd>` fragments.

Playwright currently covers:

- Smoke routes: `/`, `/profile/`, `/thejournal/`, one standalone article, one vault root, and one nested vault article.
- Journal catalog links to generated article routes.
- Article headings, On This Page navigation, vault context, and pagination.
- Theme toggle persistence across Astro navigation.
- Mermaid diagram shell static SVG image rendering, asset-backed popovers, no-JS visibility, and theme-specific asset links.
- Basic semantic checks for title, main/header/footer landmarks, active navigation, and browser console errors.

## CI

`.github/workflows/quality.yml` runs on pull requests and pushes to `dev` or `master`:

1. `npm ci`
2. `npm run check`
3. `npm test`
4. `npx playwright install --with-deps chromium`
5. `npm run test:e2e`

The Playwright HTML report is uploaded as a CI artifact when available.
