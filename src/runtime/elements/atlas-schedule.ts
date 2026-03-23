export class AtlasSchedule extends HTMLElement {
  connectedCallback() {
    this.localizeDate();
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

  private localizeDate() {
    const dateEl = this.querySelector("#match-date") as HTMLElement;
    if (dateEl?.dataset.raw) {
      dateEl.textContent = this.formatToUserLocale(dateEl.dataset.raw);
    }
  }
}

if (typeof window !== "undefined" && !customElements.get("atlas-schedule")) {
  customElements.define("atlas-schedule", AtlasSchedule);
}
