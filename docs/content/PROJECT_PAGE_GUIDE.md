# Project Showcase Page Guide

Project showcase pages are landing pages under `/projects/<slug>/`. They give a
reader a broad, compelling view of a project, then point toward its source, live
experience, and deeper Journal publications when those destinations exist.

The implementation is static-first. Each route is a hand-authored Astro page
using `ProjectLayout.astro`; project pages do not introduce a second content
collection or require browser JavaScript.

## Create a project page

Create `src/pages/projects/<slug>.astro` and pass one typed configuration object
to the shared layout:

```astro
---
import type { ProjectPageConfig } from "@appTypes/project";
import projectCover from "@assets/projects/example/cover.png";
import SectionHeader from "@components/ui/display/SectionHeader.astro";
import ProjectLayout from "@layouts/ProjectLayout.astro";

const project: ProjectPageConfig = {
  title: "Example project",
  eyebrow: "Developer Tooling",
  description:
    "A short hook that explains what the project does and why it is worth exploring.",
  image: projectCover,
  imageAlt: "The Example project dashboard showing a completed build",
  facts: [
    { label: "Role", value: "Design & Engineering" },
    { label: "Stack", value: "Astro · TypeScript" },
    { label: "Status", value: "Active" },
  ],
  links: {
    githubUrl: "https://github.com/example/project",
    liveUrl: "https://example.com",
    journalId: "example_project",
  },
};
---

<ProjectLayout project={project}>
  <section id="overview" aria-labelledby="overview-title">
    <SectionHeader id="overview-title" title="Why this project exists" />
    <!-- Project-specific Astro markup -->
  </section>
</ProjectLayout>
```

`albertoduran.astro` is the complete reference implementation. Copy its page
shape when a project needs more than the minimal example above.

## Configuration contract

| Field             | Required | Purpose                                                                                                       |
| :---------------- | :------- | :------------------------------------------------------------------------------------------------------------ |
| `title`           | Yes      | Hero heading, document title, and site label.                                                                 |
| `description`     | Yes      | Hero hook and SEO/social description.                                                                         |
| `image`           | Yes      | Imported local `ImageMetadata` used by the hero and social metadata.                                          |
| `imageAlt`        | Yes      | Meaningful description of the showcase image. Use an empty string only when the image is entirely decorative. |
| `eyebrow`         | No       | Short project category. Defaults to `Project Showcase`.                                                       |
| `facts`           | No       | Up to four compact `{ label, value }` facts. Omit the collection when it adds no useful context.              |
| `links.githubUrl` | No       | Full external URL for the source repository.                                                                  |
| `links.liveUrl`   | No       | Full external URL for the running project.                                                                    |
| `links.journalId` | No       | Existing standalone publication ID or vault-root ID from the Journal manifest.                                |

The layout renders only the supplied facts and actions. External actions open in
a new tab with `noopener noreferrer`; Journal actions stay within the site.

Journal references are validated during the build. A missing ID or a vault
child ID fails with an actionable error. A standalone publication adds only the
hero action. A vault root also adds the grouped vault section after the custom
body.

## Journal deep-dive CTA

When `links.journalId` is present, the hero renders the shared
`ProjectJournalCTA` rather than a generic button. Its visible language is fixed:

- Context label: `Technical deep dive`.
- Main action: `See how this project works`.
- Supporting promise: `Architecture, decisions, and implementation details`.

Keep this wording and visual hierarchy on future project pages. It explains the
destination to readers who do not already know what “The Journal” or a “vault”
means. The CTA uses a full-width primary surface, a book-like icon, and a
directional arrow so it reads as the main route into technical detail. It stays
an internal link and must not open a new tab.

Do not replace it with labels such as “Explore the Journal,” “Open vault,” or
“Learn more”; those labels describe the site structure or remain too vague
rather than telling the reader what they will learn.

## Body composition

The body is intentionally a normal Astro slot. Choose sections that explain the
project instead of forcing every project into the same content schema. Treat the
page as a sales narrative backed by technical evidence, not as shortened
documentation. It should be extensive in breadth: cover the important product
surfaces, capabilities, differentiators, and outcomes, but keep each explanation
short enough to preserve momentum.

Review the related Journal publications before writing. Extract the topics that
best communicate why the project matters, translate each one into a
reader-facing benefit, and link the summary to the publication that supports
it. The landing page creates the broad mental model; the Journal owns the full
implementation detail.

Use this sequence when the project supports it:

1. **Problem and promise:** explain why the project exists and what the reader
   or user receives. Pair the editorial overview with one focused `Callout`.
2. **Product surfaces and capabilities:** show the important ways people use
   the project. Use concise cards or lists so the page communicates range
   without becoming a feature manual.
3. **System model:** use one Mermaid diagram when relationships, boundaries, or
   sequence are easier to understand visually than as prose.
4. **Consequential decisions:** select the architecture and implementation
   choices that produce a visible benefit. Explain the effect, then link to the
   supporting technical publication.
5. **Experience and delivery:** cover the qualities readers or users feel—such
   as accessibility, resilience, performance, or continuity—and the pipeline
   that makes those qualities dependable. Use `Steps` only for a meaningful
   sequence.
6. **Outcome:** finish the authored body with a compact themed summary before
   the layout appends the vault for optional deep reading.

Avoid repeating the same claim in several sections. “More extensive” means a
wider and more useful project picture, not longer paragraphs or exhaustive
implementation notes.

## Evidence and visualization mindset

Display components provide visual rhythm, but each one must have a job:
`Callout` captures a consequence readers could miss, `Steps` explains ordered
delivery, and Mermaid explains relationships. Do not add a component only to
make the page longer.

Use ECharts only when the project has genuine quantitative evidence that exists
independently of its documentation, such as measured performance, adoption,
reliability, or business results. State exactly what the chart measures and
never invent numbers. If no meaningful project data exists, omit the chart.

The size of a Journal vault is never project evidence. Do not count or chart
publications, sections, tags, reading time, documentation coverage, or similar
content inventory as an outcome. The vault demonstrates depth through its
linked material; it does not need a scorecard.

Keep Mermaid source in the Astro page with `defineMermaidDiagram(String.raw...)`
and render it with `MermaidDiagram`. The build integration discovers those static
definitions, prepares the same themed SVG assets used by Journal Mermaid fences,
and keeps the established open and expand controls. When a justified ECharts
figure is present, default to static SVG and opt into hydration only when
interaction materially helps.

Use one `h1` only; the layout owns it. Give every body section an `h2`, stable
`id`, and matching `aria-labelledby`. Use `SectionHeader` for ordinary section
headings and keep the final vault section under layout control.

## Visual and accessibility rules

- Import local images from `src/assets`; do not use raw public paths for hero
  media. The layout generates optimized AVIF/WebP output.
- Write image alternative text for what the image contributes, not its file
  name. Do not repeat the project title without describing the visual.
- Use DaisyUI semantic colors and theme-aware Tailwind classes. Never hardcode
  hex colors or Tailwind gray scales.
- Pair semantic surfaces and content tokens, especially `bg-primary` with
  `text-primary-content`.
- Keep generous spacing, readable line lengths, and responsive single-column
  fallbacks. Verify that the page does not create horizontal overflow.
- Prefer static HTML and CSS. Add client JavaScript only as progressive
  enhancement and only when an existing component cannot express the behavior.
- Make link labels describe their destination and keep visible focus behavior.

## Vault behavior

The layout reads the existing Journal manifest; it never duplicates or rewrites
Journal content. The vault root is linked from the hero and omitted from the
list below. Direct publications appear in a root group. Nested sections retain
their manifest order and path, and each section list begins with its index page
followed by its direct child publications.

Treat this final section as an invitation to investigate, not a measure of the
project. The authored landing-page body should already explain the project's
scope and strongest selling points. The vault then lets interested readers
choose where to go deeper without forcing that detail into the main narrative.

Every row uses the shared `List` component and includes the publication title,
read-time and tags when available, its manifest description, and an internal
`Read page` action.

## Make a landing page canonical

Featured project cards continue to use their Journal routes until a complete
landing page is ready. After the new route builds and its links have been
reviewed, register it in `src/data/project_pages.ts`:

```ts
export const projectLandingRoutes = {
  example_project: "/projects/example/",
} as const satisfies Record<string, ProjectLandingRoute>;
```

The key is the Journal entry ID used by the featured project card. Unregistered
entries automatically fall back to `/thejournal/<id>/`, so partial migrations
cannot create broken project links.

## Verification

Run the focused quality checks from the repository root:

```bash
npm run check
npm test -- tests/unit/project-pages.test.ts
npm run test:e2e
```

For a new page, inspect mobile and desktop layouts in both themes. Confirm the
hero image, facts, optional actions, heading hierarchy, internal Journal links,
external-link safety attributes, and horizontal overflow behavior.
