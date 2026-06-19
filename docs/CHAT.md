# Chat Bubble Component

`ChatBubble.astro` renders one static message using DaisyUI's chat component. It supports aligned messages, semantic bubble colors, optional image and metadata regions, and arbitrary Astro or MDX content without client-side JavaScript.

## Astro usage

```astro
---
import ChatBubble from "@components/ui/display/ChatBubble.astro";
---

<ChatBubble aria-label="Message from deployment bot" color="info">
  <span slot="header">Deployment bot</span>
  Version 2.4.0 is ready for verification.
  <time slot="footer" datetime="2026-06-19T10:30:00Z">10:30 UTC</time>
</ChatBubble>
```

Use `align="end"` for messages belonging on the opposite side of a conversation.

```astro
<ChatBubble
  align="end"
  color="primary"
  aria-label="Message from Alberto"
  bubbleClass="shadow-lg"
>
  <strong slot="header">Alberto</strong>
  Ship it.
  <span slot="footer">Delivered</span>
</ChatBubble>
```

## Image slot

The optional `image` slot renders in DaisyUI's `chat-image` region. Its wrapper provides a 40px circular crop; image loading and optimization remain consumer responsibilities.

```astro
<ChatBubble aria-labelledby="support-name">
  <img
    slot="image"
    src="/images/support-avatar.jpg"
    alt=""
    width="80"
    height="80"
    loading="lazy"
  />
  <span id="support-name" slot="header">Support</span>
  How can I help today?
</ChatBubble>
```

Use empty alternative text for a decorative avatar when the sender's name is already present. If the image itself communicates information, provide meaningful alternative text.

## MDX publication usage

Import the component after the publication frontmatter and use named slots for message metadata.

```mdx
import ChatBubble from "@components/ui/display/ChatBubble.astro";

<ChatBubble
  align="start"
  color="success"
  aria-label="Message from build service"
>
  <strong slot="header">Build service</strong>

The production build completed successfully.

  <span slot="footer">70 pages generated</span>
</ChatBubble>
```

The component applies `not-prose`, so publication typography does not restyle the simulated conversation. Add any typography needed by rich slotted content explicitly.

## Props

| Prop                        | Purpose                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `align`                     | `start` or `end`; defaults to `start`.                                                                             |
| `color`                     | Optional semantic bubble color. Omitting it uses DaisyUI's base surface.                                           |
| `class`                     | Adds classes to the outer message `<article>`.                                                                     |
| `imageClass`                | Adds classes to the optional image wrapper.                                                                        |
| `headerClass`               | Adds classes to the optional header.                                                                               |
| `bubbleClass`               | Adds classes to the required bubble.                                                                               |
| `footerClass`               | Adds classes to the optional footer.                                                                               |
| Standard article attributes | Attributes such as `id`, `aria-label`, `aria-labelledby`, `data-*`, and `role` are forwarded to the outer article. |

Supported colors are `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, and `error`.

## Slots

| Slot     | Purpose                                                              |
| -------- | -------------------------------------------------------------------- |
| Default  | Required message content rendered inside `.chat-bubble`.             |
| `image`  | Optional avatar or sender image.                                     |
| `header` | Optional sender name, time, or compact metadata above the bubble.    |
| `footer` | Optional delivery state, time, or compact metadata below the bubble. |

Empty optional slots do not render their wrapper elements.

## Styling and responsive behavior

- Messages fill the available container width, while bubbles are capped at 90% of that width and 42rem.
- Long unbroken content wraps inside the bubble instead of widening the page.
- Semantic colors and the default bubble surface follow the active DaisyUI theme.
- Use the outer `class` for conversation spacing and the region-specific class hooks for local presentation.
- Alignment respects logical start and end directions, including right-to-left documents through DaisyUI's styles.

## Accessibility and conversation behavior

Give each standalone message an `aria-label` or `aria-labelledby` that identifies its sender or purpose. Use semantic `<time datetime="…">` elements for timestamps and keep status text concise.

This component renders one static message. A live chat interface must separately manage message lists, focus, keyboard controls, loading states, streaming updates, and appropriate live-region announcements. Do not place `aria-live` on every bubble; own announcements at the conversation container level.
