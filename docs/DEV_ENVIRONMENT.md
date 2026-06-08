# Development Environment Setup Guide: albertoduran

This project uses a VS Code DevContainer so local development matches the CI runtime closely.

## 1. Overview

The DevContainer provides:

- Node 22 through `mcr.microsoft.com/devcontainers/javascript-node:22`.
- GitHub CLI through the devcontainer feature in `.devcontainer/devcontainer.json`.
- Zsh with Oh My Zsh, Powerlevel10k, autosuggestions, and syntax highlighting.
- Project dependencies installed by the `postCreateCommand`.
- VS Code extensions for Astro, MDX, Tailwind CSS, ESLint, Prettier, spell checking, markdown linting, and GitHub workflows.

## 2. Host Requirements

Before opening the container, install:

1. Docker Desktop or another compatible Docker runtime.
2. Visual Studio Code.
3. The Microsoft Dev Containers extension.
4. A Nerd Font on the host if you want terminal prompt icons to render correctly.

## 3. Quick Start

1. Clone the repository.
2. Open the repository root in VS Code.
3. Choose **Reopen in Container** when prompted.
4. Wait for `npm install` to finish.
5. Run `npm run dev` from the repository root.

The dev server runs on port `4321`. The container forwards that port and labels it as the Astro preview/dev port.

## 4. GitHub CLI Authentication

The container installs `gh`, but it does not create or manage a project secrets file. Authenticate manually when needed:

```bash
gh auth login
```

If your host environment already forwards GitHub credentials, `gh` may reuse them.

## 5. VS Code Configuration

Project settings live in `.vscode/settings.json`; container-specific settings live in `.devcontainer/devcontainer.json`.

Important defaults:

- `formatOnSave` is enabled.
- Astro, MDX, TypeScript, JavaScript, JSON, and JSONC use configured formatters.
- Tailwind CSS IntelliSense is associated with Astro and MDX files.
- The integrated terminal exports `HOST=0.0.0.0` so Astro binds correctly inside the container.
- The project dictionary lives at `.vscode/dictionary.txt`.

## 6. Test and Quality Tools

Project quality commands are installed through `npm install`:

```bash
npm run check
npm test
npm run test:e2e
```

Playwright browser dependencies are installed in CI before the e2e suite. For local e2e troubleshooting, run:

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

See `docs/TESTING_STRATEGY.md` for the full quality gate and fixture behavior.
