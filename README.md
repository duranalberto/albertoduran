# albertoduran — Portfolio & Blog

A high-performance personal portfolio and blog built with **Astro 5** and **DaisyUI**. This project is engineered for a seamless, "SPA-feel" experience using Astro View Transitions while maintaining the SEO benefits of a static site.

> [!IMPORTANT]
> **AI Contributors**: You must read and follow the [AI Usage Protocol](./docs/AI_PROTOCOL.md) before proposing changes. This project enforces a strict "One Commit Rule" and mandatory testing tiers.

---

## 🛠 Tech Stack

- **Framework:** [Astro v5.1](https://astro.build/) (Static/SSR Hybrid)
- **Styling:** [Tailwind CSS v3.4](https://tailwindcss.com/) + [DaisyUI v5.5](https://daisyui.com/)
- **Deployment:** [Cloudflare Workers](https://pages.cloudflare.com/)

---

## 📂 Project Architecture

The project follows a modular "Islands" architecture to minimize client-side JavaScript.

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
   │  ├─ common/
   │  ├─ sections/
   │  │  ├─ index/
   │  │  ├─ profile/
   │  │  └─ thejournal/
   │  └─ ui/
   ├─ data/
   ├─ layouts/              # Base Astro templates with ViewTransitions
   ├─ pages/                # File-based routing (Standard Astro)
   │  └─ thejournal/        # thejournal ...slug astro file
   ├─ styles/
   ├─ thejournal/           # MDX Files (For blog-like site "the journal")
   │  └─ a_vault/           # Each sub-directory in thejournal is considering a vault
   ├─ types/                # Custom Type definitions (No 'any' allowed)
   └─ utils/
```

---

## 📖 Documentation Suite

For detailed information on how to develop and contribute, refer to the `/docs` directory:

1. **[Project Context](./docs/PROJECT_CONTEXT.md)**: High-level overview and stack versions.
2. **[AI Protocol](./docs/AI_PROTOCOL.md)**: Mandatory rules for AI-assisted development.
3. **[Git Workflow](./docs/GIT_WORKFLOW.md)**: Naming conventions and the "One Commit Rule".
4. **[Environment Setup](./docs/ENVIRONMENT_SETUP.md)**: DevContainer and system dependencies.

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
| `npm run preview`                 | Preview your build locally, before deploying     |
| `npm run astro ...`               | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help`         | Get help using the Astro CLI                     |
| `npm run build && npm run deploy` | Deploy your production site to Cloudflare        |
| `npm wrangler tail`               | View real-time logs for all Workers              |

---

## ⚖️ Development Rules

- **SPA Experience:** All internal links must use View Transitions. Check `TECHNICAL_STACK.md` for `astro:after-swap` hooks.
- **No "any":** TypeScript must be strictly typed. Use `src/types/vendor.d.ts` for missing 3rd-party types.
- **Atomic Commits:** One feature per branch, squashed into **one single commit** before merging to `dev`.
- **UI Consistency:** Always prefer DaisyUI components over custom Tailwind utilities.

[Image of Git flow branching model]

---

## 🗺 Roadmap

- [ ] **CI Test Automation**: GitHub Actions for every PR (Urgent).
- [ ] **Contact Form**: Preact Island with Cloudflare Turnstile.
- [ ] **Analytics**: Privacy-focused tracking via Plausible.

For more details, see **[Roadmap](./docs/ROADMAP.md)**.
