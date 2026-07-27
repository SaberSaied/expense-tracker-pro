import React from "react";
import { clsx } from "clsx";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input. */
  label?: string;
  /** Error message displayed below the input. */
  error?: string;
  /** Icon element rendered at the start of the input. */
  leftIcon?: React.ReactNode;
  /** Icon element rendered at the end of the input. */
  rightIcon?: React.ReactNode;
  /** Accessible helper/description text. */
  helperText?: string;
}

/**
 * Glassmorphic text input with label, icon slots, and error states.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, leftIcon, rightIcon, helperText, className, id, ...props },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full rounded-lg bg-bg-input border px-3 py-2.5 text-sm text-text-primary",
              "placeholder:text-text-muted",
              "transition-all duration-150 ease-standard",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error ? "border-border-error" : "border-border-input",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-error flex items-center gap-1"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
