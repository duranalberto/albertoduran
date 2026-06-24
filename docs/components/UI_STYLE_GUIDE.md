# UI Implementation & Component Guide

## Enforcement Directive

This document is the authoritative source of truth for UI implementation in this project.

1. **Strict Adherence:** Strictly follow all rules, constraints, and architectural principles defined here.
2. **Aesthetic Priority:** Maintain a **clean and minimalistic** style in all UI generations.
3. **Token Priority:** Prioritize design token usage, DaisyUI conventions, and structural integrity.
4. **No Silent Overrides:** Break rules _only_ if explicitly and intentionally instructed. If instructed to override:
   - State the overridden rule.
   - Explain the architectural impact.
   - Confirm intent, then proceed.

---

## Core Principles & Layout

### Aesthetic: Clean & Minimalistic ("Less is More")

- **Whitespace:** Use generous padding/margins. Avoid cluttered layouts.
- **Visual Weight:** Favor thin borders and subtle shadows over heavy gradients/patterns.
- **Typography:** Use weight and token colors (Content vs. Content-Secondary) for hierarchy, not just size.
- **Interaction:** Animations must be subtle, smooth, and fast (150ms-200ms transitions).

### Responsive Design & Breakpoints

Enforce the use of tokens for adjusting design across viewports.

- **Large Breakpoint:** Use `--breakpoint-lg` (CSS equivalent: `@media (min-width: 1024px)` or `lg:` modifier in Tailwind).
- **Max Site Width:** Use `--breakpoint-2xl` (CSS equivalent: `@media (min-width: 1536px)` or `2xl:` modifier).
- **Centering:** As a secondary measure for bounding maximum width on specific components, enforce `mx-auto` (e.g., `max-w-screen-2xl mx-auto`).

### Single Source of Truth & Theme Awareness

- **NEVER** hardcode Hex colors or Tailwind gray scales.
- **ALWAYS** use DaisyUI semantic classes (`bg-base-200`, `text-base-content`) or CSS variables (`--color-*`).
- Every component must automatically adapt to `dark` and `light` themes via these tokens.
- DaisyUI theme tokens live in `src/styles/themes/_daisyui-themes.css`; Tailwind theme extensions live in `src/styles/themes/_tailwind-theme.css`.

---

## Class Application & Ordering

Directly apply CSS utility classes to HTML tags as the primary styling method. Do not abstract into custom CSS unless strictly necessary.

**Tailwind/DaisyUI Class Ordering Convention:**
To maintain readability and token efficiency, order classes logically:

1. **DaisyUI Base:** (`btn`, `card`, `menu`)
2. **DaisyUI Modifiers:** (`btn-primary`, `card-body`)
3. **Layout & Display:** (`block`, `flex`, `grid`, `absolute`)
4. **Spacing & Sizing:** (`w-full`, `max-w-md`, `p-4`, `m-2`)
5. **Typography:** (`text-lg`, `font-bold`, `text-center`)
6. **Colors & Backgrounds:** (`bg-base-100`, `text-base-content`)
7. **Borders & Effects:** (`border`, `border-theme`, `shadow-sm`)
8. **Responsive & States:** (`hover:bg-base-200`, `lg:p-8`, `focus-visible:ring`)

Class logic extracted for clarity and strict ordering.
Order: Base -> Modifiers -> Layout -> Spacing -> Typography -> Colors -> Borders -> States.

---

## Theme & Token Rules

### Global Theme Configuration

`src/styles/global.css` is the CSS entry point imported by the base layout. It loads Tailwind, enables the selected DaisyUI components, and imports theme token partials before base, utility, shared, layout, UI, and page-specific styles.

The active DaisyUI themes are `light` and `dark`. Theme color variables use OKLCH tokens such as `--color-base-100`, `--color-base-content`, `--color-primary`, and `--color-primary-content`. When a new UI needs a color that is not covered by the existing semantic tokens, update the theme partials instead of hardcoding local colors.

### Contrast & Semantic Pairing

To ensure accessibility and visual harmony, always pair background semantic colors with their corresponding content tokens. Never use a base content color on a primary background.

For example:

| Color Name          | CSS Variable              | Usage                                                    |
| :------------------ | :------------------------ | :------------------------------------------------------- |
| **primary**         | `--color-primary`         | Primary brand color; main accent for the brand.          |
| **primary-content** | `--color-primary-content` | Foreground content color to use strictly on **primary**. |

> **Requirement:** If a component uses `bg-primary`, any text or icons within it **must** use `text-primary-content` to guarantee correct contrast ratios.

---

## Custom CSS & Overrides (Astro + Tailwind + DaisyUI)

First, enforce the use of standard CSS classes. If complex design requires explicitly overriding DaisyUI structure, custom rules must be created under the following constraints:

### Safe Customization Pattern

Custom CSS helpers must complement the framework, not compete with it.

- Keep rules **single-responsibility**.
- Scope them to theme token alignment.
- Avoid shorthand properties that override multiple CSS behaviors at once.
- Always pair custom helpers with Tailwind directional utilities, never override them.
- CSS custom classes must live in the appropriate imported partial under `src/styles/`; do not add rules directly to `src/styles/global.css`.

### Component-Level Overrides

If a component requires structural layout changes:

- Implement them in a **component-scoped class** (e.g., inside an Astro `<style>` block).
- Document _why_ the change is required.
- **Guiding Question:** _Does this align the component with the theme system—or does it override how DaisyUI intended the component to behave?_ If it alters intended behavior, it must be scoped locally and carefully reviewed.

---

## What Must Be Avoided

- **Clutter:** Crowding elements without sufficient whitespace padding.
- **Hardcoded Values:** Hex colors or non-theme structural values; prefer theme variables.
- **Inaccessibility:** Missing `aria-labels` or poor contrast ratios (e.g., using `text-base-content` on `bg-primary`).
- **Poor Responsive Design:** Missing breakpoint rules or failing to cap widths with `--breakpoint-2xl` and `mx-auto`.

---

## PR Checklist

- [ ] Is the design clean, minimalistic, and utilizing adequate whitespace?
- [ ] Are HTML tags styled directly using the correct class ordering convention?
- [ ] Are colors correctly paired for contrast (e.g., `primary` + `primary-content`)?
- [ ] Does the visual check pass seamlessly in both Light and Dark themes?
- [ ] Are structural overrides strictly component-scoped and not leaking globally?
- [ ] Is the design fully responsive and using Tailwind and DaisyUI breakpoints?
- [ ] Are interactive elements keyboard accessible (`:focus-visible`)?

---

## Enforcement Philosophy

The design system must be theme-driven, consistent, and predictable. If a new design requirement conflicts with these rules, **update the theme tokens**—not the individual components.

---

## Implementation Strategies

### Glassmorphism Implementation

Glass surfaces must preserve a predictable stacking context on WebKit, where `backdrop-filter` can interact poorly with sticky or fixed elements.

Keep global overlay and article stacking rules aligned with `src/styles/thejournal/article/_layout.css`, `src/styles/thejournal/article/_dock.css`, and `src/styles/ui/primitive/_panel.css`.

### Z-Index Audit & Layering Strategy

Current layer intent from bottom to top:

- Level 0: main content.
- Level 10: desktop article sidebars.
- Level 30: `.dock-wrapper`.
- Level 50: global header.
- Overlay panels and modals must not rely on a descendant of `<main>` out-stacking the header. Use the established overlay component and CSS partials.
