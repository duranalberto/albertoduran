# albertoduran

High-performance personal portfolio and publishing platform built with **Astro**.  
Static-first architecture with SPA-like navigation and structured long-form content support.

---

## ✨ Overview

This project is designed to:

- Deliver excellent performance and SEO
- Provide seamless, SPA-like page transitions
- Support single publications and vault of publication
- Maintain strict architectural boundaries
- Minimize client-side JavaScript

The system combines **Static Site Generation (SSG)**, selective **SSR**, and targeted client-side hydration using Astro Islands.

---

## 🧱 Architecture

### Static-First Philosophy

All content and layouts render as static HTML by default.  
Client-side JavaScript is added **only when required**.

| Layer            | Usage                                 |
| ---------------- | ------------------------------------- |
| Static HTML      | Default rendering mode                |
| SSR              | When dynamic runtime data is required |
| Client Hydration | Interactive components only           |

This keeps bundle size small and performance high.

---

### 🚀 SPA-like Navigation

The project uses Astro View Transitions to provide seamless internal navigation without full page reloads.

#### Implementation Rules

- `<ViewTransitions />` is included in the main layout.
- Only missing assets are fetched on navigation.
- Content is swapped during transitions.
- Navigation, header, and footer remain visually stable.

If a component needs state persistence across transitions:

```astro
<MyComponent transition:persist />
```

- Add other transitions

---

## 🛠 Tech Stack

### Core Frameworks

- **Astro v5.17.x** – Routing, SSG, SSR
- **Tailwind CSS v4.1.x** – Utility-first styling
- **DaisyUI v5.5.x** – Component system for Tailwind

---

## 📂 Project Structure

```plaintext
albertoduran/
├─ .devcontainer/
│  ├─ .env
│  ├─ .env.example
│  ├─ devcontainer.json
│  └─ Dockerfile
├─ .vscode/
│  ├─ dictionary.txt
│  ├─ launch.json
│  └─ settings.json
├─ docs/
│  ├─ AI_PROTOCOL.md
│  ├─ DEV_ENVIRONMENT.md
│  ├─ GIT_WORKFLOW.md
│  ├─ PROJECT_CONTEXT.md
│  ├─ ROADMAP.md
│  └─ UI_STYLE_GUIDE.md
├─ public/
│  ├─ fonts/
│  │  ├─ FiraCode.woff2
│  │  ├─ Montserrat.woff2
│  │  └─ NotoSansDisplay.woff2
│  └─ favicon.svg
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  ├─ common/
│  │  │  ├─ Footer.astro
│  │  │  ├─ Header.astro
│  │  │  ├─ JournalCard.astro
│  │  │  ├─ JournalGrid.astro
│  │  │  ├─ NavDrawer.astro
│  │  │  └─ ProjectsGrid.astro
│  │  ├─ sections/
│  │  │  ├─ index/
│  │  │  │  ├─ AtlasStats.astro
│  │  │  │  ├─ IndexHero.astro
│  │  │  │  ├─ ProfileView.astro
│  │  │  │  └─ Quote.astro
│  │  │  ├─ profile/
│  │  │  │  ├─ AwardsGrid.astro
│  │  │  │  ├─ CertificationsList.astro
│  │  │  │  ├─ EducationList.astro
│  │  │  │  ├─ ExperienceTimeline.astro
│  │  │  │  ├─ ProfileHero.astro
│  │  │  │  └─ SkillsGrid.astro
│  │  │  └─ thejournal/
│  │  │     ├─ Article.astro
│  │  │     ├─ JournalHero.astro
│  │  │     ├─ OnThisPage.astro
│  │  │     ├─ Pagination.astro
│  │  │     ├─ PublicationHeader.astro
│  │  │     └─ TableOfContent.astro
│  │  └─ ui/
│  │     ├─ AlbertoDuran.astro
│  │     ├─ Button.astro
│  │     ├─ CodeBlock.astro
│  │     ├─ ErrorHero.astro
│  │     ├─ HeadingAnchor.astro
│  │     ├─ SectionHeader.astro
│  │     ├─ StripBackground.astro
│  │     ├─ SVGIcon.astro
│  │     ├─ ThemeToggle.astro
│  │     └─ VaultTreeNode.astro
│  ├─ data/
│  │  ├─ about.ts
│  │  └─ icons.ts
│  ├─ layouts/
│  │  ├─ BaseCard.astro
│  │  ├─ BaseLayout.astro
│  │  ├─ FlexShell.astro
│  │  └─ ParallaxHero.astro
│  ├─ pages/
│  │  ├─ thejournal/
│  │  │  └─ [...slug].astro
│  │  ├─ 404.astro
│  │  ├─ index.astro
│  │  ├─ profile.astro
│  │  └─ thejournal.astro
│  ├─ styles/
│  │  ├─ glass.css
│  │  ├─ global.css
│  │  ├─ mockup-code.css
│  │  └─ typography-bundle.css
│  ├─ thejournal/
│  ├─ types/
│  │  ├─ about.ts
│  │  ├─ atlas_data.ts
│  │  ├─ button.ts
│  │  ├─ content_context.ts
│  │  ├─ espn.ts
│  │  ├─ footer.ts
│  │  ├─ icon.ts
│  │  ├─ navigation.ts
│  │  └─ profile_view.ts
│  ├─ utils/
│  │  ├─ atlas_schedule.ts
│  │  ├─ atlas_service.ts
│  │  ├─ brave_ios_router_fix.ts
│  │  ├─ is_brave_ios.ts
│  │  ├─ ribbon.ts
│  │  └─ thejournal_manifest.ts
│  └─ content.config.ts
├─ .gitignore
├─ astro.config.mjs
├─ package-lock.json
├─ package.json
├─ README.md
└─ tsconfig.json

```

---

## 🧭 Routing

Routing is file-based and owned exclusively by `src/pages/`.

| Route                             | File                         | Description                        |
| --------------------------------- | ---------------------------- | ---------------------------------- |
| `/`                               | `index.astro`                | About / Bio                        |
| `/profile`                        | `profile.astro`              | Professional Profile               |
| `/404`                            | `404.astro`                  | 404 error page                     |
| `/thejournal`                     | `thejournal/index.astro`     | The Journal Home                   |
| `/thejournal/[slug]`              | `thejournal/[...slug].astro` | Individual publication             |
| `/thejournal/[vaultId]/[...slug]` | `thejournal/[...slug].astro` | A vault groups common publications |

---

## 📚 theJournal Collection System

- Give a quick overview of what is an astro collection
- Explain how the the astro collection is configured
- How publications and vaults are loaded (explain the script and their export)
- What is a publication
- What is a vault (name inspired from vaults in Obsidian), how is structured

## 📝 Frontmatter Schema

Defined in:

```ts
// src/content/config.ts
```

| Field         | Required | Description               |
| ------------- | -------- | ------------------------- |
| `title`       | Yes      | Display title             |
| `pubDate`     | Yes      | Used for sorting          |
| `description` | No       | Card preview              |
| `image`       | No       | Image of the publication  |
| `github`      | No       | Github repository         |
| `tags`        | No       | Defaults to []            |
| `order`       | No       | Default: 100 (for Vaults) |

---

## 🚢 Deployment

### Hosting

- Cloudflare Workers
- Auto-deploy from `master` branch

### DNS & SSL

Managed via Cloudflare.

### Analytics

- Plausible Analytics (planned)
- Do not implement tracking until officially integrated

---

## 🏗 Guiding Principles

- Static-first
- Minimal client JavaScript
- Directory-driven content behavior
- Strict build-time validation
- SPA experience without SPA cost
- Clear separation of concerns
