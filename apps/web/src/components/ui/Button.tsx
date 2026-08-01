import React from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

/** Supported button visual variants. */
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";

/** Supported button sizes. */
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant. */
  variant?: ButtonVariant;
  /** Size preset. */
  size?: ButtonSize;
  /** Shows a loading spinner and disables interactions. */
  isLoading?: boolean;
  /** Icon element rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Icon element rendered after the label. */
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[36px]",
  md: "px-4 py-2 text-sm gap-2 min-h-[44px]",
  lg: "px-6 py-3 text-base gap-2.5 min-h-[48px]",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary hover:bg-primary-hover active:brightness-90 text-text-inverse shadow-md",
  secondary:
    "bg-secondary/10 hover:bg-secondary/20 active:bg-secondary/30 text-secondary border border-secondary/30",
  danger:
    "bg-error hover:brightness-90 active:brightness-80 text-white shadow-md",
  ghost:
    "bg-transparent hover:bg-overlay/5 active:bg-overlay/10 text-text-secondary hover:text-text-primary",
  outline:
    "bg-transparent hover:bg-overlay/5 active:bg-overlay/10 text-text-primary border border-border-card hover:border-text-muted",
};

/**
 * Primary interactive button component.
 * Supports variants, sizes, loading state, and icon slots.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center font-medium rounded-lg",
        "transition-all duration-150 ease-standard cursor-pointer select-none",
        "active:scale-[0.97]",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
