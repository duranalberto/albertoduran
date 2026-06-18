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

Published journal entries should display between 8 minutes and 16
minutes of reading time. As priority, prefer between 12 and 16, decide depending of the content being redacted.

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
Use `.agents/skills/mdx-blog-writer` for MDX blog writing,
formatting, humanizing, frontmatter hygiene, and pre-delivery validation. Use
`.agents/skills/design-doc-mermaid` for Mermaid diagram design,
styling, validation, and export guidance.

This section only defines project-specific authoring rules for `src/thejournal/`:

- Author journal entries as reader-facing publications, not private notes,
  maintainer scratchpads, or source-only checklists.
- Keep implementation notes in `docs/` unless the journal entry intentionally
  teaches that implementation to readers.
- Keep code, fixtures, data, and helper objects that exist only for one
  publication inside that publication. Do not place publication-only material in
  shared project directories such as `src/data`, `src/lib`, or integrations.
- Prefer ordinary Markdown and confirmed local MDX components over custom page
  code.
- Use the visual selection guide below to choose between Mermaid and ECharts.
  Use `docs/ECHARTS_MDX_CHARTS.md` for the ECharts component API, build-time
  SVG artifacts, and opt-in chart enhancement rules.
- Use the `thejournal` frontmatter schema and publishing policy from this guide,
  not the generic frontmatter template from `mdx-blog-writer`.
- When generic writing, MDX, or diagram rules conflict with this guide or
  `src/content/processors/`, follow the project-specific rule here and update
  the reusable skill only if the change remains project-agnostic.

## Visual Selection Guide

Choose Mermaid when the visual explains structure: order, ownership,
dependency, lifecycle, or relationship. Choose ECharts when the visual explains
data: values, trends, proportions, distributions, correlations, quantitative
flows, or market series.

If the visual has no measured values, start with Mermaid. If the visual depends
on numeric values, start with ECharts. If an article needs both, split the work:
use Mermaid for how the system works and ECharts for what happened, how much,
how often, or how the values changed.

### Mermaid Diagram Use Cases

Use Mermaid code fences for diagrams that should remain author-friendly inside
MDX and render through the journal build pipeline as theme-aware SVG. Place each
diagram near the section it clarifies, introduce it with one sentence, and keep
one concept per diagram.

Do not add Mermaid `%%{init: ...}%%` theme blocks or custom `themeVariables`.
The site owns Mermaid theming. Use `.agents/skills/design-doc-mermaid` when a
diagram needs careful node shapes, grouping, contrast, validation, or export
guidance.

| Reader needs to understand                                 | Use                                  | Good fit                                                                 | Prefer another visual when                                  |
| :--------------------------------------------------------- | :----------------------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------- |
| A process, workflow, pipeline, approval path, or user flow | `flowchart TD` or `flowchart LR`     | Ordered steps with branches, loops, and handoffs                         | The content is just a checklist with no branching           |
| A sequence of calls over time                              | `sequenceDiagram`                    | API requests, service interactions, auth flows, retries, callbacks       | The reader needs a static dependency map instead            |
| System components and relationships                        | `graph TB` with subgraphs            | Layered architecture, bounded contexts, ownership, module relationships  | The main point is numeric performance or usage              |
| Infrastructure or deployment topology                      | `graph TB` or deployment-style graph | Cloud resources, Kubernetes workloads, networks, ingress, queues, stores | The article is comparing measured infrastructure metrics    |
| Data entities and relationships                            | `erDiagram`                          | Domain models, schema relationships, cardinality                         | The article is showing row counts, distributions, or trends |
| Entity lifecycle or status changes                         | `stateDiagram-v2`                    | Job states, publication states, retry states, order status               | A step-by-step process is clearer as a flowchart            |
| Class, interface, or object-oriented structure             | `classDiagram`                       | Inheritance, composition, public methods, type responsibility            | Runtime behavior is the focus                               |
| Project or release schedule                                | `gantt`                              | Milestones, dependencies, rough delivery windows                         | The values are measured over time and need a chart          |
| Concept map or taxonomy                                    | `mindmap`                            | Explaining categories, mental models, or nested ideas                    | Relationships are directional, ordered, or weighted         |

### ECharts Chart Use Cases

Use the `EChart` MDX component when the publication needs a data visualization.
Prefer the option builders in `src/integrations/echarts/options.ts` before
writing raw ECharts options. The local gallery at
`src/thejournal/echarts_dummy_gallery.mdx` shows every supported chart pattern
in a real journal article.

Every chart needs a useful `title`, `caption` when helpful, `description` for
accessibility, and explicit dimensions that fit the article. Keep
`render="svg-inline"` as the default. Use `render="svg-file"` only for repeated
charts or large static output. Use hydration only when browser interaction helps
the reader inspect the chart.

| Reader needs to compare                    | Use                                                                 | Good fit                                                            | Prefer another visual when                              |
| :----------------------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------ | :------------------------------------------------------ |
| Change across time or ordered categories   | `lineChartOption`                                                   | Traffic, revenue, latency, counts, performance over releases        | Categories are unrelated; use a bar chart               |
| Change with visual weight under the line   | `lineChartOption({ area: true })`                                   | Volume-like trends, cumulative-looking movement, signup growth      | Exact point comparison matters more than trend shape    |
| Category values                            | `barChartOption`                                                    | Output size by asset type, counts by status, score by tool          | The categories form a time sequence; use a line chart   |
| Ranked categories or long labels           | `barChartOption({ horizontal: true })`                              | Top items, checklist counts, long category names                    | The order is a process; use Mermaid                     |
| Part-to-whole share with a few categories  | `pieChartOption` or `pieChartOption({ donut: true })`               | Traffic mix, coverage mix, budget share                             | There are many slices, negative values, or a time trend |
| Rough proportional emphasis                | `pieChartOption({ rose: "area" })`                                  | Editorial effort, attention share, coarse contribution              | Readers need precise comparison                         |
| Relationship between two numeric variables | `scatterChartOption`                                                | Word count vs read time, latency vs payload size                    | One axis is categorical                                 |
| Distribution of one numeric variable       | `histogramChartOption`                                              | Build times, paragraph lengths, response sizes                      | The source values are categories                        |
| Intensity across two categorical axes      | `heatmapChartOption`                                                | Day-by-time activity, module-by-signal counts, matrix-style density | The reader needs a small exact table instead            |
| Correlation matrix                         | `correlationHeatmapChartOption`                                     | Signal relationships from `-1` to `1`                               | The article wants to imply causation                    |
| Hierarchical numeric weight                | `treemapChartOption`                                                | Effort by area, size by module, cost by category and subcategory    | The article describes a relationship without values     |
| Quantified flow between stages             | `sankeyChartOption`                                                 | Conversion paths, traffic movement, pipeline volume                 | The flow has no measured weights; use Mermaid           |
| Spread across groups                       | `boxplotChartOption`                                                | Latency ranges, build duration spread, benchmark distribution       | The article needs the exact path of each point          |
| Market OHLC data with volume               | `candlestickWithVolumeOption` or `ohlcChartOption`                  | Trading sessions, price movement, price range                       | The data is not financial OHLC data                     |
| Market indicators                          | `macdChartOption`, `rsiChartOption`, or `bollingerBandsChartOption` | Momentum, trend, volatility notes for finance articles              | The article needs a plain trend line                    |
| Market liquidity                           | `depthChartOption` or `orderBookChartOption`                        | Bid/ask depth, cumulative size, order book levels                   | The data is a general category comparison               |

### ECharts Rendering And Enhancement

Default to static charts. A reader with JavaScript disabled should still see the
chart and understand the article.

- Use `hydrate="none"` for ordinary article charts.
- Use `hydrate="load"` only when the first viewport needs immediate chart
  interaction.
- Use `hydrate="idle"` when interaction is useful but not urgent.
- Use `hydrate="visible"` for below-the-fold charts.
- Use `hydrate="media"` when enhancement only helps at specific viewport sizes.
- Keep `clientOption` JSON-compatible for enhanced charts, or use
  `optionClientPreset` for supported formatter callbacks.

When a visual could be either Mermaid or ECharts, ask whether the reader needs
to inspect relationships or compare measured values. Relationships belong in
Mermaid. Measurements belong in ECharts.

## Publishing Checks

Before publishing, run the relevant checks from `docs/TESTING_STRATEGY.md`.
For content model or vault changes, include the manifest unit tests. For visible
article behavior, include the relevant build or browser checks.
