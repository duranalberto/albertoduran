/**
 * Theme settings shared by the pre-paint inline script in BaseLayout and the
 * runtime theme manager. Plain values only, so they can be passed through
 * `define:vars`.
 */

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/** `<meta name="theme-color">` per theme (browser UI chrome). */
export const THEME_META_COLORS: Readonly<Record<Theme, string>> = {
  light: "#ffffff",
  dark: "#121212",
};

/** A valid stored choice wins; anything else follows the system preference. */
export function resolveTheme(
  stored: string | null,
  prefersDark: boolean,
): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}
