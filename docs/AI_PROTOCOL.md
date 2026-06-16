# AI Usage Protocol: albertoduran

This document defines how AI assistants should work in the albertoduran repository.

## 1. Onboarding Checklist

Before proposing implementation changes, an AI assistant should inspect the current repository and review these source-of-truth documents:

1. `docs/PROJECT_CONTEXT.md` for architecture, routes, content model, and deployment context.
2. `docs/TESTING_STRATEGY.md` for required quality gates.
3. `docs/GIT_WORKFLOW.md` for branching, verification, and merge rules.
4. `docs/UI_STYLE_GUIDE.md` for UI implementation constraints.
5. `docs/AI_SKILLS.md` for project-local AI skills and their source repositories.
6. `docs/ROADMAP.md` for planned work and known future integrations.

Repository files are always the final source of truth when docs and implementation disagree. Confirm current behavior from `package.json`, `astro.config.mjs`, `wrangler.json`, test configs, and the relevant source files before making claims.

## 2. Interaction Rules

### Verification First

Do not call a task complete without naming the verification performed or explaining why verification could not be run. Use `docs/TESTING_STRATEGY.md` to choose the minimum relevant checks.

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
