# ECharts MDX Charts

This project supports static-first Apache ECharts charts in MDX publications.
Charts render during `astro build`, so the article remains readable when
JavaScript is disabled. Browser interactivity is always opt-in per chart.

## Rendering Workflow

- `EChart.astro` renders ECharts with `renderer: "svg"`, `ssr: true`, explicit
  `width` / `height`, and `renderToSVGString()`.
- `render="svg-inline"` is the default and injects trusted build-generated SVG
  into the article.
- `render="svg-file"` registers the chart as a hashed immutable SVG artifact
  emitted under `/_app/charts/` during the Astro build. In dev, it falls back to
  inline SVG so authors do not need a generated asset pass.
- `render="png-file"` is intentionally deferred. Do not add `node-canvas`
  unless a publishing workflow needs PNG output.
- The static chart remains in the page until optional browser enhancement
  succeeds.

The implementation follows ECharts' official server-side SVG rendering model:
<https://apache.github.io/echarts-handbook/en/how-to/cross-platform/server/>.

## Authoring Usage

```mdx
import EChart from "@components/ui/mdx/EChart.astro";
import { lineChartOption } from "@integrations/echarts/options";

<EChart
  title="Quarterly revenue"
  caption="USD, trailing four quarters"
  description="Line chart showing quarterly revenue rising from Q1 to Q4."
  option={lineChartOption({
    x: ["Q1", "Q2", "Q3", "Q4"],
    y: [12.4, 14.2, 16.1, 18.7],
    name: "Revenue",
  })}
  width={760}
  height={420}
/>
```

Use enhancement only when runtime behavior helps the reader:

```mdx
<EChart
  title="Generated output"
  description="Bar chart comparing generated HTML, CSS, and JavaScript."
  option={outputOption}
  clientOption={outputOption}
  hydrate="visible"
/>
```

Use `render="svg-file"` when the same chart is repeated or when page HTML size
matters:

```mdx
<EChart
  title="Traffic sources"
  description="Rose chart showing traffic sources."
  option={trafficOption}
  render="svg-file"
  cacheKey="traffic-sources-v1"
/>
```

## Component API

| Prop                 | Type                                                              | Default                           | Purpose                                         |
| :------------------- | :---------------------------------------------------------------- | :-------------------------------- | :---------------------------------------------- |
| `option`             | `ChartOption`                                                     | Required                          | ECharts option rendered at build time.          |
| `width`              | `number`                                                          | `760`                             | Required by ECharts SSR.                        |
| `height`             | `number`                                                          | `420`                             | Required by ECharts SSR.                        |
| `render`             | `"svg-inline" \| "svg-file"`                                      | `"svg-inline"`                    | Static output mode.                             |
| `hydrate`            | `"none" \| "load" \| "idle" \| "visible" \| "media"`              | `"none"`                          | Preferred enhancement mode.                     |
| `enhance`            | same as `hydrate` except `"media"` is supported through `hydrate` | unset                             | Backward-compatible alias.                      |
| `media`              | `string`                                                          | unset                             | Required when `hydrate="media"`.                |
| `theme`              | `string \| object`                                                | unset                             | ECharts theme passed to SSR and enhancement.    |
| `aria`               | object                                                            | `{ show: true }` plus description | Prop-level ECharts ARIA override.               |
| `title`              | `string`                                                          | unset                             | Figure title above the chart.                   |
| `caption`            | `string`                                                          | unset                             | Supporting caption text.                        |
| `description`        | `string`                                                          | title/caption fallback            | Accessible chart summary.                       |
| `class`              | `string`                                                          | unset                             | Wrapper styling hook.                           |
| `id`                 | `string`                                                          | content hash                      | Chart surface id.                               |
| `cacheKey`           | `string`                                                          | unset                             | Extra namespace for artifact hashing.           |
| `clientOption`       | `ChartOption`                                                     | `option`                          | JSON-safe option used only for enhancement.     |
| `optionClientPreset` | `"currency" \| "percent" \| "financeOhlc"`                        | unset                             | Rebuilds known formatter callbacks client-side. |

If both `hydrate` and `enhance` are provided with different values, the build
throws. Prefer `hydrate` in new MDX.

`hydrate="light"` and `render="png-file"` throw clear deferred-feature errors.

## Option Builders

Integration-owned builders live in `src/integrations/echarts/options.ts`:

- Common charts: `lineChartOption`, `barChartOption`, `pieChartOption`,
  `scatterChartOption`, `histogramChartOption`, `heatmapChartOption`,
  `correlationHeatmapChartOption`, `treemapChartOption`,
  `sankeyChartOption`, and `boxplotChartOption`.
- Finance charts: `candlestickWithVolumeOption`, `macdChartOption`,
  `rsiChartOption`, `bollingerBandsChartOption`, `depthChartOption`,
  `orderBookChartOption`, and `ohlcChartOption`.
- Finance math helpers: `calculateMacd`, `calculateRsi`, and
  `calculateBollingerBands`.

Authors can still pass raw ECharts options for one-off visuals. For enhanced
charts, keep `clientOption` JSON-compatible or use `optionClientPreset` to
restore supported callbacks in the browser.

## Enhancement Rules

- `hydrate="none"` ships no ECharts client bundle.
- `hydrate="load"` enhances immediately.
- `hydrate="idle"` waits for `requestIdleCallback` when available.
- `hydrate="visible"` uses `IntersectionObserver` with a `200px` root margin.
- `hydrate="media"` waits until `matchMedia(media)` matches.
- Static SVG or image output stays visible if enhancement fails.

Enhanced chart options must be JSON-compatible. Do not pass formatter
functions, symbols, `BigInt`, `undefined`, circular references, or non-finite
numbers through `clientOption`.

## Testing And Release Checks

Chart changes should use the smallest meaningful test set:

```bash
npm run check
npm test
npm run build:test
npm run test:e2e
```

Relevant coverage:

- `tests/unit/echarts.test.ts` covers SSR rendering, hashing, artifacts, API
  normalization, serialization, client presets, indicator math, and builders.
- `/fixtures/charts/` is generated only in `ALBERTODURAN_TEST_MODE=true` and
  is used by Playwright to verify no-JS SVG output, external SVG assets, and
  opt-in enhancement.
- `src/thejournal/echarts_dummy_gallery.mdx` is the human-inspection gallery
  for every supported chart pattern.

## Guardrails

- Keep inline SVG as the default for ordinary article charts.
- Treat `set:html` as safe only for SVG produced by this build-time renderer.
- Use `render="svg-file"` for repeated charts or large static output.
- Use `hydrate="visible"` or `hydrate="media"` for below-the-fold or
  desktop-only interactivity.
- Keep PNG and lightweight SSR runtime support deferred until they have a real
  publishing need.
