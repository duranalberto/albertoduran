import type { Icon } from "@appTypes/icon";
import { resolveCallout } from "./callout.ts";
import { chatBubbleColorClass } from "./chat.ts";
import type {
  DaisyUiContentBlock,
  DaisyUiListAction,
  NormalizedDaisyUiDefinition,
  NormalizedDaisyUiList,
  NormalizedDaisyUiSectionHeader,
  NormalizedDaisyUiSteps,
} from "./definition.ts";
import { listActionAttributes, listStatusColorClass } from "./list.ts";
import { resolveSectionHeader } from "./section-header.ts";
import { resolveStepItems } from "./steps.ts";

export interface RenderedDaisyUiMarkup {
  html: string;
  component: NormalizedDaisyUiDefinition["component"];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(name: string, value: unknown): string {
  if (value === undefined || value === null || value === false) return "";
  return ` ${name}="${escapeHtml(String(value))}"`;
}

function classAttr(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(" ");
}

function rootAttrs(
  definition: NormalizedDaisyUiDefinition,
  options: { includeId?: boolean } = {},
): string {
  const includeId = options.includeId ?? true;
  const dataAttrs = definition.data
    ? Object.entries(definition.data)
        .map(([key, value]) => attr(`data-${key}`, value))
        .join("")
    : "";

  return [
    includeId ? attr("id", definition.id) : "",
    attr("aria-label", definition.ariaLabel),
    attr("aria-labelledby", definition.ariaLabelledBy),
    attr("aria-describedby", definition.ariaDescribedBy),
    dataAttrs,
  ].join("");
}

function renderSvgIcon(icon: Icon, width = 20, height = 20): string {
  const fill = icon.fill ?? "currentColor";
  const stroke = icon.stroke ?? "none";
  const strokeWidth = icon.strokeWidth ?? 0;
  const strokeLinecap = icon.strokeLinecap ?? "round";
  const strokeLinejoin = icon.strokeLinejoin ?? "round";

  return [
    '<svg class="select-none"',
    attr("viewBox", icon.viewBox),
    attr("width", width),
    attr("height", height),
    attr("fill", fill),
    attr("stroke", stroke),
    attr("stroke-width", strokeWidth),
    attr("stroke-linecap", strokeLinecap),
    attr("stroke-linejoin", strokeLinejoin),
    ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
    icon.content,
    "</svg>",
  ].join("");
}

function renderContentBlock(
  block: DaisyUiContentBlock,
  options: { inlineParagraphs?: boolean } = {},
): string {
  switch (block.type) {
    case "text":
      return escapeHtml(block.text);
    case "paragraph":
      return options.inlineParagraphs
        ? escapeHtml(block.text)
        : `<p>${escapeHtml(block.text)}</p>`;
    case "pre":
      return `<pre><code>${escapeHtml(block.text)}</code></pre>`;
    case "list": {
      const Tag = block.style === "ordered" ? "ol" : "ul";
      return [
        `<${Tag}>`,
        ...block.items.map((item) => `<li>${escapeHtml(item)}</li>`),
        `</${Tag}>`,
      ].join("");
    }
    case "image":
      return [
        "<img",
        attr("class", block.className),
        attr("src", block.src),
        attr("alt", block.alt),
        attr("width", block.width),
        attr("height", block.height),
        attr("loading", block.loading ?? "lazy"),
        ' decoding="async" draggable="false">',
      ].join("");
    case "link": {
      const externalAttrs = block.external
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      return [
        "<a",
        attr("class", block.className),
        attr("href", block.href),
        externalAttrs,
        ">",
        escapeHtml(block.label),
        "</a>",
      ].join("");
    }
  }
}

function renderContentBlocks(
  blocks: DaisyUiContentBlock[] | undefined,
  options: { inlineParagraphs?: boolean } = {},
): string {
  return (blocks ?? [])
    .map((block) => renderContentBlock(block, options))
    .join("");
}

function renderCallout(definition: NormalizedDaisyUiDefinition): string {
  if (definition.component !== "callout") {
    throw new Error("renderCallout received a non-callout definition.");
  }

  const resolved = resolveCallout(
    definition.variant,
    definition.title,
    undefined,
    definition.palette,
  );

  return [
    "<aside",
    rootAttrs(definition),
    attr("data-callout-variant", resolved.variant),
    attr("style", resolved.paletteStyle),
    attr(
      "class",
      classAttr(
        "card callout-card not-prose shadow-sm",
        resolved.className,
        definition.className,
      ),
    ),
    ">",
    `<div${attr("class", classAttr("callout-header", definition.headerClass))}>`,
    `<span${attr("class", classAttr("callout-icon", definition.iconClass))} aria-hidden="true">`,
    renderSvgIcon(resolved.icon),
    "</span>",
    `<strong${attr("class", classAttr("callout-title", definition.titleClass))}>`,
    escapeHtml(resolved.title),
    "</strong>",
    "</div>",
    `<div${attr("class", classAttr("callout-content", definition.contentClass))}>`,
    renderContentBlocks(definition.content),
    "</div>",
    "</aside>",
  ].join("");
}

function renderChatBubble(definition: NormalizedDaisyUiDefinition): string {
  if (definition.component !== "chat-bubble") {
    throw new Error("renderChatBubble received a non-chat-bubble definition.");
  }

  const colorClass = chatBubbleColorClass(definition.color);

  return [
    "<article",
    rootAttrs(definition),
    attr(
      "class",
      classAttr(
        "chat chat-message not-prose",
        definition.align === "end" ? "chat-end" : "chat-start",
        definition.className,
      ),
    ),
    ">",
    definition.image && definition.image.length > 0
      ? [
          `<div${attr("class", classAttr("chat-image chat-message-image", definition.imageClass))}>`,
          renderContentBlocks(definition.image, { inlineParagraphs: true }),
          "</div>",
        ].join("")
      : "",
    definition.header && definition.header.length > 0
      ? [
          `<header${attr("class", classAttr("chat-header chat-message-header", definition.headerClass))}>`,
          renderContentBlocks(definition.header, { inlineParagraphs: true }),
          "</header>",
        ].join("")
      : "",
    `<div${attr("class", classAttr("chat-bubble chat-message-bubble", colorClass, definition.bubbleClass))}>`,
    renderContentBlocks(definition.content, { inlineParagraphs: true }),
    "</div>",
    definition.footer && definition.footer.length > 0
      ? [
          `<footer${attr("class", classAttr("chat-footer chat-message-footer", definition.footerClass))}>`,
          renderContentBlocks(definition.footer, { inlineParagraphs: true }),
          "</footer>",
        ].join("")
      : "",
    "</article>",
  ].join("");
}

function renderListAction(action: DaisyUiListAction): string {
  const actionAttributes = listActionAttributes({
    label: action.label,
    href: action.href,
    external: action.external,
  });

  return [
    "<a",
    attr("href", action.href),
    attr("aria-label", action.ariaLabel),
    attr("target", actionAttributes.target),
    attr("rel", actionAttributes.rel),
    attr(
      "class",
      classAttr(
        "btn btn-sm btn-ghost publication-list-action",
        action.className,
      ),
    ),
    ">",
    escapeHtml(action.label),
    "</a>",
  ].join("");
}

function renderList(definition: NormalizedDaisyUiList): string {
  return [
    "<ul",
    rootAttrs(definition),
    attr(
      "class",
      classAttr(
        "list publication-list not-prose bg-base-100 border border-base-300 rounded-box",
        definition.className,
      ),
    ),
    ">",
    ...definition.items.map((item) => {
      const statusClass = listStatusColorClass(item.status?.color);

      return [
        `<li${attr("class", classAttr("list-row publication-list-row", definition.itemClass, item.className))}>`,
        item.href
          ? [
              "<a",
              attr("href", item.href),
              attr("aria-label", item.ariaLabel ?? `Read ${item.title}`),
              ' class="publication-list-row-link"></a>',
            ].join("")
          : "",
        item.media?.kind === "image"
          ? [
              `<div${attr("class", classAttr("publication-list-media", item.media.className))}>`,
              "<img",
              attr("src", item.media.src),
              attr("alt", item.media.alt),
              ' loading="lazy" decoding="async">',
              "</div>",
            ].join("")
          : "",
        item.media?.kind === "marker"
          ? [
              `<span${attr("class", classAttr("publication-list-marker", item.media.className))} aria-hidden="true">`,
              escapeHtml(item.media.label),
              "</span>",
            ].join("")
          : "",
        `<div${attr("class", classAttr("list-col-grow publication-list-content", item.contentClass))}>`,
        '<div class="publication-list-title-line">',
        `<strong class="publication-list-title">${escapeHtml(item.title)}</strong>`,
        item.status
          ? [
              `<span${attr("class", classAttr("badge badge-sm publication-list-status", statusClass, item.status.className))}>`,
              escapeHtml(item.status.label),
              "</span>",
            ].join("")
          : "",
        "</div>",
        item.subtitle
          ? `<div class="publication-list-subtitle">${escapeHtml(item.subtitle)}</div>`
          : "",
        "</div>",
        item.description
          ? `<p class="list-col-wrap publication-list-description">${escapeHtml(item.description)}</p>`
          : "",
        item.action ? renderListAction(item.action) : "",
        "</li>",
      ].join("");
    }),
    "</ul>",
  ].join("");
}

function renderMockupBrowser(definition: NormalizedDaisyUiDefinition): string {
  if (definition.component !== "mockup-browser") {
    throw new Error("renderMockupBrowser received a non-browser definition.");
  }

  return [
    "<figure",
    rootAttrs(definition),
    attr(
      "class",
      classAttr("mockup-browser-figure not-prose", definition.className),
    ),
    ">",
    `<div${attr("class", classAttr("mockup-browser mockup-browser-frame border border-base-300 bg-base-100 text-base-content", definition.browserClass))}>`,
    `<div${attr("class", classAttr("mockup-browser-toolbar mockup-browser-toolbar-region", definition.toolbarClass))}>`,
    definition.toolbar && definition.toolbar.length > 0
      ? renderContentBlocks(definition.toolbar, { inlineParagraphs: true })
      : [
          `<div${attr("class", classAttr("input mockup-browser-address bg-base-200 text-base-content", definition.addressClass))}>`,
          '<span class="sr-only">Address:</span>',
          `<span class="mockup-browser-address-value">${escapeHtml(definition.url ?? "")}</span>`,
          "</div>",
        ].join(""),
    "</div>",
    `<div${attr("class", classAttr("mockup-browser-content mockup-static-media border-t border-base-300 bg-base-100", definition.contentClass))}>`,
    renderContentBlocks(definition.content),
    "</div>",
    "</div>",
    definition.caption && definition.caption.length > 0
      ? [
          `<figcaption${attr("class", classAttr("mockup-browser-caption text-base-content/70", definition.captionClass))}>`,
          renderContentBlocks(definition.caption, { inlineParagraphs: true }),
          "</figcaption>",
        ].join("")
      : "",
    "</figure>",
  ].join("");
}

function renderMockupPhone(definition: NormalizedDaisyUiDefinition): string {
  if (definition.component !== "mockup-phone") {
    throw new Error("renderMockupPhone received a non-phone definition.");
  }

  return [
    "<figure",
    rootAttrs(definition),
    attr(
      "class",
      classAttr("mockup-phone-figure not-prose", definition.className),
    ),
    ">",
    `<div${attr("class", classAttr("mockup-phone mockup-phone-frame", definition.phoneClass))}>`,
    `<div${attr("class", classAttr("mockup-phone-camera", definition.cameraClass))} aria-hidden="true"></div>`,
    `<div${attr("class", classAttr("mockup-phone-display mockup-static-media bg-base-100 text-base-content", definition.displayClass))}>`,
    renderContentBlocks(definition.content),
    "</div>",
    "</div>",
    definition.caption && definition.caption.length > 0
      ? [
          `<figcaption${attr("class", classAttr("mockup-phone-caption text-base-content/70", definition.captionClass))}>`,
          renderContentBlocks(definition.caption, { inlineParagraphs: true }),
          "</figcaption>",
        ].join("")
      : "",
    "</figure>",
  ].join("");
}

function renderMockupWindow(definition: NormalizedDaisyUiDefinition): string {
  if (definition.component !== "mockup-window") {
    throw new Error("renderMockupWindow received a non-window definition.");
  }

  return [
    "<figure",
    rootAttrs(definition),
    attr(
      "class",
      classAttr("mockup-window-figure not-prose", definition.className),
    ),
    ">",
    `<div${attr("class", classAttr("mockup-window mockup-window-frame border border-base-300 bg-base-200 text-base-content", definition.windowClass))}>`,
    `<div${attr("class", classAttr("mockup-window-content border-t border-base-300 bg-base-100", definition.contentClass))}>`,
    definition.header && definition.header.length > 0
      ? [
          `<header${attr("class", classAttr("mockup-window-header border-b border-base-300", definition.headerClass))}>`,
          renderContentBlocks(definition.header, { inlineParagraphs: true }),
          "</header>",
        ].join("")
      : "",
    `<div${attr("class", classAttr("mockup-window-body mockup-static-media", definition.bodyClass))}>`,
    renderContentBlocks(definition.content),
    "</div>",
    "</div>",
    "</div>",
    definition.caption && definition.caption.length > 0
      ? [
          `<figcaption${attr("class", classAttr("mockup-window-caption text-base-content/70", definition.captionClass))}>`,
          renderContentBlocks(definition.caption, { inlineParagraphs: true }),
          "</figcaption>",
        ].join("")
      : "",
    "</figure>",
  ].join("");
}

function renderSectionHeader(
  definition: NormalizedDaisyUiSectionHeader,
): string {
  const resolved = resolveSectionHeader({
    title: definition.title,
    id: definition.id,
    level: definition.level,
    link: definition.link,
  });
  const heading = [
    "<",
    resolved.headingTag,
    attr("id", resolved.id),
    ' class="pl-4 text-3xl sm:text-4xl font-display font-semibold tracking-tight text-base-content">',
    escapeHtml(resolved.title),
    "</",
    resolved.headingTag,
    ">",
  ].join("");
  const link = resolved.link
    ? [
        '<div class="self-start sm:self-auto">',
        "<a",
        attr("href", resolved.link.href),
        attr("aria-label", resolved.link.label),
        attr("target", resolved.link.target),
        attr("rel", resolved.link.rel),
        ' class="btn btn-primary btn-lg inline-flex items-center gap-3 normal-case font-medium text-base transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 transition-transform">',
        `<span class="tracking-wide">${escapeHtml(resolved.link.label)}</span>`,
        "</a>",
        "</div>",
      ].join("")
    : "";

  return [
    "<div",
    rootAttrs(definition, { includeId: false }),
    attr(
      "class",
      classAttr(
        "flex flex-col w-full max-w-screen-2xl mx-auto gap-6 pb-8 md:pb-10 sm:flex-row sm:items-center sm:justify-between sm:gap-0",
        definition.className,
      ),
    ),
    ">",
    '<div class="flex items-center h-10 md:h-12 gap-4 border-l-4 border-primary">',
    heading,
    "</div>",
    link,
    "</div>",
  ].join("");
}

function renderSteps(definition: NormalizedDaisyUiSteps): string {
  const orientationClasses = {
    responsive: "steps-vertical sm:steps-horizontal",
    horizontal: "steps-horizontal",
    vertical: "steps-vertical",
  } as const;
  const resolvedItems = resolveStepItems(
    definition.items.map((item) => ({
      label: item.label,
      ...(item.marker ? { marker: item.marker } : {}),
      ...(item.color ? { color: item.color } : {}),
      ...(item.className ? { class: item.className } : {}),
    })),
    definition.currentStep,
    definition.activeColor,
  );
  const canOverflowHorizontally = definition.orientation !== "vertical";

  return [
    "<ol",
    rootAttrs(definition),
    attr("tabindex", canOverflowHorizontally ? 0 : undefined),
    attr(
      "class",
      classAttr(
        "steps steps-component not-prose",
        orientationClasses[definition.orientation],
        definition.className,
      ),
    ),
    ">",
    ...resolvedItems.map((item) =>
      [
        "<li",
        attr(
          "class",
          classAttr("step", item.colorClass, definition.itemClass, item.class),
        ),
        attr("data-content", item.marker),
        attr("aria-current", item.isCurrent ? "step" : undefined),
        ">",
        escapeHtml(item.label),
        "</li>",
      ].join(""),
    ),
    "</ol>",
  ].join("");
}

export function renderDaisyUiMarkup(
  definition: NormalizedDaisyUiDefinition,
): RenderedDaisyUiMarkup {
  switch (definition.component) {
    case "callout":
      return {
        html: renderCallout(definition),
        component: definition.component,
      };
    case "chat-bubble":
      return {
        html: renderChatBubble(definition),
        component: definition.component,
      };
    case "list":
      return { html: renderList(definition), component: definition.component };
    case "mockup-browser":
      return {
        html: renderMockupBrowser(definition),
        component: definition.component,
      };
    case "mockup-phone":
      return {
        html: renderMockupPhone(definition),
        component: definition.component,
      };
    case "mockup-window":
      return {
        html: renderMockupWindow(definition),
        component: definition.component,
      };
    case "section-header":
      return {
        html: renderSectionHeader(definition),
        component: definition.component,
      };
    case "steps":
      return { html: renderSteps(definition), component: definition.component };
  }
}
