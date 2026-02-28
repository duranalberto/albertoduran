class AtlasSchedule extends HTMLElement {
  private isInitialized = false;

  connectedCallback() {
    if (typeof window === "undefined") return;

    if (document.readyState === "complete") {
      this.init();
    } else {
      window.addEventListener("load", () => this.init(), { once: true });
    }
  }

  private init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.localizeStaticDate();

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => this.hydrate(), { timeout: 4000 });
    } else {
      setTimeout(() => this.hydrate(), 1000);
    }
  }

  private formatToUserLocale(isoDate: string): string {
    if (!isoDate || isoDate === "--") return "--";
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate;
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const simplifiedZone =
        userTimezone.split("/").pop()?.replace(/_/g, " ") || userTimezone;

      return (
        new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: "short",
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(date) + ` (${simplifiedZone})`
      );
    } catch (e) {
      return isoDate;
    }
  }

  private localizeStaticDate() {
    const dateEl = this.querySelector("#match-date") as HTMLElement;
    if (dateEl?.dataset.raw) {
      dateEl.textContent = this.formatToUserLocale(dateEl.dataset.raw);
    }
  }

  async hydrate() {
    try {
      // Dynamic import remains the best way to break the Lighthouse chain
      const { getAtlasData } = await import("./atlas_service");
      const freshData = await getAtlasData();

      if (freshData) {
        requestAnimationFrame(() => this.updateDOM(freshData));
      }
    } catch (error) {
      console.warn("AtlasSchedule: Hydration deferred.");
    }
  }

  private updateDOM(data: any) {
    const updateText = (id: string, val: string | number) => {
      const el = this.querySelector(`#${id}`);
      if (el && el.textContent !== String(val)) el.textContent = String(val);
    };

    const updateTeam = (id: string, name: string) => {
      const el = this.querySelector(`#${id}`);
      if (!el) return;
      el.textContent = name;
      el.classList.toggle("text-primary", name.toLowerCase().includes("atlas"));
    };

    updateText("stat-standing", data.standing);
    updateText("stat-record", data.record);
    updateText("stat-points", data.points);
    updateText("match-stadium", data.stadium);
    updateText("match-city", data.city);
    updateTeam("home-team", data.homeTeam);
    updateTeam("away-team", data.awayTeam);

    const dateEl = this.querySelector("#match-date") as HTMLElement;
    if (dateEl) {
      dateEl.textContent = this.formatToUserLocale(data.rawDate);
      dateEl.dataset.raw = data.rawDate;
    }
  }
}

// Ensure registration only happens in the browser
if (typeof window !== "undefined" && !customElements.get("atlas-schedule")) {
  customElements.define("atlas-schedule", AtlasSchedule);
}
