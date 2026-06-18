# theJournal Publication Guide

This guide is the publishing checklist for entries under `src/thejournal/`.
Follow it before adding, moving, or revising a public journal publication.

`theJournal` is a blog-style publication area. Entries are meant to be read by
other people, not used as private notes, maintainer scratchpads, or source-only
checklists. A good publication should teach a reader something useful about a
project, design decision, workflow, or lesson.

## Source of Truth

The executable publishing rules live in `src/content/processors/`.

- `src/content/processors/thejournal.ts` loads the journal collection and exports
  `publishedEntries`, `entryManifest`, and `vaultsManifest`.
- `src/content/processors/thejournal-manifest.ts` defines publication policy:
  draft filtering, vault grouping, nested section validation, read-time
  measurement, image requirements, image inheritance, ordering, pagination, and
  path resolution.

Documentation must describe those processor rules instead of inventing a
parallel structure. If this guide and the processors disagree, update the guide
or the implementation so they match.

## Publication Length

Published journal entries should display as at least 8 minutes and less than 16
minutes of reading time. In practice, target a displayed read time of 8 to 15
minutes.

The manifest estimates reading time from the MDX body using prose words and code
fence lines. As a rough prose-only range, this means about 1,400 to 3,000 words,
then adjust for dense code samples, diagrams, and tables.

## Required Frontmatter

Every publication candidate must satisfy the `thejournal` collection schema in
`src/content.config.ts`.

```yaml
---
title: "Clear publication title"
description: "Reader-facing summary for cards and metadata."
image: "../assets/thejournal/stock/01.avif"
tags: ["project", "astro"]
pubDate: 2026-06-18
order: 100
draft: true
---
```

Required by schema:

- `title`
- `pubDate`

Required by publishing policy:

- `image` for standalone publications.
- `image` for vault root indexes.

Optional fields:

- `description`, with a default fallback when omitted.
- `github`, when the publication has a related repository.
- `tags`, defaulting to `[]`.
- `order`, defaulting to `100`.
- `updatePubDate`, when an already published entry changes materially.
- `draft`, when an entry or section should stay out of generated output.

## Standalone Publications

Use a root-level MDX file when the publication is a single article.

```text
src/thejournal/ai_ops_agent.mdx
src/thejournal/gcp_setup_guide.mdx
```

Standalone publications must declare their own `image`. They become routes such
as `/thejournal/ai_ops_agent/`.

Do not put a single article in `src/thejournal/<slug>/index.mdx`. A folder with
an index is treated as a vault, and vaults must contain child publications.

## Vault Publications

Use a first-level folder only when the publication is a multi-entry vault.

```text
src/thejournal/mlscraper/index.mdx
src/thejournal/mlscraper/runtime_flow.mdx
src/thejournal/building_albertoduran/index.mdx
src/thejournal/building_albertoduran/foundations/index.mdx
src/thejournal/building_albertoduran/foundations/devcontainer.mdx
```

Vault rules:

- A top-level vault folder must include `index.md` or `index.mdx`.
- A vault must contain at least one child publication beyond its root index.
- A vault root index must declare an `image`.
- Vault child entries can inherit the root image when they omit `image`.
- Nested vault sections must include `index.md` or `index.mdx`.
- Nested vault sections must contain at least one child publication beyond their
  own index.
- A subdirectory with only an index file is not allowed.

If a folder only needs one page, make it a standalone publication at
`src/thejournal/<slug>.mdx` instead of a vault.

## Draft Behavior

Draft behavior is scoped by location.

- `draft: true` on a standalone entry hides that entry.
- `draft: true` on a vault root index hides the whole vault.
- `draft: true` on a nested section index hides that section and every entry
  below it.

Draft entries are removed from generated routes, manifests, indexes,
navigation, and pagination.

## Authoring Structure

Journal publications should read like finished blog posts for external readers.

- Start with a hook paragraph before the first heading.
- Use clear H2 sections and H3 subsections when the topic needs structure.
- Prefer ordinary Markdown and MDX over custom page code.
- Add diagrams, tables, code blocks, or screenshots only when they help the
  reader understand the subject.
- Keep internal implementation notes in `docs/` unless the journal entry is
  intentionally teaching that implementation to readers.

Before publishing, run the relevant checks from `docs/TESTING_STRATEGY.md`.
For content model or vault changes, include the manifest unit tests. For visible
article behavior, include the relevant build or browser checks.
