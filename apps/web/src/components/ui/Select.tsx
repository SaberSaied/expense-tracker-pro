import React from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  /** Label text displayed above the select. */
  label?: string;
  /** Error message displayed below the select. */
  error?: string;
  /** Available options. */
  options: SelectOption[];
  /** Placeholder option text. */
  placeholder?: string;
}

/**
 * Accessible dropdown select with glassmorphic styling.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, required, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    // Guard against label-less selects so error ids never collide as "undefined-error".
    const errorId = error && selectId ? `${selectId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required || undefined}
            className={clsx(
              "w-full appearance-none rounded-lg bg-bg-input border px-3 py-2.5 pr-10 text-sm text-text-primary",
              "transition-all duration-150 ease-standard",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error ? "border-border-error" : "border-border-input",
              className,
            )}
            aria-invalid={!!error}
            aria-required={required || undefined}
            aria-describedby={errorId}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
        </div>
        {error && (
          <p id={errorId} className="text-xs text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
