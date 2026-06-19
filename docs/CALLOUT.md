# Callout Component

`Callout.astro` renders a static, card-like publication note with a semantic variant, decorative icon, visible title, and arbitrary Astro or MDX content. It requires no client-side JavaScript.

## Astro usage

```astro
---
import Callout from "@components/ui/display/Callout.astro";
---

<Callout variant="information">
  The static build preserves this information when JavaScript is disabled.
</Callout>
```

Each variant supplies a default title, icon, and theme-aware color treatment.

| Variant       | Default title | Default accent token |
| ------------- | ------------- | -------------------- |
| `note`        | Notes         | `primary`            |
| `information` | Information   | `info`               |
| `warning`     | Warning       | `warning`            |
| `caution`     | Caution       | `secondary`          |
| `error`       | Error         | `error`              |

`note` is the default when `variant` is omitted.

## Custom titles and icons

A custom title changes the visible heading without changing the variant's semantic styling or default icon.

```astro
<Callout variant="warning" title="Deployment risk">
  This operation replaces the current production assets.
</Callout>
```

Pass an `Icon` object to replace the default icon. Icons remain decorative because the visible title already identifies the callout.

```astro
---
import type { Icon } from "@appTypes/icon";

const databaseIcon: Icon = {
  text: "",
  viewBox: "0 0 24 24",
  content: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/>',
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
};
---

<Callout variant="caution" title="Database migration" icon={databaseIcon}>
  Take a verified backup before applying the migration.
</Callout>
```

## MDX publication usage

Import `Callout` after the publication frontmatter. The default slot accepts text, links, lists, code, Astro components, and other MDX-compatible content.

```mdx
import Callout from "@components/ui/display/Callout.astro";

<Callout variant="note" title="Reader context">
  <p>
    The examples use fixture data. See the
    <a href="/thejournal/methodology/">methodology</a> before comparing results.
  </p>
  <ul>
    <li>Values are rounded.</li>
    <li>Timestamps use UTC.</li>
  </ul>
</Callout>
```

The component applies `not-prose` and provides its own readable spacing for paragraphs, lists, links, inline code, blockquotes, and preformatted content. Nested components retain their own presentation contracts.

## Props

| Prop                      | Purpose                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `variant`                 | `note`, `information`, `warning`, `caution`, or `error`; defaults to `note`.                                 |
| `title`                   | Optional nonblank title replacing the variant default.                                                       |
| `icon`                    | Optional `Icon` object replacing the variant icon.                                                           |
| `palette`                 | Optional per-instance color overrides described below.                                                       |
| `class`                   | Adds classes to the outer card-like `<aside>`.                                                               |
| `headerClass`             | Adds classes to the icon-and-title header.                                                                   |
| `iconClass`               | Adds classes to the icon surface.                                                                            |
| `titleClass`              | Adds classes to the visible title.                                                                           |
| `contentClass`            | Adds classes to the default-slot content region.                                                             |
| Standard aside attributes | Forwards attributes such as `id`, `aria-label`, `aria-labelledby`, and `data-*`; raw `style` is not exposed. |

Blank custom titles, blank palette values, unknown palette properties, and invalid runtime variants fail during the Astro build.

## Palette customization

`palette` accepts any subset of the exported `CalloutPalette` fields.

```ts
interface CalloutPalette {
  accent: string;
  surface: string;
  border: string;
  title: string;
  content: string;
  icon: string;
  iconSurface: string;
}
```

Use theme variables and `color-mix()` so overrides continue to adapt to light and dark themes.

```mdx
<Callout
  variant="caution"
  title="Editorial checkpoint"
  palette={{
    accent: "var(--color-accent)",
    surface:
      "color-mix(in oklab, var(--color-accent) 12%, var(--color-base-100))",
    border:
      "color-mix(in oklab, var(--color-accent) 45%, var(--color-base-300))",
    title: "var(--color-base-content)",
    content: "var(--color-base-content)",
    icon: "var(--color-accent)",
    iconSurface:
      "color-mix(in oklab, var(--color-accent) 20%, var(--color-base-100))",
  }}
>
  Confirm the publication date and image rights before release.
</Callout>
```

Palette values are trusted author-provided CSS values. Consumers are responsible for contrast when overriding defaults. Prefer existing DaisyUI semantic tokens over hardcoded colors.

## Styling and responsive behavior

- The card fills its available width and keeps long text from widening the publication.
- A semantic accent edge, border, surface, and icon treatment distinguish the variants without relying on color alone.
- Code blocks and other wide preformatted content scroll within the callout.
- Padding becomes more compact at narrow widths.
- Use the palette for colors and region class hooks for layout or typography.

## Accessibility and content guidance

The visible title communicates the callout type, so the icon is hidden from assistive technology. Custom titles should remain specific enough to preserve the meaning of their variant. Color is supplemental rather than the only severity signal.

Callouts are static supporting content. They do not use `role="alert"`, announce updates, dismiss themselves, or manage focus. Use application feedback components for live errors, form validation, toast notifications, and changing status messages.

Use ordinary prose for information that belongs in the main reading flow and a blockquote for quoted material. Reserve callouts for context or consequences readers could reasonably miss while scanning.
