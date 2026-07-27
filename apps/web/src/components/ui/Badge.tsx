import React from "react";
import { clsx } from "clsx";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual variant controlling color. */
  variant?: BadgeVariant;
  /** Optional dot indicator before the label. */
  dot?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-text-secondary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/15 text-error",
  info: "bg-info/15 text-info",
  secondary: "bg-secondary/15 text-secondary",
};

/**
 * Status or category badge with color variants.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  dot = false,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      )}
      {children}
    </span>
  );
};
