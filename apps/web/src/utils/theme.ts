/**
 * Theme engine — resolves the active theme, applies it to the DOM, and
 * persists the user's preference to localStorage.
 *
 * Supports three preference modes: "dark", "light", and "system" (which
 * follows the OS `prefers-color-scheme` setting and reacts to live changes).
 */

/** User-facing theme preference. */
export type ThemePreference = "dark" | "light" | "system";

/** Concrete theme applied to the DOM. */
export type ResolvedTheme = "dark" | "light";

const STORAGE_KEY = "expense-tracker-theme";
const SYSTEM_QUERY = "(prefers-color-scheme: dark)";

/** Reads the current OS color-scheme preference. */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia(SYSTEM_QUERY).matches ? "dark" : "light";
}

/** Maps a preference to the concrete theme to render. */
export function resolveTheme(preference: ThemePreference | undefined | null): ResolvedTheme {
  if (preference === "dark" || preference === "light") return preference;
  return getSystemTheme();
}

/** Applies a resolved theme to the document root (data-theme + color-scheme). */
export function applyThemeToDom(theme: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}

/** Persists the user's preference for the next session. */
export function setStoredThemePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Storage unavailable (private mode / disabled cookies) — non-fatal.
  }
}

/** Returns the persisted preference, or null when nothing was saved. */
export function getStoredThemePreference(): ThemePreference | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "dark" || value === "light" || value === "system") return value;
  } catch {
    // Ignore storage errors and fall through to the system default.
  }
  return null;
}

/**
 * Applies the initial theme synchronously before React mounts so there is no
 * flash of the wrong theme (FOUC). Falls back to the OS preference when the
 * user has not saved one yet.
 */
export function applyInitialTheme(): void {
  applyThemeToDom(resolveTheme(getStoredThemePreference()));
}
