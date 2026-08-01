import React from "react";

/**
 * Lightweight page-level loading fallback for Suspense boundaries.
 * Used inside the layouts (around <Outlet />) so the app chrome stays
 * mounted while a lazy route chunk is being fetched.
 */
export const RouteFallback: React.FC = () => {
  return (
    <div
      className="flex min-h-[50dvh] items-center justify-center"
      role="status"
      aria-label="Loading page"
      aria-live="polite"
    >
      <div
        className="size-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"
        aria-hidden="true"
      />
    </div>
  );
};
