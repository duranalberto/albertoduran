/**
 * project-media.ts
 *
 * Small slide switcher for project screenshots. The first slide is rendered
 * visible at build time, so without JavaScript the component is a still image.
 * Dots, arrows, horizontal swipes, and arrow keys change slides; cards with
 * `data-autocycle` also flip through slides while their card is hovered.
 */

const CYCLE_MS = 1800;
const SWIPE_PX = 40;

export class ProjectMedia extends HTMLElement {
  private controller: AbortController | null = null;
  private slides: HTMLElement[] = [];
  private dots: HTMLButtonElement[] = [];
  private index = 0;
  private timer = 0;

  connectedCallback() {
    this.slides = Array.from(
      this.querySelectorAll<HTMLElement>("[data-media-slide]"),
    );
    if (this.slides.length < 2) return;

    this.controller = new AbortController();
    const { signal } = this.controller;
    this.dots = Array.from(
      this.querySelectorAll<HTMLButtonElement>("[data-media-dot]"),
    );

    this.dots.forEach((dot, index) =>
      dot.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          this.stopCycle();
          this.show(index);
        },
        { signal },
      ),
    );

    this.querySelectorAll<HTMLButtonElement>("[data-media-step]").forEach(
      (button) =>
        button.addEventListener(
          "click",
          () => this.show(this.index + Number(button.dataset.mediaStep)),
          { signal },
        ),
    );

    this.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        this.show(this.index + (event.key === "ArrowRight" ? 1 : -1));
        this.focusActiveDot();
      },
      { signal },
    );

    this.bindSwipe(signal);
    this.bindHoverCycle(signal);
  }

  disconnectedCallback() {
    this.stopCycle();
    this.controller?.abort();
    this.controller = null;
  }

  private show(next: number) {
    const count = this.slides.length;
    this.index = (next + count) % count;

    this.slides.forEach((slide, index) => {
      const active = index === this.index;
      slide.toggleAttribute("data-active", active);
      if (active) slide.removeAttribute("aria-hidden");
      else slide.setAttribute("aria-hidden", "true");
    });
    this.dots.forEach((dot, index) =>
      dot.setAttribute("aria-current", String(index === this.index)),
    );

    const counter = this.querySelector("[data-media-counter]");
    if (counter) counter.textContent = `${this.index + 1} / ${count}`;
    const caption = this.querySelector("[data-media-caption]");
    if (caption)
      caption.textContent = this.slides[this.index]?.dataset.caption ?? "";
  }

  private focusActiveDot() {
    this.dots[this.index]?.focus({ preventScroll: true });
  }

  private bindSwipe(signal: AbortSignal) {
    const stage = this.querySelector<HTMLElement>("[data-media-stage]");
    if (!stage) return;

    let startX: number | null = null;
    let startY = 0;
    stage.addEventListener(
      "pointerdown",
      (event) => {
        startX = event.clientX;
        startY = event.clientY;
      },
      { signal },
    );
    stage.addEventListener(
      "pointerup",
      (event) => {
        if (startX === null) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        startX = null;
        if (Math.abs(dx) < SWIPE_PX || Math.abs(dy) > Math.abs(dx)) return;
        this.stopCycle();
        this.show(this.index + (dx < 0 ? 1 : -1));
      },
      { signal },
    );
    stage.addEventListener("pointercancel", () => (startX = null), { signal });
  }

  private bindHoverCycle(signal: AbortSignal) {
    if (!this.hasAttribute("data-autocycle")) return;
    if (!matchMedia("(hover: hover)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = this.closest<HTMLElement>("[data-project-card]") ?? this;
    root.addEventListener(
      "mouseenter",
      () => {
        this.stopCycle();
        this.restartProgress();
        this.timer = window.setInterval(() => {
          this.show(this.index + 1);
          this.restartProgress();
        }, CYCLE_MS);
      },
      { signal },
    );
    root.addEventListener(
      "mouseleave",
      () => {
        this.stopCycle();
        this.show(0);
      },
      { signal },
    );
  }

  private restartProgress() {
    const progress = this.querySelector<HTMLElement>("[data-media-progress]");
    if (!progress) return;
    progress.removeAttribute("data-running");
    progress.style.setProperty("--cycle-ms", `${CYCLE_MS}ms`);
    void progress.offsetWidth;
    progress.setAttribute("data-running", "");
  }

  private stopCycle() {
    window.clearInterval(this.timer);
    this.timer = 0;
    this.querySelector("[data-media-progress]")?.removeAttribute(
      "data-running",
    );
  }
}

if (typeof window !== "undefined" && !customElements.get("project-media")) {
  customElements.define("project-media", ProjectMedia);
}

export {};
