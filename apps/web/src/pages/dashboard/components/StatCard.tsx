import React from "react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  /** Card title label. */
  title: string;
  /** Primary value display. */
  value: string;
  /** Subtext / trend description. */
  subtext: string;
  /** Lucide icon component. */
  icon: LucideIcon;
  /** Trend direction for color coding. */
  trend?: "up" | "down" | "neutral";
  /** Icon background color class. */
  iconBg?: string;
  /** Icon color class. */
  iconColor?: string;
}

/**
 * Glassmorphic KPI metric card for dashboard statistics.
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend = "neutral",
  iconBg = "bg-primary/15",
  iconColor = "text-primary",
}) => {
  return (
    <div className="glass rounded-xl p-5 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-150">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">{title}</span>
        <div
          className={clsx(
            "size-10 rounded-xl flex items-center justify-center",
            iconBg,
          )}
        >
          <Icon className={clsx("size-5", iconColor)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary tabular-nums mb-1">
        {value}
      </p>
      <p
        className={clsx(
          "text-xs font-medium",
          trend === "up" && "text-warning",
          trend === "down" && "text-success",
          trend === "neutral" && "text-text-muted",
        )}
      >
        {subtext}
      </p>
    </div>
  );
};
