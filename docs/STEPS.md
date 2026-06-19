# Steps Component

`Steps.astro` renders a typed progress sequence using DaisyUI's steps component. It produces a semantic ordered list, requires no client-side JavaScript, and can be imported by Astro pages, layouts, components, and MDX publications.

## Astro usage

```astro
---
import Steps, {
  type StepItem,
} from "@components/ui/display/Steps.astro";

const releaseSteps: StepItem[] = [
  { label: "Draft" },
  { label: "Review" },
  { label: "Publish" },
];
---

<Steps
  items={releaseSteps}
  currentStep={2}
  aria-label="Publication progress"
/>
```

`currentStep` is 1-based. The example colors Draft and Review with the default primary color and marks Review with `aria-current="step"`.

## MDX publication usage

Import the component after the publication frontmatter. Step arrays can be passed inline, which keeps MDX examples self-contained.

```mdx
import Steps from "@components/ui/display/Steps.astro";

<Steps
  aria-label="Deployment progress"
  currentStep={2}
  activeColor="success"
  items={[
    { label: "Build", marker: "✓" },
    { label: "Deploy", marker: "2" },
    { label: "Verify", marker: "3" },
  ]}
/>
```

The component applies `not-prose`, so publication typography does not alter the progress indicator.

## Props

| Prop                     | Purpose                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `items`                  | Required array of step definitions. Empty arrays throw a build-time error.                                      |
| `currentStep`            | Optional 1-based current position. Values must be integers within the item range.                               |
| `activeColor`            | Semantic color applied through the current step. Defaults to `primary`.                                         |
| `orientation`            | `responsive`, `horizontal`, or `vertical`. Defaults to `responsive`.                                            |
| `itemClass`              | Classes added to every generated step item.                                                                     |
| `class`                  | Classes added to the outer ordered list.                                                                        |
| Standard list attributes | Attributes such as `id`, `aria-label`, `aria-labelledby`, `data-*`, and `tabindex` are forwarded to the `<ol>`. |

## Step items

Each item follows the exported `StepItem` interface.

```ts
interface StepItem {
  label: string;
  marker?: string;
  color?: StepColor;
  class?: string;
}
```

- `label` is the visible step text.
- `marker` becomes DaisyUI's `data-content` value. Omit it to use automatic numbering.
- `color` overrides the computed active color for that item.
- `class` adds classes to one item; use `itemClass` for every item.

Supported colors are `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, and `error`.

## Progress and color precedence

When `currentStep` is present, every item from the first through the current position receives `activeColor`. A color declared directly on an item takes precedence. Later items remain in DaisyUI's pending style unless they provide their own color.

Omitting `currentStep` leaves every item pending except items with explicit colors. Invalid positions and empty arrays fail during the Astro build rather than silently rendering misleading progress.

```astro
<Steps
  currentStep={2}
  activeColor="primary"
  items={[
    { label: "Queued" },
    { label: "Running", color: "warning" },
    { label: "Complete" },
  ]}
/>
```

In this example, Queued is primary, Running is warning, and Complete is pending.

## Orientation and overflow

Responsive orientation is vertical below the `sm` breakpoint and horizontal at larger widths. Explicit `horizontal` mode stays horizontal and uses DaisyUI's internal horizontal scrolling when the labels do not fit. Explicit `vertical` mode remains vertical at every width.

Responsive and horizontal lists receive `tabindex="0"` by default so keyboard users can focus and scroll an overflowing sequence. Pass an explicit `tabindex` to override that behavior. A visible focus outline is provided by the component CSS.

## Accessibility

Use `aria-label` or `aria-labelledby` to explain what the sequence represents. The current item receives `aria-current="step"`; color is supplemental and is not the only current-state signal.

Keep labels short and meaningful. This initial API accepts text labels and text markers rather than interactive controls or rich icon slots. Navigation, form progression, state changes, and announcements remain consumer responsibilities.
