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

There is no fixed reading-time band. Write dense, non-padded prose at the length the
material genuinely supports, and merge rather than pad. A page whose subject is thin
should be short and merged into a neighbor, not stretched to hit a minute count.

The manifest estimates reading time from the MDX body using prose words and code
fence lines, as `ceil(proseWords / 200 + codeLines / 40)`. Treat that number as a
readout of density, not a target to engineer toward.

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
formatting, frontmatter hygiene, and pre-delivery validation. Use
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
  Use `docs/components/MARKDOWN_MDX_CODE_FENCES.md` for `.md` / `.mdx`
  Mermaid, ECharts, DaisyUI fence syntax, and explicit LaTeX display math. Use
  `docs/components/ECHARTS_MDX_CHARTS.md` for the ECharts component API,
  build-time SVG artifacts, and opt-in chart enhancement rules.
- Use the `thejournal` frontmatter schema and publishing policy from this guide,
  not the generic frontmatter template from `mdx-blog-writer`.
- When generic writing, MDX, or diagram rules conflict with this guide or
  `src/content/processors/`, follow the project-specific rule here and update
  the reusable skill only if the change remains project-agnostic.

## Publication UI Components

Journal authors can add `callout`, `chat-bubble`, `list`, `mockup-browser`,
`mockup-phone`, `mockup-window`, and `steps` display components when a
publication needs a recognizable interface pattern that ordinary Markdown
cannot express clearly. These components are presentation tools, not decoration.
Introduce each component in the surrounding prose and explain what the reader
should notice.

Author these components with a `daisyui` code fence. The fence needs no imports,
is validated at build time, and keeps the publication data-driven. Use
`docs/components/MARKDOWN_MDX_CODE_FENCES.md` for the full fence schema and every
component's fields, and `src/thejournal/dummy_gallery.mdx` for a rendered
example of each one.

```daisyui
{
  "component": "callout",
  "variant": "information",
  "title": "Build context",
  "content": "The generated report uses fixture data and should not be treated as a live production result."
}
```

Reach for the imported Astro component (`@components/ui/display/<Name>.astro`)
only when a fence cannot express the content: named slots with rich MDX, raw
HTML children, custom icons, or media that must flow through Astro's image
pipeline. The dedicated component guides document that fallback API.

Every component applies `not-prose`, so content placed inside it needs its own
spacing and typography classes. They render static HTML and do not add
client-side state, navigation, message streaming, or application behavior.

The `Use` column names the display component. In a `daisyui` fence, its
`component` field is the lowercase, hyphenated form: `Callout` becomes
`"component": "callout"`, `ChatBubble` becomes `"component": "chat-bubble"`, and
so on.

| Publication needs to show                             | Use             | Good fit                                                               | Prefer another format when                                |
| :---------------------------------------------------- | :-------------- | :--------------------------------------------------------------------- | :-------------------------------------------------------- |
| Supporting context, risk, caution, or failure detail  | `Callout`       | Important fact, prerequisite, risky action, irreversible consequence   | The information belongs in ordinary prose or changes live |
| A short exchange or message state                     | `ChatBubble`    | Support dialogue, agent response, review feedback, system message      | The text is a quotation from prose; use a blockquote      |
| An information-rich collection of peer items          | `List`          | Resources, artifacts, decisions, services, people, status inventory    | The items are simple bullets or require exact comparison  |
| A web page where its route or browser context matters | `MockupBrowser` | Hosted report, route-specific UI, browser-visible error, local preview | Browser chrome or a URL adds no explanatory value         |
| A mobile interface or narrow-screen screenshot        | `MockupPhone`   | App screen, responsive UI, mobile workflow result                      | Device framing adds no meaning; use a normal image        |
| A generic desktop application or bounded output       | `MockupWindow`  | Dashboard, generated report, application surface, command result       | A visible browser route is part of the explanation        |
| A linear sequence or current progress state           | `Steps`         | Release stages, onboarding, migration progress, branch-free checklist  | The flow branches, loops, or has handoffs; use Mermaid    |

Use the dedicated component guides for complete props, slots, styling hooks,
and accessibility contracts:

- `docs/components/MARKDOWN_MDX_CODE_FENCES.md` for Markdown / MDX fence syntax
- `docs/components/CALLOUT.md`
- `docs/components/CHAT.md`
- `docs/components/LIST.md`
- `docs/components/MOCKUP_BROWSER.md`
- `docs/components/MOCKUP_PHONE.md`
- `docs/components/MOCKUP_WINDOW.md`
- `docs/components/STEPS.md`

### Callout Use Cases

Use `Callout` for supporting information readers could reasonably miss while
scanning: prerequisites, interpretation notes, risky operations, irreversible
consequences, and visible failure explanations. The variant provides a default
title and icon; a custom title adds specificity without changing its severity.

```daisyui
{
  "component": "callout",
  "variant": "information",
  "title": "Build context",
  "content": "The generated report uses fixture data and should not be treated as a live production result."
}
```

```daisyui
{
  "component": "callout",
  "variant": "warning",
  "title": "Before deploying",
  "content": [
    {
      "type": "list",
      "items": [
        "Confirm the target environment.",
        "Keep the previous artifact available for rollback."
      ]
    }
  ]
}
```

Use `caution` when an action may be destructive or difficult to reverse, and
`error` when explaining a known failure state or failed outcome. These are
static publication notes, not live alerts.

```daisyui
{
  "component": "callout",
  "variant": "caution",
  "title": "Irreversible migration",
  "content": "Applying this migration removes legacy identifiers. Take a verified backup before continuing."
}
```

```daisyui
{
  "component": "callout",
  "variant": "error",
  "title": "Import failed",
  "content": "The provider rejected the file because its schema version is unsupported."
}
```

Use ordinary prose when the information belongs in the main reading flow and a
blockquote when reproducing someone else's words. Live validation, changing
status, toast messages, and dismissible alerts belong to application feedback
components with appropriate announcement behavior.

### Chat Bubble Use Cases

Use `ChatBubble` when the identity, direction, or delivery state of a message is
part of the explanation. A pair of aligned bubbles can reconstruct a concise
conversation without presenting a full chat application.

For a single message, use the `daisyui` `chat-bubble` fence shown after the
conversation. The multi-bubble example below wraps two bubbles in a layout
element and uses `<time>` metadata, so it stays as the Astro component fallback.

```mdx
<div className="my-8 space-y-3" aria-label="Review conversation">
  <ChatBubble align="start" aria-label="Message from reviewer">
    <strong slot="header">Reviewer</strong>
    Why does this request retry after a 429 response?
    <time slot="footer" datetime="2026-06-19T09:14:00Z">09:14 UTC</time>
  </ChatBubble>

  <ChatBubble
    align="end"
    color="primary"
    aria-label="Reply from maintainer"
  >
    <strong slot="header">Maintainer</strong>
    The provider's retry hint takes precedence over local backoff.
    <span slot="footer">Resolved</span>
  </ChatBubble>
</div>
```

A single semantic bubble works well for a service or build message. It should
still have a visible sender and an accessible label.

```daisyui
{
  "component": "chat-bubble",
  "color": "success",
  "aria-label": "Build service message",
  "bubbleClass": "font-mono",
  "header": ["Build service"],
  "content": "70 pages generated successfully.",
  "footer": ["Completed in 1m 37s"]
}
```

Do not use chat bubbles for long interviews, ordinary quotations, or every
paragraph in a conversational article. Keep exchanges short enough that message
alignment remains easy to scan. Live chat behavior and announcements belong to
a separate conversation container, not to individual bubbles.

### List Use Cases

Use `List` when a publication needs to scan several peer items that each carry
more context than a normal bullet: for example release artifacts, services and
owners, architectural decisions, people, useful resources, or a status
inventory. Introduce what the collection represents in the surrounding prose.

Author list rows with the `daisyui` `list` fence, shown below. Rows whose media
must come from Astro's image pipeline use the Astro component fallback in the
following example.

```daisyui
{
  "component": "list",
  "aria-label": "Release artifacts",
  "class": "my-8 shadow-sm",
  "items": [
    {
      "title": "Static site bundle",
      "subtitle": "dist/ · 4.8 MB",
      "description": "HTML, CSS, client enhancements, and optimized images.",
      "media": { "kind": "marker", "label": "01" },
      "status": { "label": "Verified", "color": "success" },
      "action": { "label": "Build notes", "href": "/thejournal/build-output/" }
    },
    {
      "title": "Accessibility report",
      "subtitle": "Automated and manual checks",
      "media": { "kind": "marker", "label": "02" },
      "status": { "label": "Review", "color": "warning" }
    }
  ]
}
```

Local images can identify people, projects, or services when the visual makes
the rows easier to recognize. Import the asset through Astro and include useful
alternative text unless the image repeats the title exactly.

```mdx
import maintainerPhoto from "@assets/thejournal/example/maintainer.png";

<List
  aria-label="Service ownership"
  items={[
    {
      title: "Publication pipeline",
      subtitle: "Maintained by the editorial platform team",
      description: "Owns content validation, route generation, and manifests.",
      media: {
        kind: "image",
        src: maintainerPhoto,
        alt: "Editorial platform team",
      },
      status: { label: "Active", color: "info" },
      action: {
        label: "Reference",
        href: "https://example.com/platform",
        external: true,
        ariaLabel: "Open the platform reference in a new tab",
      },
    },
  ]}
/>
```

Use ordinary Markdown for short bullets, a table when readers must compare
exact fields across columns, `Steps` when order or current progress matters, and
Mermaid when items connect through dependencies, branches, or handoffs. The
component supports one link action per row; application controls and action
toolbars belong in a purpose-built interface.

### Mockup Phone Use Cases

Use `MockupPhone` when the device-shaped viewport helps readers understand a
mobile layout, crop, or responsive behavior. For a real screenshot, import the
asset through Astro and let the image remain the direct child of the display.

For text-only or simple markup content, use the `daisyui` `mockup-phone` fence.
The screenshot examples below import through Astro's image pipeline, so they use
the Astro component fallback.

```mdx
import { Image } from "astro:assets";
import mobileDashboard from "@assets/thejournal/example/mobile-dashboard.png";

<MockupPhone aria-label="Mobile dashboard screenshot">
  <Image
    src={mobileDashboard}
    alt="Mobile dashboard showing weekly activity and two unread alerts"
    widths={[320, 462]}
    sizes="(max-width: 462px) 100vw, 462px"
  />
  <span slot="caption">The dashboard at the narrow mobile layout.</span>
</MockupPhone>
```

The display slot can also demonstrate a simplified, theme-aware UI state
without adding an image.

```mdx
<MockupPhone
  aria-label="Mobile offline state"
  displayClass="bg-base-200"
  phoneClass="shadow-2xl"
>
  <div className="grid h-full place-items-center p-8 text-center">
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-warning">
        Offline
      </p>
      <p className="mt-3 text-lg text-base-content">
        Saved changes will sync when the connection returns.
      </p>
    </div>
  </div>
  <span slot="caption">The application preserves work during an outage.</span>
</MockupPhone>
```

Do not add a phone frame to every portrait image. Use a normal responsive image
when the device boundary, camera notch, and viewport ratio do not help the
reader understand the interface.

### Mockup Browser Use Cases

Use `MockupBrowser` when the visible route, hosted origin, or browser context is
part of what the reader must understand. Good examples include a route-specific
UI, hosted report, authentication redirect, browser-visible failure, or local
preview. Use `MockupWindow` when the same content only needs a desktop boundary.

For text-only content, use the `daisyui` `mockup-browser` fence with a `url` and
`content`. The screenshot example below imports through Astro's image pipeline,
so it uses the Astro component fallback.

```mdx
import { Image } from "astro:assets";
import valuationScreenshot from "@assets/thejournal/example/valuation.png";

<MockupBrowser
  url="https://reports.example.com/valuation/ACME"
  aria-label="Hosted valuation report"
  browserClass="shadow-2xl"
>
  <Image
    src={valuationScreenshot}
    alt="Valuation report showing an estimated fair value of 184 dollars"
    widths={[640, 960, 1280]}
    sizes="(max-width: 1024px) 100vw, 960px"
  />
  <span slot="caption">
    The generated report at its shareable production route.
  </span>
</MockupBrowser>
```

Use the custom toolbar for environmental context that a single URL cannot
express clearly. Keep it compact; it is explanatory chrome rather than a real
browser control surface.

```mdx
<MockupBrowser aria-label="Local report preview">
  <div slot="toolbar" className="flex min-w-0 items-center gap-2">
    <span className="badge badge-warning">Preview</span>
    <span className="truncate font-mono text-sm">
      localhost:4321/reports/ACME
    </span>
  </div>

  <div className="grid min-h-64 place-items-center bg-base-200 p-8">
    Report preview ready
  </div>
</MockupBrowser>
```

Direct screenshots in browser, phone, and window mockups are intentionally
non-draggable. Images nested inside composed interfaces keep their normal
pointer behavior so links and controls remain usable. Do not present the static
address display as navigation or an editable field.

### Mockup Window Use Cases

Use `MockupWindow` for desktop application states, generated reports, or visual
output that benefits from a clear boundary but does not need browser chrome.
The optional header should name the surface rather than imitate a browser
toolbar; switch to `MockupBrowser` when the route or hosted origin matters.

For text or preformatted content, use the `daisyui` `mockup-window` fence (a
string, `paragraph`, or `pre` content block). The examples below use named slots
and raw markup, so they use the Astro component fallback.

```mdx
<MockupWindow
  aria-labelledby="valuation-preview-title"
  windowClass="shadow-2xl"
  bodyClass="grid min-h-72 place-items-center"
>
  <strong id="valuation-preview-title" slot="header">Valuation summary</strong>

<div className="grid gap-2 text-center">
  <span className="text-sm text-base-content/70">Estimated fair value</span>
  <strong className="text-4xl text-success">$184.20</strong>
</div>

  <span slot="caption">The summary surface after a successful model run.</span>
</MockupWindow>
```

Class hooks can turn the same frame into a compact status or terminal-like
result while preserving the shared window structure.

```mdx
<MockupWindow
  aria-label="Migration command result"
  class="mx-auto max-w-3xl"
  contentClass="bg-neutral text-neutral-content"
  headerClass="font-mono"
  bodyClass="font-mono text-sm"
>
  <span slot="header">migration.log</span>
  <pre className="m-0 whitespace-pre-wrap bg-transparent p-0 text-inherit">
    {`✓ schema checked
✓ 18 migrations applied
✓ database ready`}
  </pre>
</MockupWindow>
```

Use the existing fenced-code renderer for source code readers need to copy or
study. A mockup window is appropriate when the rendered result or application
context is the point.

### Steps Use Cases

Use `Steps` for a linear, branch-free sequence or a snapshot of current
progress. `currentStep` is 1-based and colors the path through the current item.

```daisyui
{
  "component": "steps",
  "aria-label": "Release progress",
  "currentStep": 3,
  "activeColor": "success",
  "items": [
    { "label": "Build", "marker": "✓" },
    { "label": "Test", "marker": "✓" },
    { "label": "Deploy", "marker": "3" },
    { "label": "Verify", "marker": "4" }
  ]
}
```

Use vertical orientation for longer labels or procedure-like content. An item
color can override the active path when a stage needs a distinct status.

```daisyui
{
  "component": "steps",
  "aria-label": "Incident response stages",
  "orientation": "vertical",
  "currentStep": 2,
  "activeColor": "primary",
  "itemClass": "font-medium",
  "items": [
    { "label": "Alert acknowledged" },
    { "label": "Impact under investigation", "color": "warning", "marker": "!" },
    { "label": "Mitigation applied" },
    { "label": "Post-incident review" }
  ]
}
```

Omit `currentStep` when the publication is describing stages rather than a live
position; explicit item colors can still communicate known outcomes. Use
Mermaid instead when the reader needs to follow decisions, retries, loops,
parallel work, or ownership handoffs.

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

Use an `echart` code fence when the publication needs a data visualization. The
fence needs no imports, is validated at build time, and uses the same rendering
pipeline as the `EChart` component. Prefer a preset `type` (for example
`"type": "line"` or `"type": "bar"`) before a raw `"type": "option"` fence. The
local gallery at `src/thejournal/dummy_gallery.mdx` shows every supported chart
pattern in a real journal article. Reach for the imported `EChart` component
only when a chart needs raw ECharts options with build-time functions that a
JSON fence cannot express.

Every chart needs a useful `figure.title`, a `figure.caption` when helpful, a
`figure.description` for accessibility, and explicit `size` dimensions that fit
the article. Keep `render` omitted so inline SVG stays the default. Use
`"render": "svg-file"` only for repeated charts or large static output. Use
hydration only when browser interaction helps the reader inspect the chart.

The `Use` column names the option builder. In an `echart` fence, use the
matching preset `type` from `docs/components/MARKDOWN_MDX_CODE_FENCES.md`: for
example `lineChartOption` is `"type": "line"`, `lineChartOption({ area: true })`
is `"type": "area"`, `barChartOption({ horizontal: true })` is `"type": "bar"`
with `"horizontal": true` in `data`, and `pieChartOption({ donut: true })` is
`"type": "donut"`.

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

- Use `"hydrate": "none"` for ordinary article charts.
- Use `"hydrate": "load"` only when the first viewport needs immediate chart
  interaction.
- Use `"hydrate": "idle"` when interaction is useful but not urgent.
- Use `"hydrate": "visible"` for below-the-fold charts.
- Use `"hydrate": "media"` (with `"media"`) when enhancement only helps at
  specific viewport sizes.
- Keep `clientOption` JSON-serializable for enhanced charts, or use
  `optionClientPreset` for supported formatter callbacks.

When a visual could be either Mermaid or ECharts, ask whether the reader needs
to inspect relationships or compare measured values. Relationships belong in
Mermaid. Measurements belong in ECharts.

## Publishing Checks

Before publishing, run the relevant checks from `docs/engineering/TESTING_STRATEGY.md`.
For content model or vault changes, include the manifest unit tests. For visible
article behavior, include the relevant build or browser checks.
