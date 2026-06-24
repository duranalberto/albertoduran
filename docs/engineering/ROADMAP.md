# Project Roadmap: albertoduran

This document tracks planned features, technical integrations, and quality improvements. It should describe future work only; completed items belong in `README.md`, `docs/engineering/PROJECT_CONTEXT.md`, or `docs/engineering/TESTING_STRATEGY.md`.

## Current Baseline

- Static Astro 6 site with MDX journal content.
- Tailwind CSS 4 and DaisyUI 5 theme system.
- Light/dark theme persistence is implemented.
- GitHub Actions quality workflow is in place for pull requests and pushes to `dev` or `master`.
- Cloudflare Workers Assets deployment configuration exists in `wrangler.json`.

## Planned Integrations

### Contact Form

- **Priority:** High
- **Goal:** Add a lightweight contact workflow without compromising the static-first architecture.
- **Likely approach:** Small client-side form enhancement plus a Cloudflare-backed endpoint.
- **Notes:** Evaluate Cloudflare Turnstile for spam protection before implementation.

### Analytics

- **Priority:** Medium
- **Goal:** Add privacy-friendly analytics with minimal JavaScript cost.
- **Likely approach:** Plausible Analytics or a similarly lightweight provider.
- **Constraint:** Do not add tracking until the privacy and performance tradeoffs are accepted.

### RSS Feed

- **Priority:** Medium
- **Goal:** Publish journal updates through an RSS feed.
- **Likely approach:** Add an Astro-compatible RSS integration or generate the feed at build time.
- **Constraint:** Add the dependency only when the implementation is approved; `@astrojs/rss` is not currently installed.

### Journal Search

- **Priority:** Low
- **Goal:** Make long-form journal content easier to discover.
- **Likely approach:** Static search index or Pagefind-style indexing.
- **Constraint:** Preserve fast static output and avoid search code that blocks initial page rendering.

### Broader QA Coverage

- **Priority:** Medium
- **Goal:** Extend the current CI gate beyond the existing Chromium Playwright suite.
- **Candidates:** Accessibility assertions, additional browser/device coverage, visual regression snapshots, and markdown/content linting.

## Implementation Rules for Future Work

1. Confirm architecture and content behavior in `docs/engineering/PROJECT_CONTEXT.md`.
2. Follow the required gates in `docs/engineering/TESTING_STRATEGY.md`.
3. Keep the static-first model unless the feature explicitly requires a runtime service.
4. Prefer existing components, Tailwind/DaisyUI tokens, and current integrations before adding dependencies.
5. Update docs when a feature changes commands, deployment behavior, content schema, or developer workflow.
