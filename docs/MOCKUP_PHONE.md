# Mockup Phone Component

`MockupPhone.astro` presents arbitrary content inside DaisyUI's phone mockup. It is a static component with no client-side JavaScript and can be imported by Astro pages, layouts, components, and MDX publications.

## Astro usage

```astro
---
import MockupPhone from "@components/ui/display/MockupPhone.astro";
---

<MockupPhone aria-label="Mobile account screen preview">
  <div class="grid h-full place-items-center p-6">
    <h2>Account</h2>
  </div>
</MockupPhone>
```

The optional `caption` slot adds supporting text below the device frame.

```astro
<MockupPhone
  aria-label="Mobile dashboard preview"
  class="my-12"
  phoneClass="shadow-2xl"
  displayClass="bg-base-200"
>
  <div class="grid h-full place-items-center p-6">
    <p>Dashboard content</p>
  </div>

  <span slot="caption">The dashboard at a mobile viewport.</span>
</MockupPhone>
```

## Screenshot usage

The DaisyUI display styles direct child images to fill the screen with `object-fit: cover`. Use descriptive alternative text when the screenshot communicates content.

```astro
---
import { Image } from "astro:assets";
import MockupPhone from "@components/ui/display/MockupPhone.astro";
import dashboardScreenshot from "@assets/dashboard-mobile.png";
---

<MockupPhone aria-label="Dashboard screenshot">
  <Image
    src={dashboardScreenshot}
    alt="Dashboard showing weekly activity and recent notifications"
    widths={[320, 462]}
    sizes="(max-width: 462px) 100vw, 462px"
  />
</MockupPhone>
```

Image loading and optimization remain the consumer's responsibility. Use Astro's `Image` component for local assets and provide dimensions for remote images to avoid layout shifts. A direct screenshot image is non-draggable and does not receive pointer input. Nested images inside composed screen content retain normal interaction and remain consumer-owned.

## MDX publication usage

Import the Astro component after the publication frontmatter, then use it like any other MDX component.

```mdx
import MockupPhone from "@components/ui/display/MockupPhone.astro";

<MockupPhone
  aria-label="Mobile report preview"
  phoneClass="shadow-xl"
>
  <div className="grid h-full place-items-center p-6">
    <strong>Report preview</strong>
  </div>

  <span slot="caption">A report rendered at mobile dimensions.</span>
</MockupPhone>
```

The component applies `not-prose` to its figure so publication typography does not restyle the simulated interface. Add the typography and spacing needed by the slotted screen content explicitly.

## Props

| Prop                       | Purpose                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `class`                    | Adds classes to the outer `<figure>`.                                                                |
| `phoneClass`               | Adds classes to the DaisyUI `.mockup-phone` frame.                                                   |
| `cameraClass`              | Adds classes to the decorative `.mockup-phone-camera` notch.                                         |
| `displayClass`             | Adds classes to the `.mockup-phone-display` screen.                                                  |
| `captionClass`             | Adds classes to the optional `<figcaption>`.                                                         |
| Standard figure attributes | Forwards attributes such as `id`, `aria-label`, `aria-labelledby`, and `data-*` to the outer figure. |

All class hooks are optional and are merged with the component defaults.

## Slots

| Slot      | Purpose                                                  |
| --------- | -------------------------------------------------------- |
| Default   | Required phone-screen content supplied by the consumer.  |
| `caption` | Optional descriptive content rendered as `<figcaption>`. |

The camera notch is always rendered as decorative phone chrome and is hidden from assistive technology.

## Styling and responsive behavior

- The frame retains DaisyUI's native 462:978 aspect ratio and 462px maximum width.
- The phone shrinks to its container on narrow screens and remains horizontally centered.
- The display clips content at the device boundary. Consumers should design screen content for the available aspect ratio instead of relying on page-level overflow.
- The device frame keeps DaisyUI's physical-device colors. The display uses the site's `base-100` and `base-content` theme tokens by default and follows the active light or dark theme.
- Direct `<img>` and `<picture>` screenshot children cannot be selected or dragged. Nested images remain interactive so composed controls and links keep working.
- Use `class` for outer spacing or alignment and the region-specific class hooks for frame, camera, display, and caption customization.

## Accessibility

Use `aria-label` or `aria-labelledby` to identify what the mockup demonstrates. Screenshots need useful `alt` text when their visual content matters; use empty alternative text only when the same information is already available nearby.

Slotted controls retain their own accessibility responsibilities. Use semantic links and buttons, visible focus styles, meaningful labels, and a logical tab order. The mockup does not add scrolling or interaction behavior, so any interactive screen must remain usable within the clipped display.
