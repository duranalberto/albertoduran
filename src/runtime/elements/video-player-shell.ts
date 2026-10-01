import {
  loadHlsScript,
  type HlsInstance,
  type HlsLevel,
} from "@runtime/video/hls-loader";
import { fetchCatalogEntry, type CatalogVideo } from "@runtime/video/catalog";

function isManifestParsedData(value: unknown): value is { levels: HlsLevel[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { levels?: unknown }).levels)
  );
}

function isErrorData(
  value: unknown,
): value is { fatal: boolean; type: string } {
  return typeof value === "object" && value !== null && "fatal" in value;
}

class VideoPlayerShell extends HTMLElement {
  private hls: HlsInstance | null = null;
  private mediaRecoveryAttempted = false;

  connectedCallback() {
    const video = this.querySelector<HTMLVideoElement>(
      "[data-video-player-el]",
    );
    const qualityControl = this.querySelector<HTMLElement>(
      "[data-video-quality-control]",
    );
    const qualitySelect = this.querySelector<HTMLSelectElement>(
      "[data-video-player-quality]",
    );
    const src = this.dataset.videoSrc;

    if (!video || !qualityControl || !qualitySelect || !src) return;

    qualitySelect.addEventListener("change", () => {
      if (!this.hls) return;
      this.hls.currentLevel = Number(qualitySelect.value);
    });

    void this.load(video, qualityControl, qualitySelect, src);
    void this.loadMetadata(src);
  }

  disconnectedCallback() {
    this.hls?.destroy();
    this.hls = null;
  }

  private populateQualityLevels(select: HTMLSelectElement, levels: HlsLevel[]) {
    select.innerHTML = '<option value="-1">Auto</option>';

    levels.forEach((level, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${level.width}×${level.height}`;
      select.append(option);
    });

    select.disabled = false;
  }

  private async load(
    video: HTMLVideoElement,
    qualityControl: HTMLElement,
    qualitySelect: HTMLSelectElement,
    src: string,
  ) {
    const Hls = await loadHlsScript();
    if (!this.isConnected) return;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, startLevel: -1 });
      this.hls = hls;

      hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(src));

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        if (!isManifestParsedData(data)) return;
        this.populateQualityLevels(qualitySelect, data.levels);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!isErrorData(data) || !data.fatal) return;

        if (
          data.type === Hls.ErrorTypes.MEDIA_ERROR &&
          !this.mediaRecoveryAttempted
        ) {
          this.mediaRecoveryAttempted = true;
          hls.recoverMediaError();
          return;
        }

        hls.destroy();
        this.hls = null;
        qualityControl.hidden = true;
      });

      hls.attachMedia(video);
      return;
    }

    // Browsers without MSE support (e.g. Safari) play HLS natively and don't
    // expose per-rendition switching, so a manual quality control here would
    // stay disabled forever. Hide it instead of showing a dead control.
    qualityControl.hidden = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
  }

  private async loadMetadata(src: string) {
    const catalogUrl = this.dataset.catalogUrl;
    if (!catalogUrl) return;

    const entry = await fetchCatalogEntry(catalogUrl, src);
    if (entry && this.isConnected) this.showMetadata(entry);
  }

  private showMetadata(entry: CatalogVideo) {
    const metadata = this.querySelector<HTMLElement>("[data-video-metadata]");
    const titleEl = this.querySelector<HTMLElement>(
      "[data-video-metadata-title]",
    );
    const descriptionEl = this.querySelector<HTMLElement>(
      "[data-video-metadata-description]",
    );
    const tagsEl = this.querySelector<HTMLElement>(
      "[data-video-metadata-tags]",
    );

    if (!metadata || !titleEl || !descriptionEl || !tagsEl) return;

    if (entry.title) {
      titleEl.textContent = entry.title;
      titleEl.hidden = false;
    }

    if (entry.description) {
      descriptionEl.textContent = entry.description;
      descriptionEl.hidden = false;
    }

    if (entry.tags.length > 0) {
      tagsEl.replaceChildren(
        ...entry.tags.map((tag) => {
          const span = document.createElement("span");
          span.textContent = `#${tag}`;
          return span;
        }),
      );
      tagsEl.hidden = false;
    }

    metadata.hidden = !(entry.title || entry.description || entry.tags.length);
  }
}

if (
  typeof window !== "undefined" &&
  !customElements.get("video-player-shell")
) {
  customElements.define("video-player-shell", VideoPlayerShell);
}
