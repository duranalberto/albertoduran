# albertoduran - Portfolio and Journal

A high-performance personal portfolio and publishing site built with Astro 7, Tailwind CSS 4, and DaisyUI 5. The site is static-first, uses Astro view transitions for a smooth internal navigation experience, and keeps browser JavaScript focused on progressive enhancement.

## Tech Stack

- **Framework:** Astro `^7.2.2` with MDX support (Rust compiler, Sätteri markdown, Vite 8 / Rolldown, oxc minifier)
- **Rendering pipeline:** Bloomwright — `bloomwright-mdx` extracts fenced blocks (DaisyUI components, ECharts, Mermaid) into markup at build time; `bloomwright-ui` renders Mermaid diagrams to cached SVG.
- **Styling:** Tailwind CSS `^4.3.3` and DaisyUI `^5.7.17`
- **Charts & diagrams:** ECharts `6` and Mermaid, authored as MDX code fences
- **Runtime:** Node 22 in the devcontainer and GitHub Actions
- **Deployment:** Cloudflare Workers Assets configuration in `wrangler.json`
- **Quality gates:** Astro Check, ESLint, Vitest, and Playwright

## Project Shape

```text
/
├─ .devcontainer/           # VS Code DevContainer configuration
├─ .agents/                 # Project-local AI skills and local context guide
├─ .github/workflows/       # GitHub Actions quality workflow
├─ docs/                    # Project documentation and contribution rules
├─ public/                  # Static public files and headers
├─ scripts/                 # Build helpers (bundle-size check, font subsetting)
├─ src/
│  ├─ assets/               # Local images and fonts
│  ├─ components/           # Astro UI, layout, profile, and journal components
│  ├─ content/              # Build-time content processors
│  ├─ data/                 # Site, profile, and icon data
│  ├─ integrations/         # HTML minifier build integration
│  ├─ layouts/              # Shared Astro layouts
│  ├─ mermaid/              # Mermaid render pipeline (Worker / offline fixtures)
│  ├─ pages/                # File-based routes
│  ├─ runtime/              # Browser-side progressive enhancement
│  ├─ styles/               # Global CSS, themes, utilities, and page styles
│  ├─ thejournal/           # MDX publications and vaults
│  ├─ types/                # Shared TypeScript types
│  ├─ utils/                # Shared build/runtime helpers
│  └─ content.config.ts     # Astro content collection schemas
├─ astro.config.mjs
├─ package.json
├─ playwright.config.ts
├─ vitest.config.ts
└─ wrangler.json
```

## Getting Started

Use the VS Code DevContainer when possible. It provides Node 22, GitHub CLI, Zsh, and the editor extensions used by the project.

Run commands from the repository root:

| Command                   | Action                                                |
| :------------------------ | :---------------------------------------------------- |
| `npm install`             | Install dependencies                                  |
| `npm run dev`             | Start the Astro dev server at `localhost:4321`        |
| `npm run build`           | Build the production site to `./dist/`                |
| `npm run build:test`      | Build with deterministic test mode + Mermaid fixtures |
| `npm run preview`         | Preview the production build locally                  |
| `npm run check`           | Run Astro and TypeScript diagnostics                  |
| `npm run lint`            | Lint with ESLint (Astro + TypeScript)                 |
| `npm run format`          | Format the codebase with Prettier                     |
| `npm test`                | Run Vitest unit and integration tests                 |
| `npm run test:watch`      | Run Vitest in watch mode                              |
| `npm run test:coverage`   | Generate Vitest coverage                              |
| `npm run test:e2e`        | Build deterministic output and run Playwright tests   |
| `npm run astro -- --help` | Show Astro CLI help                                   |

### Background dev server (Astro 7)

Astro 7 supports a detached dev server process. Use these scripts when you need the server to survive terminal sessions, or when working from a script or CI-like environment:

| Command              | Action                                                             |
| :------------------- | :----------------------------------------------------------------- |
| `npm run dev:bg`     | Start a background dev server (detached, writes `.astro/dev.json`) |
| `npm run dev:stop`   | Stop the running background server                                 |
| `npm run dev:status` | Show server URL, PID, port, and uptime                             |
| `npm run dev:logs`   | Tail the background server log (`.astro/dev.log`)                  |

**AI agent auto-detection:** when `astro dev` is invoked from within an AI agent environment (Claude Code, Cursor, Copilot Workspace, etc.), Astro 7 detects this automatically via the [`am-i-vibing`](https://github.com/nickvdyck/am-i-vibing) package and silently switches to background mode with JSON-formatted output — no flags or configuration needed.

**JSON logging:** pass `--json` to any `astro` command to emit newline-delimited JSON logs instead of the default human-readable output. This is set automatically in agent environments but can also be used manually to pipe logs to an aggregator:

```sh
astro dev --json 2>&1 | tee server.log
```

**Queued rendering** is the stable default in Astro 7. All pages are rendered concurrently with back-pressure control; no configuration is needed.

## Documentation

**`docs/engineering/`** — How the project is built and run.

- `PROJECT_CONTEXT.md` — architecture, routes, content model, and deployment target.
- `DEV_ENVIRONMENT.md` — DevContainer and local tool setup.
- `GIT_WORKFLOW.md` — branching, verification, and merge expectations.
- `TESTING_STRATEGY.md` — required quality gates and CI workflow.
- `ROADMAP.md` — planned work.

**`docs/components/`** — UI component and rendering references.

- `UI_STYLE_GUIDE.md` — design system rules that govern all components.
- `CALLOUT.md`, `CHAT.md`, `LIST.md`, `STEPS.md` — display component APIs.
- `MOCKUP_BROWSER.md`, `MOCKUP_PHONE.md`, `MOCKUP_WINDOW.md` — mockup component APIs.
- `ECHARTS_MDX_CHARTS.md`, `MERMAID_RENDERING.md` — chart and diagram rendering.
- `MARKDOWN_MDX_CODE_FENCES.md` — code-fence authoring and the Bloomwright extraction contract.

**`docs/content/`** — Authoring guides.

- `THEJOURNAL_PUBLICATION_GUIDE.md` — how to publish entries under `src/thejournal/`.
- `PROJECT_PAGE_GUIDE.md` — how to build and register project showcase pages.

**`docs/ai/`** — Instructions for AI agents working in this repo.

- `AI_PROTOCOL.md` — agent behavior rules.
- `AI_SKILLS.md` — project-local agent skills kept in `.agents/skills/`.

**`docs/archive/`** — Historical records, including the Bloomwright extraction and migration notes.

## Development Rules

- Keep the site static-first and use client JavaScript only for progressive enhancement.
- Follow `docs/content/THEJOURNAL_PUBLICATION_GUIDE.md` when publishing or restructuring entries in `src/thejournal/`.
- AI agents must not modify content under `src/thejournal/` unless explicitly asked to change journal content.
- Preserve the Astro view-transition experience for internal navigation.
- Keep TypeScript strict and avoid `any` unless the tradeoff is documented.
- Prefer existing components, theme tokens, and DaisyUI conventions before adding new styling patterns.
- Scope verification to the change; do not run every test suite when focused checks are enough.
- Validate production behavior with `npm run build`, `npm run preview`, and the relevant tests before opening a PR.

## CI and Deployment

GitHub Actions runs the quality workflow on pull requests and pushes to `dev` or `master`. The gate runs `npm run check`, `npm run lint`, and `npm test`, then installs Chromium and runs `npm run test:e2e`.

The production build is static output in `dist/`. Cloudflare Workers Assets settings live in `wrangler.json`.

## Roadmap

See `docs/engineering/ROADMAP.md` for planned work. CI automation and dark mode are already in place; remaining roadmap items focus on features such as a contact form, analytics, RSS, search, and broader QA coverage.
