/**
 * Theme context — provides the active theme preference, the resolved theme,
 * and a setter that applies + persists the change immediately.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  applyThemeToDom,
  getStoredThemePreference,
  resolveTheme,
  setStoredThemePreference,
} from "@/utils/theme";
import type { ResolvedTheme, ThemePreference } from "@/utils/theme";

interface ThemeContextValue {
  /** User-selected preference ("dark" | "light" | "system"). */
  preference: ThemePreference;
  /** The concrete theme currently rendered (reacts to OS changes in system mode). */
  resolvedTheme: ResolvedTheme;
  /** Updates the preference, applies it to the DOM, and persists it. */
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const SYSTEM_QUERY = "(prefers-color-scheme: dark)";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Working preference: a saved local choice wins; otherwise fall back to the
  // account preference (if any), then to the OS preference.
  const [preference, setPreferenceState] = useState<ThemePreference>(
    () => getStoredThemePreference() ?? user?.theme ?? "system",
  );

  // Resolved theme is tracked as state so it stays in sync when the OS color
  // scheme changes while in "system" mode.
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(getStoredThemePreference() ?? user?.theme ?? "system"),
  );

  // Seed the account preference only when this device has no explicit local
  // choice yet — never overwrite a device-local selection (e.g. a theme the
  // user picked but has not yet saved to the server).
  useEffect(() => {
    const accountTheme = user?.theme;
    if (!accountTheme) return;
    if (getStoredThemePreference() !== null) return;
    setStoredThemePreference(accountTheme);
    setPreferenceState(accountTheme);
  }, [user?.theme]);

  // Recompute the resolved theme when the preference changes, and keep it
  // reactive to live OS color-scheme changes while in "system" mode.
  useEffect(() => {
    if (preference !== "system") {
      setResolvedTheme(resolveTheme(preference));
      return;
    }
    const mediaQuery = window.matchMedia(SYSTEM_QUERY);
    const applySystem = () => {
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");
    };
    applySystem();
    mediaQuery.addEventListener("change", applySystem);
    return () => mediaQuery.removeEventListener("change", applySystem);
  }, [preference]);

  // Apply the resolved theme to the DOM whenever it changes.
  useEffect(() => {
    applyThemeToDom(resolvedTheme);
  }, [resolvedTheme]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    setStoredThemePreference(next);
    applyThemeToDom(resolveTheme(next));
  }, []);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
