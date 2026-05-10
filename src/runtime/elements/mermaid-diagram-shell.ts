class MermaidDiagramShell extends HTMLElement {
  private popoverElement: HTMLElement | null = null;
  private targetElement: HTMLElement | null = null;
  private openLinkElement: HTMLAnchorElement | null = null;
  private themeObserver: MutationObserver | null = null;

  connectedCallback() {
    this.popoverElement = this.querySelector(".diagram-popover");
    this.targetElement = this.querySelector("[data-diagram-popover-content]");
    this.openLinkElement = this.querySelector("[data-diagram-open-link]");

    this.updateOpenLinkTheme();
    this.themeObserver = new MutationObserver(() => {
      this.updateOpenLinkTheme();
    });
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    if (!this.popoverElement || !this.targetElement) return;

    this.popoverElement.addEventListener("beforetoggle", (event) => {
      const toggleEvent = event as ToggleEvent;
      if (toggleEvent.newState === "open") {
        this.populatePopover();
      }
    });

    this.popoverElement.addEventListener("toggle", (event) => {
      const toggleEvent = event as ToggleEvent;
      if (toggleEvent.newState === "closed") {
        this.clearPopover();
      }
    });
  }

  disconnectedCallback() {
    this.themeObserver?.disconnect();
    this.themeObserver = null;
  }

  private updateOpenLinkTheme() {
    if (!this.openLinkElement) return;

    const lightSrc = this.openLinkElement.dataset.diagramLightSrc;
    const darkSrc = this.openLinkElement.dataset.diagramDarkSrc;
    const theme = document.documentElement.getAttribute("data-theme");

    this.openLinkElement.href =
      theme === "dark" && darkSrc ? darkSrc : (lightSrc ?? "#");
  }

  private populatePopover() {
    if (!this.targetElement || this.targetElement.firstElementChild) return;

    const inlineSvg = this.querySelector(
      ":scope > .mermaid-diagram-container svg",
    );
    if (!(inlineSvg instanceof SVGElement)) return;

    const clone = inlineSvg.cloneNode(true) as SVGElement;
    this.attachPageCssToClone(clone);
    this.rewriteCloneIds(clone);
    this.targetElement.append(clone);
  }

  private clearPopover() {
    if (this.targetElement) this.targetElement.replaceChildren();
  }

  private attachPageCssToClone(svg: SVGElement) {
    const pageCss = document.querySelector<HTMLStyleElement>(
      "style[data-mermaid-page-css]",
    )?.textContent;
    if (!pageCss) return;

    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style",
    );
    style.textContent = pageCss;
    svg.prepend(style);
  }

  private rewriteCloneIds(svg: SVGElement) {
    const idMap = new Map<string, string>();
    const idElements = Array.from(svg.querySelectorAll<HTMLElement>("[id]"));

    if (svg.id) idMap.set(svg.id, `${svg.id}--expanded`);
    for (const element of idElements) {
      idMap.set(element.id, `${element.id}--expanded`);
    }

    const replacements = Array.from(idMap.entries()).sort(
      (a, b) => b[0].length - a[0].length,
    );

    const escapeRegExp = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const replaceRefs = (value: string) => {
      let next = value;
      for (const [from, to] of replacements) {
        next = next.replace(
          new RegExp(`#${escapeRegExp(from)}(?![A-Za-z0-9_-])`, "g"),
          `#${to}`,
        );
      }
      return next;
    };

    const elements = [svg, ...Array.from(svg.querySelectorAll("*"))];
    for (const element of elements) {
      if (element.id && idMap.has(element.id)) {
        element.id = idMap.get(element.id)!;
      }

      for (const attr of Array.from(element.attributes)) {
        if (attr.value.includes("#")) {
          element.setAttribute(attr.name, replaceRefs(attr.value));
        }
      }
    }

    for (const style of Array.from(svg.querySelectorAll("style"))) {
      style.textContent = replaceRefs(style.textContent ?? "");
    }
  }
}

if (!customElements.get("mermaid-diagram-shell")) {
  customElements.define("mermaid-diagram-shell", MermaidDiagramShell);
}
