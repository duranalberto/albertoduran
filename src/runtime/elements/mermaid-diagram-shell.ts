class MermaidDiagramShell extends HTMLElement {
  private openLinkElement: HTMLAnchorElement | null = null;
  private themeObserver: MutationObserver | null = null;

  connectedCallback() {
    this.openLinkElement = this.querySelector("[data-diagram-open-link]");

    this.updateOpenLinkTheme();
    this.themeObserver = new MutationObserver(() => {
      this.updateOpenLinkTheme();
    });
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
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
}

if (!customElements.get("mermaid-diagram-shell")) {
  customElements.define("mermaid-diagram-shell", MermaidDiagramShell);
}
