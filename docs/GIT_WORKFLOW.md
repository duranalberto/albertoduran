# Contributing Guide

This document defines the development workflow, quality standards, and merge requirements for **albertoduran**.

The goal is to maintain:

- A clean, linear Git history
- High architectural integrity
- Deterministic builds
- Predictable deployments

---

## 1. Development Environment

All development must occur inside the **VS Code DevContainer**.

### Environment

- **Node**: 22
- **Shell**: Zsh (Oh My Zsh + Powerlevel10k)
- **CLI Tools**:
  - `gh` (GitHub CLI)
  - `astro`
  - `vitest`
  - `playwright`
- **Quality Tools**:
  - Prettier (format on save)
  - ESLint
  - Code Spell Checker

Do not modify environment assumptions without updating this document.

---

## 2. Local Development Workflow

All commands must be executed from the project root.

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

- Runs at `http://localhost:4321`
- Use for rapid iteration
- Hot reload enabled

---

## 3. Mandatory Pre-Merge Verification

Before opening a Merge Request (MR), developers **must validate production behavior**, not only development mode.

### 3.1 Build the Production Output

```bash
npm run build
```

- Generates the production build into `./dist`
- Ensures no build-time errors
- Validates content collections and schema

### 3.2 Preview the Production Build

```bash
npm run preview
```

- Serves the built output locally
- Simulates real deployment behavior
- Required to validate:
  - Routing
  - View transitions
  - Hydration behavior
  - Collection rendering
  - Sidebar automation

⚠️ Do **not** rely solely on `npm run dev`.  
The MR must reflect behavior verified via `build + preview`.

---

## 4. Testing

The formal test matrix lives in `docs/TESTING_STRATEGY.md`.

### Current Available Commands

```bash
npm test
npm run test:coverage
npm run test:e2e
npm run check
```

| Command               | Purpose                         |
| --------------------- | ------------------------------- |
| `npm test`            | Unit & component tests (Vitest) |
| `npm run test:coverage` | Vitest coverage report |
| `npm run test:e2e`    | End-to-end tests (Playwright)   |
| `npm run check`       | Astro and TypeScript diagnostics |

`npm run test:e2e` runs `npm run build:test` first, then serves the production build with `astro preview`. The test build uses deterministic Atlas and Mermaid fixtures so CI does not depend on ESPN or remote Mermaid renderers.

`npm run lint` is intentionally outside the mandatory gate until an ESLint flat config is added for ESLint 10.

---

## 5. Branching Strategy

This repository follows a strict, linear Git model.

### Branch Hierarchy

- `master` → Production (Cloudflare deployment)
- `dev` → Integration branch
- `feature/*` → Task-specific branches (created from `dev` only)

Direct commits to `master` or `dev` are prohibited.

---

## 6. Branch Naming Convention

All feature branches must follow:

```plaintext
feature/[category]-[brief-description]
```

### Categories

- `feat` → New functionality  
  `feature/feat-contact-form`
- `fix` → Bug fix  
  `feature/fix-header-padding`
- `docs` → Documentation updates  
  `feature/docs-testing-strategy`
- `test` → Tests only  
  `feature/test-view-transitions`
- `refactor` → Internal refactor (no behavior change)

---

## 7. Development Lifecycle

### Step 1 — Create Feature Branch

Always branch from latest `dev`.

```bash
git checkout dev
git pull origin dev
git checkout -b feature/feat-my-task
```

---

### Step 2 — Implement & Validate

During development:

```bash
npm run dev
```

Before MR submission (mandatory):

```bash
npm run build
npm run preview
npm run astro check
```

If applicable:

```bash
npm test
npm run test:e2e
```

All checks must pass.

---

### Step 3 — Rebase

Feature branches must be up to date with `dev`.

```bash
git fetch origin
git rebase origin/dev
```

If a conflict occurs:

- Stop immediately.
- Do not force push.
- Manual resolution required.

Automated destructive conflict resolution is prohibited.

---

### Step 4 — Squash (One Commit Rule)

Each feature branch must contain exactly **one commit**.

If multiple commits exist:

```bash
git rebase -i HEAD~N
```

Use `squash`.

If the task is too large for one commit, split into sequential sub-features.

---

### Step 5 — Open Pull Request to `dev`

```bash
gh pr create --base dev --title "feat: add contact form" --body "Implements Preact form with validation"
```

Requirements:

- All verification steps completed
- Clean single commit
- Manual approval
- Passing CI

---

### Step 6 — Release to Production

Only `dev` may be merged into `master`.

- Manual approval required
- Triggers the production Cloudflare deployment for the static Workers Assets build

Direct merges into `master` from any other branch are rejected.

---

## 8. Coding Standards

### Component Separation

- `.astro` → Layouts & static components
- `.jsx` / `.tsx` → Interactive islands only

Avoid unnecessary client-side JavaScript.

### Styling

- Prefer DaisyUI component classes
- Use Tailwind utilities when necessary
- No inline CSS unless unavoidable

### TypeScript

- Strict mode
- No `any` without explicit justification

### Architectural Integrity

- Respect content collection rules
- Do not bypass schema validation
- Avoid introducing new runtime dependencies without justification

---

## 9. CLI Utilities

```bash
gh pr status
git log --oneline --graph --all
```

Use these to inspect PR state and maintain linear history.

---

## 10. Merge Restrictions Summary

| Target   | Source      | Requirements                                                                               |
| -------- | ----------- | ------------------------------------------------------------------------------------------ |
| `dev`    | `feature/*` | Rebased, Squashed (1 commit), Build Verified, Preview Verified, Checks Passed, PR Approved |
| `master` | `dev`       | PR Approved                                                                                |
| `master` | Any other   | Rejected                                                                                   |

---

## Core Rules (Non-Negotiable)

1. Build must pass.
2. Production preview must be verified.
3. One commit per feature branch.
4. No direct commits to protected branches.
5. No force pushes after PR review begins.

Failure to follow these rules will result in rejection of the Merge Request.
