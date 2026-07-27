import React from "react";
import { clsx } from "clsx";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width class override. */
  width?: string;
  /** Height class override. */
  height?: string;
  /** Use circular shape. */
  circle?: boolean;
}

/**
 * Shimmer skeleton loader for perceived performance during data fetches.
 * Uses the animation defined in index.css.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "w-full",
  height = "h-4",
  circle = false,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "skeleton",
        circle ? "rounded-full" : "rounded-md",
        width,
        height,
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
};

/**
 * Skeleton variant matching a KPI stat card.
 */
export const StatCardSkeleton: React.FC = () => (
  <div className="rounded-xl bg-bg-card-glass backdrop-blur-md border border-border-glass p-6 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton width="w-24" height="h-3" />
      <Skeleton width="w-8" height="h-8" circle />
    </div>
    <Skeleton width="w-32" height="h-8" />
    <Skeleton width="w-20" height="h-3" />
  </div>
);

/**
 * Skeleton variant matching a table row.
 */
export const TableRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 py-3 px-4 border-b border-border-card/50">
    <Skeleton width="w-20" height="h-3" />
    <Skeleton width="w-32" height="h-3" />
    <Skeleton width="w-16" height="h-5" />
    <Skeleton width="w-20" height="h-3" />
    <Skeleton width="w-16" height="h-3" />
  </div>
);
