/**
 * Code-drawn slides for projects whose work has no screen to capture. Each
 * visual is data of one `kind`; ProjectVisual.astro picks the renderer for
 * that kind, so a new visual of an existing kind needs no component change.
 */

export type Tone = "prompt" | "dim" | "accent" | "ok" | "warn";

/** Plain text, or text drawn in a tone. */
export type Segment = string | readonly [string, Tone];
export type TerminalLine = readonly Segment[];

/** Chat text: plain, a tone, or struck-through / emphasized. */
export type ChatSegment = Segment | readonly [string, "strike" | "strong"];

interface ValuationRow {
  model: string;
  bear: number;
  base: number;
  bull: number;
}

export type ProjectVisualSpec =
  | { kind: "terminal"; lines: readonly TerminalLine[] }
  | {
      kind: "flow";
      head: readonly [string, string];
      steps: readonly string[];
      /** A step that pauses for a human check. */
      checkpoint?: string;
    }
  | {
      kind: "ranges";
      head: string;
      rows: readonly ValuationRow[];
      price: number;
      scale: { min: number; max: number; ticks: readonly number[] };
      note: string;
    }
  | {
      kind: "chat";
      head: readonly [string, string];
      messages: readonly {
        author: string;
        lines: readonly (readonly ChatSegment[])[];
      }[];
      note: string;
    };

// Frozen teaching sample from the equity_valuation_engine vault
// (first_valuation_run, reading_the_results): bear, base, bull per model.
export const valuationSample: readonly ValuationRow[] = [
  { model: "DCF", bear: 42, base: 58, bull: 74 },
  { model: "ROE", bear: 44, base: 53, bull: 63 },
  { model: "EV/EBITDA", bear: 39, base: 48, bull: 57 },
  { model: "P/S", bear: 48, base: 62, bull: 76 },
  { model: "NAV", bear: 28, base: 35, bull: 42 },
];
const samplePrice = 50;

export const money = (value: number) => `$${value.toFixed(2)}`;

/** Equal-weight composite of the base cases. */
export function compositeValue(rows: readonly ValuationRow[]): number {
  return rows.reduce((total, row) => total + row.base, 0) / rows.length;
}

/** Composite ± one population standard deviation of the base cases. */
export function dispersionBand(
  rows: readonly ValuationRow[],
): readonly [number, number] {
  const mean = compositeValue(rows);
  const variance =
    rows.reduce((total, row) => total + (row.base - mean) ** 2, 0) /
    rows.length;
  const spread = Math.sqrt(variance);
  return [mean - spread, mean + spread];
}

const composite = money(compositeValue(valuationSample));
const [bandLow, bandHigh] = dispersionBand(valuationSample).map(money);

const agentRun = [
  "Contextualizer",
  "News & Sentiment",
  "Synthesizer",
  "Curious Investor",
];

export const projectVisuals = {
  "eve-ranges": {
    kind: "ranges",
    head: "Per-share value, bear to bull",
    rows: valuationSample,
    price: samplePrice,
    scale: { min: 25, max: 80, ticks: [25, 40, 55, 80] },
    note: `composite ${composite}, sample data`,
  },
  "eve-cli": {
    kind: "terminal",
    lines: [
      [["$", "prompt"], " python -m cli.main DEMO --cli"],
      [["Model          Bear      Base      Bull", "dim"]],
      ...valuationSample.map(({ model, bear, base, bull }): TerminalLine => [
        `${model.padEnd(11)}${money(bear).padStart(8)}  `,
        [money(base).padStart(8), "accent"],
        `  ${money(bull).padStart(8)}`,
      ]),
      [["--------------------------------------", "dim"]],
      ["Composite, equal weight      ", [composite, "accent"]],
      [`Dispersion band     ${bandLow} - ${bandHigh}`],
    ],
  },
  "pressroom-pipeline": {
    kind: "flow",
    head: ["LangGraph, 9 agents, local Ollama", "brief to .mdx"],
    steps: [
      "Loader",
      "Interview",
      "Outline Designer",
      "Visualizer",
      "Writer",
      "Reviewer",
      "Humanizer",
      "Metadata",
      "Publisher",
    ],
    checkpoint: "Interview",
  },
  "pressroom-mdx": {
    kind: "terminal",
    lines: [
      [["output/serverless-vod.mdx", "dim"]],
      [["---", "accent"]],
      ['title: "AWS serverless video on demand"'],
      ["tags: [aws, serverless, video]"],
      [["---", "accent"]],
      [""],
      ["## Why nothing runs between uploads"],
      [""],
      [["<EChart", "prompt"], ' data="./costs.json" ', ["/>", "prompt"]],
      [["<Mermaid", "prompt"], ' id="pipeline" ', ["/>", "prompt"]],
      [["# illustrative excerpt", "dim"]],
    ],
  },
  "equilyze-agents": {
    kind: "flow",
    head: ["LangChain, 6 agents, local Ollama", "ticker to report"],
    steps: [...agentRun, "Section Writer x3", "Final Reviewer"],
  },
  "equilyze-run": {
    kind: "terminal",
    lines: [
      [["$", "prompt"], " equilyze DEMO"],
      [["[engine]  ", "dim"], "6 models x 3 scenarios   ", ["done", "ok"]],
      ...agentRun.map((agent, index): TerminalLine => [
        [`[agent ${index + 1}] `, "dim"],
        agent.padEnd(25),
        ["done", "ok"],
      ]),
      [["[agent 5] ", "dim"], "Section Writer x3        ", ["...", "accent"]],
      [["[agent 6] ", "dim"], "Final Reviewer"],
      [["-> reports/DEMO/report.md  # illustrative", "dim"]],
    ],
  },
  "mlscraper-alerts": {
    kind: "chat",
    head: ["Telegram, MLScraper bot", "drops of 14% or more"],
    messages: [
      {
        author: "MLScraper",
        lines: [
          ["Price drop · Liverpool"],
          ["Watch: consoles"],
          [
            ["$12,000", "strike"],
            " → ",
            ["$10,000", "strong"],
            " ",
            ["-16.67%", "ok"],
          ],
        ],
      },
      {
        author: "MLScraper",
        lines: [["New item · Amazon · Watch: consoles"]],
      },
    ],
    note: "Illustrative messages based on the vault example",
  },
  "mlscraper-health": {
    kind: "terminal",
    lines: [
      [["$", "prompt"], " curl localhost:8000/health"],
      ["{"],
      ['  "status": ', ['"ok"', "ok"], ","],
      ['  "providers": {'],
      ['    "amazon":       ', ['"running"', "ok"], ","],
      ['    "liverpool":    ', ['"running"', "ok"], ","],
      ['    "mercadolibre": ', ['"running"', "ok"], ","],
      ['    "palacio":      ', ['"backoff"', "warn"]],
      ["  },"],
      ['  "jobs": { "active": 6, "queued": 1 }'],
      ["}  ", ["# illustrative", "dim"]],
    ],
  },
} as const satisfies Record<string, ProjectVisualSpec>;

export type ProjectVisualId = keyof typeof projectVisuals;
