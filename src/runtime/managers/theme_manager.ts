/**
 * theme_manager.ts
 *
 * Single source of truth for all theme management.
 * Imported once as a module script in BaseLayout — Astro deduplicates
 * module scripts so this never runs more than once per page.
 */

import {
  resolveTheme,
  THEME_META_COLORS,
  THEME_STORAGE_KEY,
  type Theme,
} from "./theme_config";

const TOGGLE_ID = "theme-toggle-input";

function getStoredTheme(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getTheme(): Theme {
  return resolveTheme(
    getStoredTheme(),
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
}

function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

function applyTheme(theme: Theme, target: Document = document): void {
  const root = target.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.setProperty("color-scheme", theme);
  target
    .getElementById("meta-theme-color")
    ?.setAttribute("content", THEME_META_COLORS[theme]);
}

function suppressTransitions(on: boolean, target: Document = document): void {
  target.documentElement.classList.toggle("theme-switching", on);
}

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

document.addEventListener("astro:page-load", bindToggle);

bindToggle();
