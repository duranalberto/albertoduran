/**
 * on_this_page.ts
 *
 * Scroll-based "On This Page" active link tracker.
 */

type HeadingEntry = { link: HTMLAnchorElement; target: HTMLElement };

const CLICK_SUPPRESS_FALLBACK_MS = 1200;

class OnThisPage {
  private controller = new AbortController();
  private destroyed = false;
  private entries: HeadingEntry[] = [];
  private observer: IntersectionObserver | null = null;
  private currentActive: HTMLAnchorElement | null = null;
  private userClicking = false;
  private clickSuppressTimer = 0;
  private cachedHeaderOffset = 72;
  private ioRafId = 0;
  private vpResizeHandler: (() => void) | null = null;

  constructor(private readonly container: HTMLElement) {
    this.entries = this.buildEntries();
    if (!this.entries.length) return;

    this.refreshHeaderOffset();
    this.initObserver();
    this.bindEvents();

    const hash = location.hash.slice(1);
    if (hash) {
      const match = this.entries.find((e) => e.target.id === hash);
      if (match) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => this.setActive(match.link)),
        );
      }
    } else {
      this.syncFromScroll();
    }
  }

  private getLinks(): HTMLAnchorElement[] {
    return Array.from(
      this.container.querySelectorAll<HTMLAnchorElement>(".onthispage-link"),
    );
  }

  private buildEntries(): HeadingEntry[] {
    return this.getLinks().flatMap((link) => {
      const href = link.getAttribute("href") ?? "";
      if (!href.startsWith("#")) return [];
      const target = document.getElementById(href.slice(1));
      return target ? [{ link, target }] : [];
    });
  }

  private refreshHeaderOffset(): void {
    const header = document.querySelector("header");
    const h = header instanceof HTMLElement ? header.offsetHeight : 0;
    this.cachedHeaderOffset = Math.max(72, h + 16);
  }

  private isAtTop(): boolean {
    return window.scrollY < 8;
  }

  private isAtBottom(): boolean {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    return scrollable > 0 && window.scrollY >= scrollable - 8;
  }

  private initObserver(): void {
    this.observer?.disconnect();
    const offset = this.cachedHeaderOffset;
    this.observer = new IntersectionObserver(
      () => {
        if (this.destroyed || this.userClicking) return;
        cancelAnimationFrame(this.ioRafId);
        this.ioRafId = requestAnimationFrame(() => this.syncFromScroll());
      },
      { rootMargin: `-${offset}px 0px 0px 0px`, threshold: 0 },
    );
    for (const { target } of this.entries) {
      this.observer.observe(target);
    }
  }

  private syncFromScroll(): void {
    if (this.destroyed || this.userClicking) return;

    if (this.isAtTop()) {
      this.setActive(null);
      return;
    }

    if (this.isAtBottom()) {
      const last = this.entries[this.entries.length - 1];
      if (last) this.setActive(last.link);
      return;
    }

    const line = this.cachedHeaderOffset + 32;
    const vh = window.innerHeight;
    const tops = this.entries.map((e) => e.target.getBoundingClientRect().top);

    let activeIdx = -1;
    for (let i = 0; i < tops.length; i++) {
      const currentTop = tops[i] ?? Infinity;
      if (currentTop <= line) {
        activeIdx = i;
      }
    }

    const activeTop = activeIdx !== -1 ? (tops[activeIdx] ?? 0) : 0;

    if (activeIdx !== -1 && activeTop < 0) {
      const nextIdx = activeIdx + 1;
      const nextTop = tops[nextIdx];

      if (
        nextIdx < tops.length &&
        nextTop !== undefined &&
        nextTop > 0 &&
        nextTop < vh * 0.5
      ) {
        activeIdx = nextIdx;
      }
    }

    const finalActiveLink =
      activeIdx !== -1 ? (this.entries[activeIdx]?.link ?? null) : null;
    this.setActive(finalActiveLink);
  }

  private setActive(link: HTMLAnchorElement | null): void {
    if (this.currentActive === link) return;
    this.currentActive = link;

    for (const { link: l } of this.entries) {
      const isActive = l === link;
      l.dataset.state = isActive ? "active" : "inactive";
      if (isActive) {
        l.setAttribute("aria-current", "location");
      } else {
        l.removeAttribute("aria-current");
      }
    }

    if (link) {
      link.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  private startClickSuppress(): void {
    this.userClicking = true;
    clearTimeout(this.clickSuppressTimer);

    if ("onscrollend" in window) {
      const release = () => {
        this.userClicking = false;
        window.removeEventListener("scrollend", release);
        clearTimeout(this.clickSuppressTimer);
      };
      window.addEventListener("scrollend", release, {
        signal: this.controller.signal,
      });
    }

    this.clickSuppressTimer = window.setTimeout(() => {
      this.userClicking = false;
    }, CLICK_SUPPRESS_FALLBACK_MS);
  }

  private bindEvents(): void {
    const { signal } = this.controller;

    this.container.addEventListener(
      "click",
      (e) => {
        const link = (e.target as Element).closest<HTMLAnchorElement>(
          ".onthispage-link",
        );
        if (!link || !this.container.contains(link)) return;

        this.setActive(link);
        this.startClickSuppress();
      },
      { signal },
    );

    this.container.addEventListener(
      "pointerdown",
      (e) => {
        if (e.pointerType !== "touch") return;
        const link = (e.target as Element).closest<HTMLAnchorElement>(
          ".onthispage-link",
        );
        if (!link) return;
        link.dataset.state = "touched";

        const release = () => {
          requestAnimationFrame(() => {
            if (link.dataset.state === "touched") {
              link.dataset.state =
                link === this.currentActive ? "active" : "inactive";
            }
          });
          link.removeEventListener("pointerup", release);
          link.removeEventListener("pointercancel", release);
        };

        link.addEventListener("pointerup", release);
        link.addEventListener("pointercancel", release);
      },
      { signal },
    );

    window.addEventListener(
      "hashchange",
      () => {
        const hash = location.hash.slice(1);
        const match = this.entries.find((e) => e.target.id === hash);
        if (match) this.setActive(match.link);
      },
      { signal },
    );

    let scrollRafId = 0;
    window.addEventListener(
      "scroll",
      () => {
        if (this.userClicking) return;
        cancelAnimationFrame(scrollRafId);
        scrollRafId = requestAnimationFrame(() => this.syncFromScroll());
      },
      { passive: true, signal },
    );

    window.addEventListener(
      "resize",
      () => {
        this.refreshHeaderOffset();
        this.entries = this.buildEntries();
        this.initObserver();
        this.syncFromScroll();
      },
      { passive: true, signal },
    );

    if ("visualViewport" in window && window.visualViewport) {
      this.vpResizeHandler = () => {
        if (this.destroyed) return;
        this.refreshHeaderOffset();
        this.entries = this.buildEntries();
        this.initObserver();
        cancelAnimationFrame(this.ioRafId);
        this.ioRafId = requestAnimationFrame(() => this.syncFromScroll());
      };
      window.visualViewport.addEventListener("resize", this.vpResizeHandler, {
        passive: true,
      } as AddEventListenerOptions);
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    clearTimeout(this.clickSuppressTimer);
    cancelAnimationFrame(this.ioRafId);
    this.controller.abort();
    this.observer?.disconnect();
    this.entries = [];

    if (this.vpResizeHandler && window.visualViewport) {
      window.visualViewport.removeEventListener("resize", this.vpResizeHandler);
      this.vpResizeHandler = null;
    }
  }
}

const instances = new Set<OnThisPage>();
let lifecycleBound = false;

function destroyAll(): void {
  instances.forEach((i) => i.destroy());
  instances.clear();
}

function mount(): void {
  destroyAll();
  document
    .querySelectorAll<HTMLElement>(".onthispage-nav")
    .forEach((el) => instances.add(new OnThisPage(el)));
}

function bindLifecycle(): void {
  if (lifecycleBound) return;
  lifecycleBound = true;
  document.addEventListener("astro:before-swap", destroyAll);
  document.addEventListener("astro:page-load", mount);
}

if (typeof window !== "undefined") {
  bindLifecycle();
}
