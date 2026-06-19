# Mockup Window Component

`MockupWindow.astro` presents arbitrary content in DaisyUI's window mockup. It is a static, theme-aware component with no client-side JavaScript and can be imported by Astro pages, layouts, components, and MDX publications.

## Astro usage

```astro
---
import MockupWindow from "@components/ui/display/MockupWindow.astro";
---

<MockupWindow aria-label="Account settings preview">
  <h2>Account settings</h2>
  <p>Window content belongs to the consumer.</p>
</MockupWindow>
```

The optional named slots add an in-window header and a caption below the frame.

```astro
<MockupWindow
  aria-labelledby="settings-preview-title"
  class="my-12"
  windowClass="shadow-2xl"
  bodyClass="grid min-h-72 place-items-center"
>
  <span id="settings-preview-title" slot="header">Settings preview</span>

  <p>Preview content</p>

  <span slot="caption">The settings screen at desktop width.</span>
</MockupWindow>
```

## MDX publication usage

Import the Astro component after the publication frontmatter, then use it like any other MDX component.

```mdx
import MockupWindow from "@components/ui/display/MockupWindow.astro";

<MockupWindow
  aria-label="Generated report preview"
  bodyClass="min-h-64"
>
  <strong slot="header">Report preview</strong>

<p>The default slot accepts MDX-compatible markup and components.</p>

  <span slot="caption">A report rendered during the build.</span>
</MockupWindow>
```

The component applies `not-prose` to its figure so publication typography does not restyle its internal interface. Add the typography and spacing needed by the slotted content explicitly.

When the default slot is a direct screenshot image, the component treats it as static presentation and prevents pointer input, selection, and native dragging. Images nested inside composed interface markup retain normal behavior for links and controls.

## Props

| Prop                       | Purpose                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `class`                    | Adds classes to the outer `<figure>`.                                                                |
| `windowClass`              | Adds classes to the DaisyUI `.mockup-window` frame.                                                  |
| `contentClass`             | Adds classes to the complete surface beneath the window chrome.                                      |
| `headerClass`              | Adds classes to the optional header region.                                                          |
| `bodyClass`                | Adds classes to the default-slot body.                                                               |
| `captionClass`             | Adds classes to the optional `<figcaption>`.                                                         |
| Standard figure attributes | Forwards attributes such as `id`, `aria-label`, `aria-labelledby`, and `data-*` to the outer figure. |

All class hooks are optional and are merged with the component defaults.

## Slots

| Slot      | Purpose                                                  |
| --------- | -------------------------------------------------------- |
| Default   | Required window content supplied by the consumer.        |
| `header`  | Optional heading or compact toolbar above the body.      |
| `caption` | Optional descriptive content rendered as `<figcaption>`. |

## Styling and behavior

- The frame uses DaisyUI's `mockup-window` component and the site's `base-100`, `base-200`, `base-300`, and `base-content` theme tokens.
- The component fills its available width by default. Use `class` for outer width or spacing and the region-specific hooks for internal layout.
- Wide body content scrolls inside the component instead of widening the page. Padding becomes more compact on narrow screens.
- Direct `<img>` and `<picture>` screenshot children are non-draggable. Nested images retain consumer-owned pointer and drag behavior.
- The component follows the active light or dark DaisyUI theme automatically.

## Accessibility

Use `aria-label` when a short label describes the entire mockup. When the header contains a visible title, give that title an `id` and use `aria-labelledby` on `MockupWindow`. Use the caption for supporting context rather than as the only label for important interactive content.

Slotted controls retain their own accessibility responsibilities. Use semantic links and buttons, visible focus styles, and meaningful control labels inside the window.
