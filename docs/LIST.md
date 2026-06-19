# List Component

`List.astro` renders a typed collection of information-rich rows using DaisyUI's list component. It supports local images or text markers, titles, metadata, wrapped descriptions, semantic status badges, and one link action per row without client-side JavaScript.

## Astro usage

```astro
---
import List, {
  type ListItem,
} from "@components/ui/display/List.astro";
import releaseImage from "@assets/releases/v2.png";

const releases: ListItem[] = [
  {
    title: "Version 2.0",
    subtitle: "Production release",
    description: "Introduces the new publication rendering pipeline.",
    media: { kind: "image", src: releaseImage, alt: "Version 2 artwork" },
    status: { label: "Ready", color: "success" },
    action: { label: "Read notes", href: "/releases/v2/" },
  },
];
---

<List items={releases} aria-label="Recent releases" />
```

Standard `<ul>` attributes are forwarded to the list. Add an `aria-label` or `aria-labelledby` whenever the surrounding heading does not clearly identify the collection.

## MDX publication usage

Import the component and any local image assets after the publication frontmatter.

```mdx
import List from "@components/ui/display/List.astro";
import serviceLogo from "@assets/thejournal/example/service.png";

<List
  aria-label="Deployment services"
  class="my-8 shadow-sm"
  items={[
    {
      title: "Build service",
      subtitle: "Artifact producer",
      description: "Compiles the site and records immutable output metadata.",
      media: { kind: "image", src: serviceLogo, alt: "Build service logo" },
      status: { label: "Healthy", color: "success" },
      action: { label: "View run", href: "/thejournal/build-run/" },
    },
    {
      title: "Deployment review",
      subtitle: "Manual approval",
      media: { kind: "marker", label: "02" },
      status: { label: "Waiting", color: "warning" },
    },
  ]}
/>
```

The component applies `not-prose`, so publication typography does not alter the row layout. Its own text styles remain theme-aware; additional classes can be supplied for local presentation.

## Props

| Prop                     | Purpose                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `items`                  | Required array of typed rows. Empty arrays and blank required labels throw a build-time error.                    |
| `itemClass`              | Classes added to every generated `.list-row`.                                                                     |
| `class`                  | Classes added to the outer `<ul>` alongside the default surface, border, and DaisyUI list classes.                |
| Standard list attributes | Attributes such as `id`, `aria-label`, `aria-labelledby`, `data-*`, and `role` are forwarded to the outer `<ul>`. |

## Item types

```ts
interface ListItem {
  title: string;
  subtitle?: string;
  description?: string;
  media?: ListItemMedia;
  status?: ListStatus;
  action?: ListAction;
  class?: string;
  contentClass?: string;
}

type ListItemMedia =
  | { kind: "image"; src: ImageMetadata; alt: string; class?: string }
  | { kind: "marker"; label: string; class?: string };

interface ListStatus {
  label: string;
  color?: ListStatusColor;
  class?: string;
}

interface ListAction {
  label: string;
  href: string;
  ariaLabel?: string;
  external?: boolean;
  class?: string;
}
```

- `title` is the required primary label. `subtitle` adds compact metadata below it.
- `description` uses DaisyUI's `list-col-wrap` layout and moves onto a readable wrapped row.
- `media` accepts either an Astro local image or a decorative text marker. The two forms cannot be combined.
- `status` renders a badge beside the title. Supported colors are `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, and `error`; omit the color for the default badge surface.
- `action` renders one labeled link. Set `external: true` to open it in a new tab with `rel="noopener noreferrer"`.
- `class` customizes one row and `contentClass` customizes its title/subtitle region. Media, status, and action objects also accept local classes.

## Images and markers

Image media only accepts imported local `ImageMetadata`. Astro determines the intrinsic dimensions and optimizes the output; the component supplies lazy loading and a square crop. Use meaningful alternative text when the image contributes information and `alt: ""` when it is redundant with the row title.

Markers are visual identifiers such as `01`, `A`, or `✓`. They are hidden from assistive technology because list semantics and the row title already identify the item. Do not put essential status information only in a marker; use the visible title, description, or status instead.

## Responsive behavior and customization

- Rows follow DaisyUI's horizontal grid at larger widths, while descriptions occupy the wrapped description column.
- At narrow widths, actions move to a full-width row to prevent crowded controls and horizontal page overflow.
- Long titles, metadata, and descriptions wrap instead of widening the publication.
- The outer list uses the current theme's base surface, border, content color, and rounded-box token.
- Use `class` for outer margin, width, or shadow; `itemClass` for shared row treatment; and item-level hooks for targeted adjustments.

## Accessibility

The component renders an unordered semantic list. Use ordinary ordered Markdown or `Steps` when position or progress matters.

Action text should describe its destination. Supply `ariaLabel` when a short visible label such as “Open” needs more context. External-link behavior should be evident from the label or surrounding prose because it opens a new browser tab.

Status badges supplement the row text; do not rely on badge color alone. Images need deliberate alternative text, while markers are decorative. Interactive buttons, menus, selection state, and multiple-action toolbars are outside this static publication component.
