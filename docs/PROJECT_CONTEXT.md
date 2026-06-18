# albertoduran Project Context

This repository is a static-first Astro publishing site for albertoduran.com. It combines a personal portfolio, profile pages, and a long-form MDX journal with directory-driven vault navigation.

## Overview

The project is designed to:

- Deliver static HTML with strong SEO and performance.
- Provide smooth internal navigation with Astro view transitions.
- Support standalone publications and nested journal vaults.
- Keep client-side JavaScript limited to progressive enhancement.
- Validate content and generated routes at build time.

Astro is configured with `output: "static"` in `astro.config.mjs`. Runtime browser code exists for enhancements such as theme persistence, Mermaid diagram interactions, Atlas schedule rendering, and article navigation behavior.

## Tech Stack

| Area              | Current implementation                                         |
| :---------------- | :------------------------------------------------------------- |
| Framework         | Astro `^6.4.4`                                                 |
| Content           | Astro content collections and MDX                              |
| Styling           | Tailwind CSS `^4.3.0` and DaisyUI `^5.5.20`                    |
| Diagrams          | Custom Mermaid integration that emits themed static SVG assets |
| HTML output       | Custom HTML minifier integration                               |
| Tests             | Astro Check, Vitest, and Playwright                            |
| Deployment config | Cloudflare Workers Assets via `wrangler.json`                  |

## Architecture

### Static-First Rendering

All routes are generated as static pages. Build-time integrations handle content processing, Mermaid rendering, image optimization, and HTML minification before the site is deployed.

Client-side scripts are loaded only where they improve the experience:

- `src/runtime/managers/theme_manager.ts` keeps light/dark theme state synchronized.
- `src/runtime/elements/on-this-page.ts` enhances article heading navigation.
- `src/runtime/elements/mermaid-diagram-shell.ts` handles Mermaid diagram expansion and theme-specific assets.
- `src/runtime/elements/atlas-schedule.ts` enhances Atlas schedule display.

Mermaid rendering has release-specific cache and CSS cascade requirements. See
`docs/MERMAID_RENDERING.md` before changing the Mermaid integration, Mermaid
theme output, diagram shell runtime, or diagram styles.

### View Transitions

`BaseLayout.astro` owns the shared document shell, view-transition setup, theme bootstrap, and runtime imports. Internal navigation should preserve the SPA-like feel while still serving static pages.

### Content Processing

The journal uses the `thejournal` content collection in `src/content.config.ts`. Source files live under `src/thejournal/`.

Journal entries are public-facing publications. They should help readers
understand a project, design decision, workflow, or lesson. They are not the
place for internal maintainer runbooks, source-anchor checklists, or change
instructions unless the article intentionally teaches that workflow to a public
audience. Follow `docs/THEJOURNAL_PUBLICATION_GUIDE.md` before publishing or
restructuring any entry under `src/thejournal/`.

Published journal entries should display as at least 8 minutes and less than 16
minutes of reading time. The manifest computes this from prose words and code
fence lines, so authors should target a displayed read time of 8 to 15 minutes.

The manifest builder in `src/content/processors/thejournal-manifest.ts` maps raw collection entries into:

- Standalone publication contexts.
- Vault root contexts.
- Nested vault item trees.
- Previous and next links.
- Read-time estimates.
- Inherited vault images for child entries when needed.

## Project Structure

```text
albertoduran/
├─ .devcontainer/           # Node 22 VS Code DevContainer
├─ .agents/                 # Project-local Codex skills
├─ .github/workflows/       # Quality workflow
├─ docs/                    # Internal project documentation
├─ public/                  # Static public assets and headers
├─ src/
│  ├─ assets/               # Local images and fonts
│  ├─ components/           # Astro components by feature area
│  ├─ content/              # Journal processors and manifest logic
│  ├─ data/                 # Site, profile, icon, and manifest data
│  ├─ integrations/         # Mermaid and HTML minifier integrations
│  ├─ layouts/              # Shared Astro layouts
│  ├─ pages/                # File-based route entry points
│  ├─ runtime/              # Browser-side progressive enhancements
│  ├─ styles/               # Global CSS, themes, utilities, and page styles
│  ├─ thejournal/           # MDX publications and vaults
│  ├─ types/                # Shared TypeScript types
│  └─ utils/                # Shared utilities
├─ astro.config.mjs
├─ package.json
├─ playwright.config.ts
├─ vitest.config.ts
└─ wrangler.json
```

## Routes

Routing is file-based and owned by `src/pages/`.

| Route                    | File                                   | Description                                                 |
| :----------------------- | :------------------------------------- | :---------------------------------------------------------- |
| `/`                      | `src/pages/index.astro`                | Home page                                                   |
| `/profile/`              | `src/pages/profile.astro`              | Professional profile                                        |
| `/404/`                  | `src/pages/404.astro`                  | Static 404 page                                             |
| `/thejournal/`           | `src/pages/thejournal.astro`           | Journal index                                               |
| `/thejournal/[...slug]/` | `src/pages/thejournal/[...slug].astro` | Standalone articles, vault roots, and nested vault articles |

Astro is configured with `trailingSlash: "always"`, so generated canonical URLs include trailing slashes.

## theJournal Content Model

The journal collection is configured in `src/content.config.ts`:

```ts
const thejournal = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/thejournal",
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        github: z.string().optional(),
        image: image().optional(),
        description: z.string().default("Without description available."),
        pubDate: z.coerce.date(),
        updatePubDate: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        order: z.number().default(100),
        draft: z.boolean().optional(),
      })
      .refine(
        (data) => {
          if (data.updatePubDate && !data.pubDate) {
            return false;
          }
          return true;
        },
        {
          message:
            "updatePubDate requires pubDate to be set. Add a pubDate field to this entry.",
          path: ["updatePubDate"],
        },
      ),
});
```

| Field           | Required                                                               | Description                                                             |
| :-------------- | :--------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| `title`         | Yes                                                                    | Display title                                                           |
| `pubDate`       | Yes                                                                    | Publication date used for sorting                                       |
| `updatePubDate` | No                                                                     | Last update date                                                        |
| `description`   | No                                                                     | Card and metadata summary; defaults when omitted                        |
| `image`         | Required by manifest rules for standalone publications and vault roots | Publication image; child vault entries can inherit the vault root image |
| `github`        | No                                                                     | Related GitHub repository URL                                           |
| `tags`          | No                                                                     | Tag list; defaults to `[]`                                              |
| `order`         | No                                                                     | Manual ordering value; defaults to `100`                                |
| `draft`         | No                                                                     | Set `draft: true` to exclude a publication from all generated output    |

A vault is any first-level folder under `src/thejournal/` with an `index.mdx`. Nested folders can form sub-vault sections when they also include an `index.mdx`.

Vaults and nested vault sections must contain at least one child publication
beyond their own index file. Do not create a vault or subdirectory that contains
only `index.md` or `index.mdx`; use a standalone root-level publication file
instead.

The schema accepts `image` as optional because vault child entries can inherit the vault root image. The manifest builder enforces images for standalone publications and vault roots during build-time processing.

Draft filtering is handled before manifest generation and static path generation. A standalone entry with `draft: true` is excluded from `entryManifest`, journal indexes, navigation, pagination, and generated pages. A draft `index.md` or `index.mdx` excludes that index and every entry below its path, so a vault root draft hides the whole vault and a nested section draft hides that section subtree.

## Testing and CI

The test strategy lives in `docs/TESTING_STRATEGY.md`.

Project-local AI skills live in `.agents/skills/` and are documented in
`docs/AI_SKILLS.md`.

Required quality commands:

```bash
npm run check
npm test
npm run test:e2e
```

`.github/workflows/quality.yml` runs the same quality gate on pull requests and pushes to `dev` or `master`.

## Deployment

The production build is static output in `dist/`.

Cloudflare Workers Assets settings live in `wrangler.json`:

- Worker name: `albertoduran`
- Asset directory: `dist`
- 404 handling: `404-page`

DNS, SSL, and production traffic are managed through Cloudflare.

## Guiding Principles

- Static-first pages before runtime behavior.
- Progressive enhancement over mandatory client JavaScript.
- Directory-driven content behavior.
- Strict build-time validation.
- Smooth internal navigation without turning the app into a full SPA.
- Clear ownership boundaries between content, components, runtime enhancement, and integrations.
