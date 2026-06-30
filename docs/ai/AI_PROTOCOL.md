# AI Usage Protocol: albertoduran

This document defines how AI assistants should work in the albertoduran repository.

## 1. Onboarding Checklist

Before proposing implementation changes, an AI assistant should inspect the current repository and review these source-of-truth documents:

1. `docs/engineering/PROJECT_CONTEXT.md` for architecture, routes, content model, and deployment context.
2. `docs/engineering/TESTING_STRATEGY.md` for required quality gates.
3. `docs/engineering/GIT_WORKFLOW.md` for branching, verification, and merge rules.
4. `docs/components/UI_STYLE_GUIDE.md` for UI implementation constraints.
5. `docs/ai/AI_SKILLS.md` for project-local AI skills and their source repositories.
6. `docs/engineering/ROADMAP.md` for planned work and known future integrations.

When creating, revising, moving, or publishing an entry under
`src/thejournal/`, also review `docs/content/THEJOURNAL_PUBLICATION_GUIDE.md`. That
guide is the source of truth for reader-facing journal intent, publication
length, standalone article shape, vault structure, draft behavior, and the
processor rules in `src/content/processors/`.

For charts and reusable display components inside journal content, treat
`docs/components/MARKDOWN_MDX_CODE_FENCES.md` as the default authoring path:
prefer `mermaid`, `echart`, and `daisyui` code fences over importing Astro
components, and fall back to component imports only when a publication needs
Astro's image pipeline, named slots, custom icons, or build-time ECharts option
functions.

AI assistants must not modify files under `src/thejournal/` unless the user
explicitly asks for journal content changes. A request to update docs, code,
tests, styling, processors, or publication policy is not permission to rewrite
existing journal entries unless the user names that content work directly.

If `.agents/context/` contains user-provided files, review them as local
reference material before planning or implementing changes. Treat that directory
as optional, clone-local context: useful for the current workspace, but not a
portable project source of truth.

Repository files are always the final source of truth when docs and implementation disagree. Confirm current behavior from `package.json`, `astro.config.mjs`, `wrangler.json`, test configs, and the relevant source files before making claims.

## 2. Interaction Rules

### Verification First

Do not call a task complete without naming the verification performed or explaining why verification could not be run. Use `docs/engineering/TESTING_STRATEGY.md` to choose the minimum relevant checks.

### Scoped Testing

Do not run the full test suite by default. Choose the smallest meaningful
verification for the files changed and the risk introduced, then explain that
choice in the final response. For example, content-only changes under
`src/thejournal/` usually do not require every unit test and every Playwright
test; prefer the relevant content validation, build check, or focused route
coverage unless the change touches shared processors, routing, runtime behavior,
or layout.

### Dependency Guardrails

Avoid adding new npm dependencies by default. If a feature appears to need one, first explain why the existing stack cannot reasonably handle it and document the tradeoff.

### Static-First Guardrail

This is a static Astro site. Avoid introducing runtime-only behavior, SSR assumptions, or broad client-side JavaScript unless the feature explicitly requires it and the tradeoff is documented.

### Git Safety

Never use destructive Git commands or force pushes without explicit user approval. If a rebase or merge conflict appears during assisted work, stop and explain the conflict rather than resolving it destructively.

## 3. Prompting Examples for the User

For a new feature:

> I want to add [feature]. Use the current project context, follow the UI style guide, and include the tests required by the testing strategy.

For a bug fix:

> I found a bug in [area]. Inspect the existing implementation, fix it with the smallest reasonable change, and verify the affected behavior.

For documentation:

> Audit [document or area] against the current repository and update stale facts, missing commands, and broken references.
