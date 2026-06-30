import type { CalloutPalette, CalloutVariant } from "./callout.ts";
import { CALLOUT_VARIANTS } from "./callout.ts";
import type { ChatBubbleColor } from "./chat.ts";
import { CHAT_BUBBLE_COLOR_CLASSES } from "./chat.ts";
import type { ListStatusColor } from "./list.ts";
import { LIST_STATUS_COLOR_CLASSES } from "./list.ts";
import type { SectionHeaderLink } from "./section-header.ts";
import type { StepColor } from "./steps.ts";
import { STEP_COLOR_CLASSES } from "./steps.ts";

export const DAISYUI_COMPONENT_NAMES = [
  "callout",
  "chat-bubble",
  "list",
  "mockup-browser",
  "mockup-phone",
  "mockup-window",
  "section-header",
  "steps",
] as const;

export type DaisyUiComponentName = (typeof DAISYUI_COMPONENT_NAMES)[number];

export type DaisyUiContentBlock =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "pre";
      text: string;
    }
  | {
      type: "list";
      style: "ordered" | "unordered";
      items: string[];
    }
  | {
      type: "image";
      src: string;
      alt: string;
      className?: string | undefined;
      width?: number | undefined;
      height?: number | undefined;
      loading?: "lazy" | "eager" | undefined;
    }
  | {
      type: "link";
      href: string;
      label: string;
      external: boolean;
      className?: string | undefined;
    };

export interface DaisyUiDataAttributes {
  [key: string]: string | number | boolean;
}

interface NormalizedDaisyUiBase {
  version: 1;
  component: DaisyUiComponentName;
  id?: string | undefined;
  className?: string | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledBy?: string | undefined;
  ariaDescribedBy?: string | undefined;
  data?: DaisyUiDataAttributes | undefined;
}

export interface NormalizedDaisyUiCallout extends NormalizedDaisyUiBase {
  component: "callout";
  variant: CalloutVariant;
  title?: string | undefined;
  palette?: Partial<CalloutPalette> | undefined;
  headerClass?: string | undefined;
  iconClass?: string | undefined;
  titleClass?: string | undefined;
  contentClass?: string | undefined;
  content: DaisyUiContentBlock[];
}

export interface NormalizedDaisyUiChatBubble extends NormalizedDaisyUiBase {
  component: "chat-bubble";
  align: "start" | "end";
  color?: ChatBubbleColor | undefined;
  image?: DaisyUiContentBlock[] | undefined;
  header?: DaisyUiContentBlock[] | undefined;
  footer?: DaisyUiContentBlock[] | undefined;
  imageClass?: string | undefined;
  headerClass?: string | undefined;
  bubbleClass?: string | undefined;
  footerClass?: string | undefined;
  content: DaisyUiContentBlock[];
}

export interface DaisyUiListMediaMarker {
  kind: "marker";
  label: string;
  className?: string | undefined;
}

export interface DaisyUiListMediaImage {
  kind: "image";
  src: string;
  alt: string;
  className?: string | undefined;
}

export type DaisyUiListMedia = DaisyUiListMediaMarker | DaisyUiListMediaImage;

export interface DaisyUiListStatus {
  label: string;
  color?: ListStatusColor | undefined;
  className?: string | undefined;
}

export interface DaisyUiListAction {
  label: string;
  href: string;
  ariaLabel?: string | undefined;
  external: boolean;
  className?: string | undefined;
}

export interface DaisyUiListItem {
  title: string;
  href?: string | undefined;
  ariaLabel?: string | undefined;
  subtitle?: string | undefined;
  description?: string | undefined;
  media?: DaisyUiListMedia | undefined;
  status?: DaisyUiListStatus | undefined;
  action?: DaisyUiListAction | undefined;
  className?: string | undefined;
  contentClass?: string | undefined;
}

export interface NormalizedDaisyUiList extends NormalizedDaisyUiBase {
  component: "list";
  itemClass?: string | undefined;
  items: DaisyUiListItem[];
}

export interface NormalizedDaisyUiMockupBrowser extends NormalizedDaisyUiBase {
  component: "mockup-browser";
  url?: string | undefined;
  browserClass?: string | undefined;
  toolbarClass?: string | undefined;
  addressClass?: string | undefined;
  contentClass?: string | undefined;
  captionClass?: string | undefined;
  toolbar?: DaisyUiContentBlock[] | undefined;
  caption?: DaisyUiContentBlock[] | undefined;
  content: DaisyUiContentBlock[];
}

export interface NormalizedDaisyUiMockupPhone extends NormalizedDaisyUiBase {
  component: "mockup-phone";
  phoneClass?: string | undefined;
  cameraClass?: string | undefined;
  displayClass?: string | undefined;
  captionClass?: string | undefined;
  caption?: DaisyUiContentBlock[] | undefined;
  content: DaisyUiContentBlock[];
}

export interface NormalizedDaisyUiMockupWindow extends NormalizedDaisyUiBase {
  component: "mockup-window";
  windowClass?: string | undefined;
  contentClass?: string | undefined;
  headerClass?: string | undefined;
  bodyClass?: string | undefined;
  captionClass?: string | undefined;
  header?: DaisyUiContentBlock[] | undefined;
  caption?: DaisyUiContentBlock[] | undefined;
  content: DaisyUiContentBlock[];
}

export interface NormalizedDaisyUiSectionHeader extends NormalizedDaisyUiBase {
  component: "section-header";
  title: string;
  level: 2 | 3;
  link?: SectionHeaderLink | undefined;
}

export interface NormalizedDaisyUiStepItem {
  label: string;
  marker?: string | undefined;
  color?: StepColor | undefined;
  className?: string | undefined;
}

export interface NormalizedDaisyUiSteps extends NormalizedDaisyUiBase {
  component: "steps";
  currentStep?: number | undefined;
  activeColor: StepColor;
  orientation: "responsive" | "horizontal" | "vertical";
  itemClass?: string | undefined;
  items: NormalizedDaisyUiStepItem[];
}

export type NormalizedDaisyUiDefinition =
  | NormalizedDaisyUiCallout
  | NormalizedDaisyUiChatBubble
  | NormalizedDaisyUiList
  | NormalizedDaisyUiMockupBrowser
  | NormalizedDaisyUiMockupPhone
  | NormalizedDaisyUiMockupWindow
  | NormalizedDaisyUiSectionHeader
  | NormalizedDaisyUiSteps;

export interface DaisyUiFenceParseContext {
  fileURL?: URL | undefined;
  fenceLang?: string | undefined;
}

const CONTENT_BLOCK_TYPES = [
  "text",
  "paragraph",
  "pre",
  "list",
  "image",
  "link",
] as const;

const ORIENTATIONS = ["responsive", "horizontal", "vertical"] as const;

const PALETTE_KEYS = [
  "accent",
  "surface",
  "border",
  "title",
  "content",
  "icon",
  "iconSurface",
] as const satisfies Array<keyof CalloutPalette>;

function sourceLabel(context: DaisyUiFenceParseContext = {}): string {
  const fence = context.fenceLang ?? "daisyui";
  const file = context.fileURL?.pathname;
  return file ? `${fence} fence in ${file}` : `${fence} fence`;
}

function fail(message: string, context?: DaisyUiFenceParseContext): never {
  throw new Error(`[daisyui] ${sourceLabel(context)}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJson(
  source: string,
  context?: DaisyUiFenceParseContext,
): Record<string, unknown> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`invalid JSON (${message}).`, context);
  }

  if (!isRecord(parsed)) {
    fail("definition must be a JSON object.", context);
  }

  return parsed;
}

function assertFiniteNumbers(
  value: unknown,
  path: string,
  context?: DaisyUiFenceParseContext,
  seen: WeakSet<object> = new WeakSet(),
): void {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      fail(`${path} must be a finite number.`, context);
    }
    return;
  }

  if (typeof value !== "object" || value === null) return;
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      assertFiniteNumbers(item, `${path}[${index}]`, context, seen);
    });
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    assertFiniteNumbers(item, `${path}.${key}`, context, seen);
  }
}

function isOneOf<T extends string>(
  value: string,
  allowed: readonly T[],
): value is T {
  return (allowed as readonly string[]).includes(value);
}

function isKeyOf<T extends Record<string, unknown>>(
  value: string,
  record: T,
): value is Extract<keyof T, string> {
  return Object.prototype.hasOwnProperty.call(record, value);
}

function optionalString(
  value: unknown,
  label: string,
  context?: DaisyUiFenceParseContext,
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") fail(`${label} must be a string.`, context);
  if (value.trim().length === 0) {
    fail(`${label} must be non-empty when provided.`, context);
  }
  return value.trim();
}

function requiredString(
  value: unknown,
  label: string,
  context?: DaisyUiFenceParseContext,
): string {
  const parsed = optionalString(value, label, context);
  if (!parsed) fail(`${label} is required.`, context);
  return parsed;
}

function optionalBoolean(
  value: unknown,
  label: string,
  context?: DaisyUiFenceParseContext,
): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") fail(`${label} must be a boolean.`, context);
  return value;
}

function optionalPositiveInteger(
  value: unknown,
  label: string,
  context?: DaisyUiFenceParseContext,
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    fail(`${label} must be a positive integer.`, context);
  }
  return value;
}

function optionalDataAttributes(
  value: unknown,
  context?: DaisyUiFenceParseContext,
): DaisyUiDataAttributes | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) fail("data must be an object when provided.", context);

  const attributes: DaisyUiDataAttributes = {};

  for (const [key, item] of Object.entries(value)) {
    if (!/^[A-Za-z0-9_.:-]+$/.test(key)) {
      fail(`data attribute "${key}" contains unsupported characters.`, context);
    }

    if (
      typeof item !== "string" &&
      typeof item !== "number" &&
      typeof item !== "boolean"
    ) {
      fail(
        `data attribute "${key}" must be a string, number, or boolean.`,
        context,
      );
    }

    attributes[key] = item;
  }

  return Object.keys(attributes).length > 0 ? attributes : undefined;
}

function parseBase(
  parsed: Record<string, unknown>,
  component: DaisyUiComponentName,
  context?: DaisyUiFenceParseContext,
): NormalizedDaisyUiBase {
  const version = parsed.version ?? 1;
  if (version !== 1) fail("version must be 1 when provided.", context);

  const ariaLabel =
    optionalString(parsed.ariaLabel, "ariaLabel", context) ??
    optionalString(parsed["aria-label"], "aria-label", context);
  const ariaLabelledBy =
    optionalString(parsed.ariaLabelledBy, "ariaLabelledBy", context) ??
    optionalString(parsed["aria-labelledby"], "aria-labelledby", context);
  const ariaDescribedBy =
    optionalString(parsed.ariaDescribedBy, "ariaDescribedBy", context) ??
    optionalString(parsed["aria-describedby"], "aria-describedby", context);

  return {
    version: 1,
    component,
    id: optionalString(parsed.id, "id", context),
    className: optionalString(parsed.class, "class", context),
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    data: optionalDataAttributes(parsed.data, context),
  };
}

function parseContentBlock(
  value: unknown,
  label: string,
  context?: DaisyUiFenceParseContext,
): DaisyUiContentBlock {
  if (typeof value === "string") {
    return { type: "paragraph", text: requiredString(value, label, context) };
  }

  if (!isRecord(value)) {
    fail(`${label} must be a string or content block.`, context);
  }

  const type = requiredString(value.type, `${label}.type`, context);
  if (!isOneOf(type, CONTENT_BLOCK_TYPES)) {
    fail(
      `${label}.type must be one of ${CONTENT_BLOCK_TYPES.join(", ")}.`,
      context,
    );
  }

  switch (type) {
    case "text":
    case "paragraph":
    case "pre":
      return {
        type,
        text: requiredString(value.text, `${label}.text`, context),
      };
    case "list": {
      const style = value.style ?? "unordered";
      if (
        typeof style !== "string" ||
        !isOneOf(style, ["ordered", "unordered"])
      ) {
        fail(`${label}.style must be ordered or unordered.`, context);
      }
      if (!Array.isArray(value.items) || value.items.length === 0) {
        fail(`${label}.items must contain at least one item.`, context);
      }

      return {
        type: "list",
        style,
        items: value.items.map((item, index) =>
          requiredString(item, `${label}.items[${index}]`, context),
        ),
      };
    }
    case "image":
      return {
        type: "image",
        src: requiredString(value.src, `${label}.src`, context),
        alt: requiredString(value.alt, `${label}.alt`, context),
        className: optionalString(value.class, `${label}.class`, context),
        width: optionalPositiveInteger(value.width, `${label}.width`, context),
        height: optionalPositiveInteger(
          value.height,
          `${label}.height`,
          context,
        ),
        loading: parseLoading(value.loading, `${label}.loading`, context),
      };
    case "link":
      return {
        type: "link",
        href: requiredString(value.href, `${label}.href`, context),
        label: requiredString(value.label, `${label}.label`, context),
        external:
          optionalBoolean(value.external, `${label}.external`, context) ??
          false,
        className: optionalString(value.class, `${label}.class`, context),
      };
  }
}

function parseLoading(
  value: unknown,
  label: string,
  context?: DaisyUiFenceParseContext,
): "lazy" | "eager" | undefined {
  if (value === undefined) return undefined;
  if (value !== "lazy" && value !== "eager") {
    fail(`${label} must be lazy or eager.`, context);
  }
  return value;
}

function parseContent(
  value: unknown,
  label: string,
  context?: DaisyUiFenceParseContext,
  required = false,
): DaisyUiContentBlock[] {
  if (value === undefined) {
    if (required) fail(`${label} is required.`, context);
    return [];
  }

  const values = Array.isArray(value) ? value : [value];
  if (required && values.length === 0) {
    fail(`${label} must contain at least one content block.`, context);
  }

  return values.map((item, index) =>
    parseContentBlock(item, `${label}[${index}]`, context),
  );
}

function parsePalette(
  value: unknown,
  context?: DaisyUiFenceParseContext,
): Partial<CalloutPalette> | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) fail("palette must be an object.", context);

  const palette: Partial<CalloutPalette> = {};

  for (const [key, item] of Object.entries(value)) {
    if (!isOneOf(key, PALETTE_KEYS)) {
      fail(`palette contains an unknown property "${key}".`, context);
    }

    palette[key] = requiredString(item, `palette.${key}`, context);
  }

  return Object.keys(palette).length > 0 ? palette : undefined;
}

function parseListMedia(
  value: unknown,
  label: string,
  context?: DaisyUiFenceParseContext,
): DaisyUiListMedia | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) fail(`${label} must be an object.`, context);

  const kind = requiredString(value.kind, `${label}.kind`, context);
  if (kind === "marker") {
    return {
      kind,
      label: requiredString(value.label, `${label}.label`, context),
      className: optionalString(value.class, `${label}.class`, context),
    };
  }

  if (kind === "image") {
    return {
      kind,
      src: requiredString(value.src, `${label}.src`, context),
      alt: requiredString(value.alt, `${label}.alt`, context),
      className: optionalString(value.class, `${label}.class`, context),
    };
  }

  fail(`${label}.kind must be marker or image.`, context);
}

function parseListStatus(
  value: unknown,
  label: string,
  context?: DaisyUiFenceParseContext,
): DaisyUiListStatus | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) fail(`${label} must be an object.`, context);

  const color = optionalString(value.color, `${label}.color`, context);
  if (color !== undefined && !isKeyOf(color, LIST_STATUS_COLOR_CLASSES)) {
    fail(
      `${label}.color must be one of ${Object.keys(LIST_STATUS_COLOR_CLASSES).join(", ")}.`,
      context,
    );
  }

  return {
    label: requiredString(value.label, `${label}.label`, context),
    color,
    className: optionalString(value.class, `${label}.class`, context),
  };
}

function parseListAction(
  value: unknown,
  label: string,
  context?: DaisyUiFenceParseContext,
): DaisyUiListAction | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) fail(`${label} must be an object.`, context);

  return {
    label: requiredString(value.label, `${label}.label`, context),
    href: requiredString(value.href, `${label}.href`, context),
    ariaLabel: optionalString(value.ariaLabel, `${label}.ariaLabel`, context),
    external:
      optionalBoolean(value.external, `${label}.external`, context) ?? false,
    className: optionalString(value.class, `${label}.class`, context),
  };
}

function parseListItems(
  value: unknown,
  context?: DaisyUiFenceParseContext,
): DaisyUiListItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail("items must contain at least one item.", context);
  }

  return value.map((item, index) => {
    const label = `items[${index}]`;
    if (!isRecord(item)) fail(`${label} must be an object.`, context);

    return {
      title: requiredString(item.title, `${label}.title`, context),
      href: optionalString(item.href, `${label}.href`, context),
      ariaLabel: optionalString(item.ariaLabel, `${label}.ariaLabel`, context),
      subtitle: optionalString(item.subtitle, `${label}.subtitle`, context),
      description: optionalString(
        item.description,
        `${label}.description`,
        context,
      ),
      media: parseListMedia(item.media, `${label}.media`, context),
      status: parseListStatus(item.status, `${label}.status`, context),
      action: parseListAction(item.action, `${label}.action`, context),
      className: optionalString(item.class, `${label}.class`, context),
      contentClass: optionalString(
        item.contentClass,
        `${label}.contentClass`,
        context,
      ),
    };
  });
}

function parseSectionLink(
  value: unknown,
  context?: DaisyUiFenceParseContext,
): SectionHeaderLink | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) fail("link must be an object.", context);

  return {
    href: requiredString(value.href, "link.href", context),
    label: requiredString(value.label, "link.label", context),
    external:
      optionalBoolean(value.external, "link.external", context) ?? false,
  };
}

function parseStepItems(
  value: unknown,
  context?: DaisyUiFenceParseContext,
): NormalizedDaisyUiStepItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail("items must contain at least one item.", context);
  }

  return value.map((item, index) => {
    const label = `items[${index}]`;
    if (!isRecord(item)) fail(`${label} must be an object.`, context);

    const color = optionalString(item.color, `${label}.color`, context);
    if (color !== undefined && !isKeyOf(color, STEP_COLOR_CLASSES)) {
      fail(
        `${label}.color must be one of ${Object.keys(STEP_COLOR_CLASSES).join(", ")}.`,
        context,
      );
    }

    return {
      label: requiredString(item.label, `${label}.label`, context),
      marker: optionalString(item.marker, `${label}.marker`, context),
      color,
      className: optionalString(item.class, `${label}.class`, context),
    };
  });
}

export function parseDaisyUiFenceDefinition(
  source: string,
  context: DaisyUiFenceParseContext = {},
): NormalizedDaisyUiDefinition {
  const parsed = parseJson(source, context);
  assertFiniteNumbers(parsed, "definition", context);

  const component = optionalString(parsed.component, "component", context);
  if (!component) fail("component is required.", context);
  if (!isOneOf(component, DAISYUI_COMPONENT_NAMES)) {
    fail(
      `component must be one of ${DAISYUI_COMPONENT_NAMES.join(", ")}.`,
      context,
    );
  }

  const base = parseBase(parsed, component, context);

  switch (component) {
    case "callout": {
      const variant = parsed.variant ?? "note";
      if (typeof variant !== "string" || !isKeyOf(variant, CALLOUT_VARIANTS)) {
        fail(
          `variant must be one of ${Object.keys(CALLOUT_VARIANTS).join(", ")}.`,
          context,
        );
      }

      return {
        ...base,
        component,
        variant,
        title: optionalString(parsed.title, "title", context),
        palette: parsePalette(parsed.palette, context),
        headerClass: optionalString(parsed.headerClass, "headerClass", context),
        iconClass: optionalString(parsed.iconClass, "iconClass", context),
        titleClass: optionalString(parsed.titleClass, "titleClass", context),
        contentClass: optionalString(
          parsed.contentClass,
          "contentClass",
          context,
        ),
        content: parseContent(parsed.content, "content", context, true),
      };
    }
    case "chat-bubble": {
      const align = parsed.align ?? "start";
      if (align !== "start" && align !== "end") {
        fail("align must be start or end.", context);
      }

      const color = optionalString(parsed.color, "color", context);
      if (color !== undefined && !isKeyOf(color, CHAT_BUBBLE_COLOR_CLASSES)) {
        fail(
          `color must be one of ${Object.keys(CHAT_BUBBLE_COLOR_CLASSES).join(", ")}.`,
          context,
        );
      }

      return {
        ...base,
        component,
        align,
        color,
        image: parseContent(parsed.image, "image", context),
        header: parseContent(parsed.header, "header", context),
        footer: parseContent(parsed.footer, "footer", context),
        imageClass: optionalString(parsed.imageClass, "imageClass", context),
        headerClass: optionalString(parsed.headerClass, "headerClass", context),
        bubbleClass: optionalString(parsed.bubbleClass, "bubbleClass", context),
        footerClass: optionalString(parsed.footerClass, "footerClass", context),
        content: parseContent(parsed.content, "content", context, true),
      };
    }
    case "list":
      return {
        ...base,
        component,
        itemClass: optionalString(parsed.itemClass, "itemClass", context),
        items: parseListItems(parsed.items, context),
      };
    case "mockup-browser": {
      const toolbar = parseContent(parsed.toolbar, "toolbar", context);
      const url = optionalString(parsed.url, "url", context);

      if (!url && toolbar.length === 0) {
        fail("mockup-browser requires a non-empty url or toolbar.", context);
      }

      return {
        ...base,
        component,
        url,
        browserClass: optionalString(
          parsed.browserClass,
          "browserClass",
          context,
        ),
        toolbarClass: optionalString(
          parsed.toolbarClass,
          "toolbarClass",
          context,
        ),
        addressClass: optionalString(
          parsed.addressClass,
          "addressClass",
          context,
        ),
        contentClass: optionalString(
          parsed.contentClass,
          "contentClass",
          context,
        ),
        captionClass: optionalString(
          parsed.captionClass,
          "captionClass",
          context,
        ),
        toolbar: toolbar.length > 0 ? toolbar : undefined,
        caption: parseContent(parsed.caption, "caption", context),
        content: parseContent(parsed.content, "content", context, true),
      };
    }
    case "mockup-phone":
      return {
        ...base,
        component,
        phoneClass: optionalString(parsed.phoneClass, "phoneClass", context),
        cameraClass: optionalString(parsed.cameraClass, "cameraClass", context),
        displayClass: optionalString(
          parsed.displayClass,
          "displayClass",
          context,
        ),
        captionClass: optionalString(
          parsed.captionClass,
          "captionClass",
          context,
        ),
        caption: parseContent(parsed.caption, "caption", context),
        content: parseContent(parsed.content, "content", context, true),
      };
    case "mockup-window":
      return {
        ...base,
        component,
        windowClass: optionalString(parsed.windowClass, "windowClass", context),
        contentClass: optionalString(
          parsed.contentClass,
          "contentClass",
          context,
        ),
        headerClass: optionalString(parsed.headerClass, "headerClass", context),
        bodyClass: optionalString(parsed.bodyClass, "bodyClass", context),
        captionClass: optionalString(
          parsed.captionClass,
          "captionClass",
          context,
        ),
        header: parseContent(parsed.header, "header", context),
        caption: parseContent(parsed.caption, "caption", context),
        content: parseContent(parsed.content, "content", context, true),
      };
    case "section-header": {
      const level = parsed.level ?? 2;
      if (level !== 2 && level !== 3) {
        fail("level must be 2 or 3.", context);
      }

      return {
        ...base,
        component,
        title: requiredString(parsed.title, "title", context),
        level,
        link: parseSectionLink(parsed.link, context),
      };
    }
    case "steps": {
      const activeColor = parsed.activeColor ?? "primary";
      if (
        typeof activeColor !== "string" ||
        !isKeyOf(activeColor, STEP_COLOR_CLASSES)
      ) {
        fail(
          `activeColor must be one of ${Object.keys(STEP_COLOR_CLASSES).join(", ")}.`,
          context,
        );
      }

      const orientation = parsed.orientation ?? "responsive";
      if (
        typeof orientation !== "string" ||
        !isOneOf(orientation, ORIENTATIONS)
      ) {
        fail(`orientation must be one of ${ORIENTATIONS.join(", ")}.`, context);
      }

      return {
        ...base,
        component,
        currentStep: optionalPositiveInteger(
          parsed.currentStep,
          "currentStep",
          context,
        ),
        activeColor,
        orientation,
        itemClass: optionalString(parsed.itemClass, "itemClass", context),
        items: parseStepItems(parsed.items, context),
      };
    }
  }
}
