import React from "react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  /** Lucide icon component. */
  icon: LucideIcon;
  /** Title text. */
  title: string;
  /** Descriptive subtitle. */
  description: string;
  /** Primary action button label. */
  actionLabel?: string;
  /** Callback when the action button is clicked. */
  onAction?: () => void;
  /** Icon + illustration tint class override. */
  iconColor?: string;
  /** Compact sizing for dashboard widgets and small panels. */
  compact?: boolean;
  /** Extra classes applied to the root container. */
  className?: string;
}

/**
 * Encouraging empty state with a soft illustration, message, and optional action button.
 * Used when data views have zero items.
 */
export const EmptyState = React.memo(function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconColor = "text-primary",
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center px-6 text-center",
        compact ? "py-8" : "py-16",
        className,
      )}
    >
      {/* Illustration — layered glow, ring, badge, and accent dots */}
      <div className={clsx("relative", iconColor, compact ? "mb-4" : "mb-6")}>
        {/* Soft glow behind the badge */}
        <div
          aria-hidden="true"
          className={clsx(
            "absolute rounded-full bg-current/10 blur-3xl",
            compact ? "-inset-4" : "-inset-6",
          )}
        />
        {/* Decorative dashed ring */}
        <div
          aria-hidden="true"
          className={clsx(
            "absolute rounded-full border border-dashed border-current/25",
            compact ? "-inset-2.5" : "-inset-3.5",
          )}
        />
        {/* Icon badge */}
        <div
          className={clsx(
            "relative flex items-center justify-center rounded-2xl bg-current/10 ring-1 ring-current/20",
            "transition-transform duration-200 hover:scale-105",
            compact ? "size-12" : "size-16",
          )}
        >
          <Icon
            className={clsx("", compact ? "size-5" : "size-8")}
            strokeWidth={1.75}
          />
        </div>
        {/* Accent dots */}
        <span
          aria-hidden="true"
          className={clsx(
            "absolute -right-1 -top-1 rounded-full bg-current/40",
            compact ? "size-1.5" : "size-2",
          )}
        />
        <span
          aria-hidden="true"
          className={clsx(
            "absolute -bottom-0.5 -left-1 rounded-full bg-current/30",
            compact ? "size-1" : "size-1.5",
          )}
        />
      </div>

      <h3
        className={clsx(
          "font-semibold text-text-primary mb-1.5",
          compact ? "text-base" : "text-lg",
        )}
      >
        {title}
      </h3>
      <p
        className={clsx(
          "text-text-secondary max-w-sm mb-5",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size={compact ? "sm" : "md"}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
});
