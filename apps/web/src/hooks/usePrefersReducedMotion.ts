/**
 * Hook that reports whether the user has requested reduced motion.
 *
 * Used to disable JS-driven animations (e.g. recharts SVG interpolation) that
 * cannot be covered by the CSS `prefers-reduced-motion` media query block.
 */
import { useState, useEffect } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function getPrefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);

  useEffect(() => {
    // The lazy initializer above already captures the value on first render;
    // this effect only subscribes to subsequent preference changes.
    const mediaQuery = window.matchMedia(QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}
