# albertoduran — Portfolio & Blog

A high-performance personal portfolio and blog built with **Astro 6** and **DaisyUI5**. This project is engineered for a seamless, "SPA-feel" experience using Astro View Transitions while maintaining the SEO benefits of a static site.

---

## 🛠 Tech Stack

- **Framework:** [Astro v56](https://astro.build/) (Static)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Deployment:** [Cloudflare Workers](https://workers.cloudflare.com/)

---

## 📂 Project Architecture

The site is rendered at built time. The site delivers a ready to use html pages. Javascript are used to enhance the experience, but not mandatory for the visitor to see the content.

**Project Directory Structure:**

```text
/
├─ .devcontainer/           # Pre-configured Docker development environment
├─ .vscode/                 # VS Code settings
├─ docs/                    # Project Source of Truth
├─ public/                  # Public Files
└─ src/
   ├─ assets/               # Images assets
   ├─ components/           # Astro components
   │  └─ ui/
   ├─ data/
   ├─ layouts/              # Base Astro templates with ViewTransitions
   ├─ pages/                # File-based routing (Standard Astro)
   │  └─ thejournal/        # thejournal ...slug astro file
   ├─ styles/               # Tailwind + DaisyUI setup. DaisyUI overrides and general rules.
   ├─ thejournal/           # MDX Files (For blog-like site "the journal")
   │  └─ a_vault/           # Each sub-directory in thejournal is considering a vault
   ├─ types/                # Custom Type definitions (No 'any' allowed)
   └─ utils/
```

---

## 🚀 Getting Started

### 1. Development Environment

It is highly recommended to use **VS Code DevContainers**. The environment comes pre-loaded with:

- Node.js 24.13.
- Quality extensions (ESLint, Prettier, Code Spell Checker).

### 2. Essential Commands

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/astro-blog-starter-template)

All commands are run from the root of the project, from a terminal:

| Command                           | Action                                           |
| :-------------------------------- | :----------------------------------------------- |
| `npm install`                     | Installs dependencies                            |
| `npm run dev`                     | Starts local dev server at `localhost:4321`      |
| `npm run build`                   | Build your production site to `./dist/`          |
| `npm run build:test`              | Build with deterministic Atlas and Mermaid fixtures |
| `npm run preview`                 | Preview your build locally, before deploying     |
| `npm test`                        | Run Vitest unit and integration tests            |
| `npm run test:e2e`                | Run production-preview Playwright tests          |
| `npm run astro ...`               | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help`         | Get help using the Astro CLI                     |
| `npm run build && npm run deploy` | Deploy your production site to Cloudflare        |
| `npm wrangler tail`               | View real-time logs for all Workers              |

---

## ⚖️ Development Rules

- **SPA Experience:** All internal links must use View Transitions.
- **No "any":** TypeScript must be strictly typed. Use `src/types/type.ts` for types.
- **Atomic Commits:** One feature per branch, squashed into **one single commit** before merging to `dev`.
- **UI Consistency:** Always prefer DaisyUI components over custom Tailwind utilities.

[Image of Git flow branching model]

---

## 🗺 Roadmap

- [ ] **CI Test Automation**: GitHub Actions for every PR (Urgent).
- [ ] **Contact Form**: Preact Island with Cloudflare Turnstile.
- [ ] **Analytics**: Privacy-focused tracking via Plausible.
