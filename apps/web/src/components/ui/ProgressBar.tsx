import React from "react";
import { clsx } from "clsx";

export interface ProgressBarProps {
  /** Current value (0–100). */
  value: number;
  /** Maximum value. Defaults to 100. */
  max?: number;
  /** Bar height preset. */
  size?: "sm" | "md" | "lg";
  /** Override the automatic threshold-based color. */
  color?: string;
  /** Show percentage label. */
  showLabel?: boolean;
  /** Accessible label. */
  label?: string;
}

/**
 * Animated progress bar with dynamic color thresholds.
 * < 70% → emerald (success), 70-89% → amber (warning), ≥ 90% → red (error).
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = "md",
  color,
  showLabel = false,
  label = "Progress",
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const autoColor =
    percentage >= 90
      ? "bg-error"
      : percentage >= 70
        ? "bg-warning"
        : "bg-success";

  const heightStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className="flex flex-col gap-1">
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>{label}</span>
          <span className="tabular-nums font-medium">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={clsx(
          "w-full rounded-full bg-white/5 overflow-hidden",
          heightStyles[size],
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500 ease-standard",
            color ?? autoColor,
            percentage >= 90 && "animate-pulse",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
