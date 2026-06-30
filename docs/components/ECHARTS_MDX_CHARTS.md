# ECharts MDX Charts

This project supports static-first Apache ECharts charts in MDX publications.
Charts render during `astro build`, so the article remains readable when
JavaScript is disabled. Browser interactivity is always opt-in per chart.

> **Authoring in `.md` or `.mdx`?** Prefer the `echart` code fence. It needs no
> imports, is validated at build time, and uses this same rendering pipeline.
> See [Markdown and MDX code fences](./MARKDOWN_MDX_CODE_FENCES.md) for the fence
> schema and chart presets. The `EChart.astro` API below is the advanced
> fallback for raw ECharts options that use build-time functions, or other cases
> a fence cannot express.

**Import path:** `@components/ui/mdx/EChart.astro`

## Rendering workflow

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

## Component signature

```ts
interface Props {
  option: ChartOption;                                       // required; ECharts option for SSR
  width?: number;                                            // defaults to 760
  height?: number;                                           // defaults to 420
  render?: "svg-inline" | "svg-file";                        // defaults to "svg-inline"
  hydrate?: "none" | "load" | "idle" | "visible" | "media"; // defaults to "none"
  enhance?: "none" | "load" | "idle" | "visible" | "media"; // legacy alias for hydrate
  media?: string;                                            // required when hydrate="media"
  theme?: string | Record<string, unknown>;                  // ECharts theme name or config
  aria?: Record<string, unknown>;                            // ECharts aria option overrides
  title?: string;                                            // figure title above the chart
  caption?: string;                                          // supporting caption text
  description?: string;                                      // accessible alt summary (fallback: title → caption → "Chart")
  class?: string;                                            // echart-wrapper classes
  id?: string;                                               // chart surface id (default: content hash)
  cacheKey?: string;                                         // extra namespace for svg-file artifact hashing
  optionClientPreset?: "currency" | "percent" | "financeOhlc"; // restores formatter callbacks client-side
  clientOption?: ChartOption;                                // JSON-safe option for browser enhancement only
}

type ChartOption = EChartsCoreOption; // from "echarts/core"
```

## Authoring usage

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
| `enhance`            | same as `hydrate`                                                 | —                                 | Backward-compatible alias. Prefer `hydrate`.    |
| `media`              | `string`                                                          | —                                 | Required when `hydrate="media"`.                |
| `theme`              | `string \| object`                                                | —                                 | ECharts theme passed to SSR and enhancement.    |
| `aria`               | `Record<string, unknown>`                                         | `{ show: true }` plus description | Prop-level ECharts ARIA override.               |
| `title`              | `string`                                                          | —                                 | Figure title above the chart.                   |
| `caption`            | `string`                                                          | —                                 | Supporting caption text.                        |
| `description`        | `string`                                                          | title → caption → "Chart"         | Accessible chart summary for `aria-label`.      |
| `class`              | `string`                                                          | —                                 | Wrapper styling hook.                           |
| `id`                 | `string`                                                          | content hash                      | Chart surface id.                               |
| `cacheKey`           | `string`                                                          | —                                 | Extra namespace for artifact hashing.           |
| `clientOption`       | `ChartOption`                                                     | `option`                          | JSON-safe option used only for enhancement.     |
| `optionClientPreset` | `"currency" \| "percent" \| "financeOhlc"`                        | —                                 | Rebuilds known formatter callbacks client-side. |

If both `hydrate` and `enhance` are provided with different values, the build
throws. Prefer `hydrate` in new MDX.

`hydrate="light"` and `render="png-file"` throw clear deferred-feature errors.

## Enhancement modes

| Mode        | Trigger                                          | Ships JS bundle |
| ----------- | ------------------------------------------------ | --------------- |
| `"none"`    | Never enhances                                   | No              |
| `"load"`    | Immediately on page load                         | Yes             |
| `"idle"`    | `requestIdleCallback` (or `setTimeout` fallback) | Yes             |
| `"visible"` | `IntersectionObserver` with 200px root margin    | Yes             |
| `"media"`   | `matchMedia(media)` matches                      | Yes             |

Static SVG or image output stays visible if enhancement fails. Use `"visible"` or `"media"` for below-the-fold or desktop-only interactivity to avoid shipping unused JS.

Enhanced chart options must be JSON-compatible. Do not pass formatter
functions, symbols, `BigInt`, `undefined`, circular references, or non-finite
numbers through `clientOption`. Use `optionClientPreset` to restore supported
formatter callbacks in the browser.

## optionClientPreset values

| Preset          | Effect                                                                  |
| --------------- | ----------------------------------------------------------------------- |
| `"currency"`    | Formats y-axis and tooltip values as USD (`$1,234.56`)                 |
| `"percent"`     | Formats values as percentages (divides by 100; `12.3%`)                |
| `"financeOhlc"` | Formats OHLC tooltip rows: `open / close / low / high` with 2 decimals |

## Option builders

All builders live in `@integrations/echarts/options`. They return `ChartOption` objects ready to pass to `EChart.astro`. Authors may also pass raw ECharts option objects for one-off charts.

### Common charts

#### `lineChartOption(args)`

```ts
interface LineChartOptionArgs {
  x: Array<string | number>;  // category axis labels; length must equal y
  y: number[];                 // data values; length must equal x
  name?: string;               // series name; default "Value"
  title?: string;              // chart title
  subtitle?: string;           // subtitle below title
  smooth?: boolean;            // smooth curve; default false
  area?: boolean;              // fill area under line; default false
}
```

Dots are hidden when there are more than 24 data points.

#### `barChartOption(args)`

```ts
interface BarChartOptionArgs {
  x: Array<string | number>;  // category labels; length must equal y
  y: number[];                 // data values; length must equal x
  name?: string;               // series name; default "Value"
  title?: string;
  subtitle?: string;
  horizontal?: boolean;        // swap axes for horizontal bars; default false
}
```

Bar width is capped at 42px.

#### `pieChartOption(args)`

```ts
interface PieChartOptionArgs {
  data: NamedValue[];           // { name: string; value: number }[]
  name?: string;                // series name; default "Value"
  title?: string;
  subtitle?: string;
  donut?: boolean;              // ring style (42%–68% radius); default false
  rose?: boolean | "radius" | "area"; // roseType; true maps to "radius"; default false
}
```

#### `scatterChartOption(args)`

```ts
interface ScatterChartOptionArgs {
  data: Array<[number, number]>; // [x, y] pairs
  name?: string;                  // series name; default "Value"
  title?: string;
  subtitle?: string;
  xName?: string;                 // x-axis label
  yName?: string;                 // y-axis label
  symbolSize?: number;            // default 16
}
```

#### `histogramChartOption(args)`

```ts
interface HistogramChartOptionArgs {
  values: number[];   // raw numeric values; must be non-empty
  bins?: number;      // bin count; default √(values.length) rounded up
  name?: string;      // series name; default "Frequency"
  title?: string;
  subtitle?: string;
}
```

Internally computes equal-width bins and delegates to `barChartOption`.

#### `heatmapChartOption(args)`

```ts
interface HeatmapChartOptionArgs {
  x: string[];                         // column labels
  y: string[];                         // row labels
  data: Array<[number, number, number]>; // [xIndex, yIndex, value] triples; must be non-empty
  name?: string;                       // series name; default "Value"
  title?: string;
  subtitle?: string;
  min?: number;                        // visualMap min; default computed from data
  max?: number;                        // visualMap max; default computed from data
}
```

#### `correlationHeatmapChartOption(args)`

Same signature as `heatmapChartOption`. Forces a diverging `[-1, 1]` color scale
(red → beige → blue) and sets `min`/`max` defaults to -1/1. Pass explicit `min`/`max` to override.

#### `treemapChartOption(args)`

```ts
interface TreemapNode {
  name: string;
  value?: number;
  children?: TreemapNode[];
}

interface TreemapChartOptionArgs {
  data: TreemapNode[];
  name?: string;    // series name; default "Value"
  title?: string;
  subtitle?: string;
}
```

Roaming and breadcrumbs are disabled for static publication use.

#### `sankeyChartOption(args)`

```ts
interface SankeyNode { name: string; }
interface SankeyLink { source: string; target: string; value: number; }

interface SankeyChartOptionArgs {
  nodes: SankeyNode[];
  links: SankeyLink[];
  title?: string;
  subtitle?: string;
}
```

#### `boxplotChartOption(args)`

```ts
interface BoxplotDatum {
  name: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

interface BoxplotChartOptionArgs {
  data: BoxplotDatum[];
  name?: string;    // series name; default "Distribution"
  title?: string;
  subtitle?: string;
}
```

### Finance charts

Finance chart builders accept `CandleVolumeDatum[]` as their primary data source:

```ts
interface CandleVolumeDatum {
  date: string;   // ISO date string or label for the x-axis
  open: number;
  close: number;
  low: number;
  high: number;
  volume: number;
}
```

#### `candlestickWithVolumeOption(args)`

```ts
interface CandlestickWithVolumeOptionArgs {
  data: CandleVolumeDatum[];
  title?: string;
  subtitle?: string;
  priceName?: string;   // default "Price"
  volumeName?: string;  // default "Volume"
}
```

Renders a two-panel chart: candlestick price action above, volume bars below. Includes a linked `dataZoom` slider.

#### `macdChartOption(args)`

```ts
// accepts FinanceIndicatorOptionArgs = { data: CandleVolumeDatum[]; title?; subtitle? }
```

Three-panel chart: candlestick + volume + MACD histogram/line/signal. Uses default MACD periods (fast=12, slow=26, signal=9).

#### `rsiChartOption(args)`

Same `FinanceIndicatorOptionArgs`. Two-panel chart: close price + RSI (period=14). Mark lines at 70 and 30.

#### `bollingerBandsChartOption(args)`

Same `FinanceIndicatorOptionArgs`. Single-panel close price with upper, middle, and lower Bollinger Bands (period=20, deviation=2).

#### `depthChartOption(args)`

```ts
interface DepthLevel { price: number; size: number; }

interface DepthChartOptionArgs {
  bids: DepthLevel[];
  asks: DepthLevel[];
  title?: string;
  subtitle?: string;
}
```

Market depth chart with cumulative bid and ask area series.

#### `orderBookChartOption(args)`

Same `{ bids, asks, title?, subtitle? }` signature. Horizontal stacked bar chart of bid/ask sizes at each price level.

#### `ohlcChartOption(args)`

Same `FinanceIndicatorOptionArgs`. Custom OHLC tick-mark rendering (not a candlestick). Up/down colors follow the project palette.

### Finance math helpers

These are exported pure functions — usable without rendering a chart.

```ts
// Exponential moving average
calculateEma(values: number[], period: number): number[]

// MACD — default periods: fast=12, slow=26, signal=9
calculateMacd(
  values: number[],
  fastPeriod?: number,
  slowPeriod?: number,
  signalPeriod?: number,
): Array<{ macd: number; signal: number; histogram: number }>

// RSI — default period=14
calculateRsi(values: number[], period?: number): Array<{ value: number }>

// Bollinger Bands — default period=20, deviation=2
calculateBollingerBands(
  values: number[],
  period?: number,
  deviation?: number,
): Array<{ lower: number; middle: number; upper: number }>

// Histogram bin computation (used internally by histogramChartOption)
calculateHistogramBins(values: number[], requestedBins?: number): HistogramBin[]
```

## Testing and release checks

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
- `src/thejournal/dummy_gallery.mdx` is the human-inspection gallery for every
  supported chart pattern and display component, authored through `echart` and
  `daisyui` fences.

## Guardrails

- Keep inline SVG as the default for ordinary article charts.
- Treat `set:html` as safe only for SVG produced by this build-time renderer.
- Use `render="svg-file"` for repeated charts or large static output.
- Use `hydrate="visible"` or `hydrate="media"` for below-the-fold or
  desktop-only interactivity.
- Keep PNG and lightweight SSR runtime support deferred until they have a real
  publishing need.
