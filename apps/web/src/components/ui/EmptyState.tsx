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
  /** Icon color class override. */
  iconColor?: string;
}

/**
 * Encouraging empty state with icon, message, and optional action button.
 * Used when data views have zero items.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconColor = "text-primary",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className={clsx(
          "size-16 rounded-2xl flex items-center justify-center mb-6",
          "bg-primary/10",
        )}
      >
        <Icon className={clsx("size-8", iconColor)} />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
