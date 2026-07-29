import React from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label text rendered next to the checkbox. */
  label?: string;
  indeterminate?: boolean;
}

/**
 * Custom accessible checkbox with emerald accent.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, indeterminate, ...props }, ref) => {
    const checkboxId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate]);

    return (
      <label
        htmlFor={checkboxId}
        className={clsx(
          "inline-flex items-center gap-2.5 cursor-pointer select-none group",
          props.disabled && "opacity-40 cursor-not-allowed",
          className,
        )}
      >
        <div className="relative flex items-center justify-center">
          <input
            ref={inputRef}
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={clsx(
              "size-5 rounded border-2 transition-all duration-150",
              "border-border-input bg-bg-input",
              "peer-checked:bg-primary peer-checked:border-primary",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-app",
            )}
          >
            <Check className="size-3.5 text-text-inverse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          {/* Overlay checkmark that responds to peer-checked */}
          <Check className="size-3.5 text-text-inverse absolute opacity-0 pointer-events-none transition-opacity peer-checked:opacity-100" />
        </div>
        {label && (
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
