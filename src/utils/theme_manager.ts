/**
 * theme_manager.ts
 *
 * Single source of truth for all theme management.
 * Imported once as a module script in BaseLayout — Astro deduplicates
 * module scripts so this never runs more than once per page.
 */

const STORAGE_KEY = "theme";
const DEFAULT_THEME = "light";
const TOGGLE_ID = "theme-toggle-input";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStoredTheme(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSystemTheme(): string {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getTheme(): string {
  return getStoredTheme() ?? getSystemTheme() ?? DEFAULT_THEME;
}

function storeTheme(theme: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

function applyTheme(theme: string, target: Document = document): void {
  const root = target.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.setProperty("color-scheme", theme);
  const meta = target.getElementById("meta-theme-color");
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#121212" : "#ffffff");
  }
}

function suppressTransitions(on: boolean, target: Document = document): void {
  target.documentElement.classList.toggle("theme-switching", on);
}

// ─── Toggle binding ──────────────────────────────────────────────────────────

function syncToggle(input: HTMLInputElement): void {
  const current =
    document.documentElement.getAttribute("data-theme") ?? getTheme();
  input.checked = current === "dark";
}

function bindToggle(): void {
  const input = document.getElementById(TOGGLE_ID);
  if (!(input instanceof HTMLInputElement)) return;

  if (input.dataset.bound === "true") {
    syncToggle(input);
    return;
  }

  input.addEventListener("change", (e) => {
    const el = e.currentTarget as HTMLInputElement;
    const newTheme = el.checked ? "dark" : "light";

    storeTheme(newTheme);
    applyTheme(newTheme);
  });

  input.dataset.bound = "true";
  syncToggle(input);
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

document.addEventListener("astro:before-swap", (event) => {
  const e = event as Event & { newDocument?: Document };
  if (e.newDocument) {
    applyTheme(getTheme(), e.newDocument);
    suppressTransitions(true, e.newDocument);
  }
});

document.addEventListener("astro:after-swap", () => {
  applyTheme(getTheme());
  document.documentElement.classList.remove("no-js");
  requestAnimationFrame(() =>
    requestAnimationFrame(() => suppressTransitions(false)),
  );
});

document.addEventListener("astro:page-load", () => {
  document.documentElement.classList.remove("no-js");
  bindToggle();
});

bindToggle();
