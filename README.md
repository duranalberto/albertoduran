# albertoduran - Portfolio and Journal

A high-performance personal portfolio and publishing site built with Astro 6, Tailwind CSS 4, and DaisyUI 5. The site is static-first, uses Astro view transitions for a smooth internal navigation experience, and keeps browser JavaScript focused on progressive enhancement.

## Tech Stack

- **Framework:** Astro `^6.4.4` with MDX support
- **Styling:** Tailwind CSS `^4.3.0` and DaisyUI `^5.5.20`
- **Runtime:** Node 22 in the devcontainer and GitHub Actions
- **Deployment:** Cloudflare Workers Assets configuration in `wrangler.json`
- **Testing:** Astro Check, Vitest, and Playwright

## Project Shape

```text
/
├─ .devcontainer/           # VS Code DevContainer configuration
├─ .agents/                 # Project-local AI skills and local context guide
├─ .github/workflows/       # GitHub Actions quality workflow
├─ docs/                    # Project documentation and contribution rules
├─ public/                  # Static public files and headers
├─ src/
│  ├─ assets/               # Local images and fonts
│  ├─ components/           # Astro UI, layout, profile, and journal components
│  ├─ content/              # Build-time content processors
│  ├─ data/                 # Site, profile, and icon data
│  ├─ integrations/         # Mermaid and HTML minifier integrations
│  ├─ layouts/              # Shared Astro layouts
│  ├─ pages/                # File-based routes
│  ├─ runtime/              # Browser-side progressive enhancement
│  ├─ styles/               # Global CSS, themes, utilities, and page styles
│  ├─ thejournal/           # MDX publications and vaults
│  ├─ types/                # Shared TypeScript types
│  └─ utils/                # Shared build/runtime helpers
├─ astro.config.mjs
├─ package.json
├─ playwright.config.ts
├─ vitest.config.ts
└─ wrangler.json
```

## Getting Started

Use the VS Code DevContainer when possible. It provides Node 22, GitHub CLI, Zsh, and the editor extensions used by the project.

Run commands from the repository root:

| Command                   | Action                                              |
| :------------------------ | :-------------------------------------------------- |
| `npm install`             | Install dependencies                                |
| `npm run dev`             | Start the Astro dev server at `localhost:4321`      |
| `npm run build`           | Build the production site to `./dist/`              |
| `npm run build:test`      | Build with deterministic Atlas and Mermaid fixtures |
| `npm run preview`         | Preview the production build locally                |
| `npm run check`           | Run Astro and TypeScript diagnostics                |
| `npm test`                | Run Vitest unit and integration tests               |
| `npm run test:coverage`   | Generate Vitest coverage                            |
| `npm run test:e2e`        | Build deterministic output and run Playwright tests |
| `npm run astro -- --help` | Show Astro CLI help                                 |

## Documentation

- `docs/PROJECT_CONTEXT.md` explains the architecture, routes, content model, and deployment target.
- `docs/THEJOURNAL_PUBLICATION_GUIDE.md` defines how to publish reader-facing entries under `src/thejournal/`.
- `docs/DEV_ENVIRONMENT.md` explains the DevContainer and local tool setup.
- `docs/TESTING_STRATEGY.md` defines the required quality gates and CI workflow.
- `docs/MERMAID_RENDERING.md` documents Mermaid rendering cache/version rules.
- `docs/GIT_WORKFLOW.md` documents branching, verification, and merge expectations.
- `docs/UI_STYLE_GUIDE.md` captures UI implementation rules.
- `docs/PROJECT_PAGE_GUIDE.md` defines how to build and register project showcase landing pages.
- `docs/AI_PROTOCOL.md` defines how AI assistants should work in this repo.
- `docs/AI_SKILLS.md` documents project-local Codex skills.
- `docs/ROADMAP.md` tracks planned work.

## Development Rules

- Keep the site static-first and use client JavaScript only for progressive enhancement.
- Follow `docs/THEJOURNAL_PUBLICATION_GUIDE.md` when publishing or restructuring entries in `src/thejournal/`.
- AI agents must not modify content under `src/thejournal/` unless explicitly asked to change journal content.
- Preserve the Astro view-transition experience for internal navigation.
- Keep TypeScript strict and avoid `any` unless the tradeoff is documented.
- Prefer existing components, theme tokens, and DaisyUI conventions before adding new styling patterns.
- Scope verification to the change; do not run every test suite when focused checks are enough.
- Validate production behavior with `npm run build`, `npm run preview`, and the relevant tests before opening a PR.

## CI and Deployment

GitHub Actions runs the quality workflow on pull requests and pushes to `dev` or `master`. The current gate runs `npm run check`, `npm test`, installs Chromium, and runs `npm run test:e2e`.

The production build is static output in `dist/`. Cloudflare Workers Assets settings live in `wrangler.json`.

## Roadmap

See `docs/ROADMAP.md` for planned work. CI automation and dark mode are already in place; remaining roadmap items focus on features such as a contact form, analytics, RSS, search, and broader QA coverage.
