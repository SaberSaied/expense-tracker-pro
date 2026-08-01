import React from "react";
import { clsx } from "clsx";
import { AlertCircle, X } from "lucide-react";

export interface ValidationErrorsProps {
  /** Field → messages map (from ApiError.details). */
  errors?: Record<string, string[]>;
  /** Called when the dismiss button is clicked. */
  onDismiss?: () => void;
  /** Extra classes applied to the root container. */
  className?: string;
}

/**
 * Inline alert summarizing server-side validation errors.
 * Renders each field's messages as a compact, scannable list.
 */
export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  errors,
  onDismiss,
  className,
}) => {
  if (!errors) return null;

  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <div
      role="alert"
      className={clsx(
        "rounded-xl border border-error/30 bg-error/10 p-4 text-left",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="size-5 text-error shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            Please fix the following:
          </p>
          <ul className="mt-2 space-y-1.5">
            {entries.map(([field, messages]) => (
              <li key={field} className="text-xs text-text-secondary leading-relaxed">
                <span className="font-medium text-text-primary capitalize">
                  {field.replace(/\./g, " ")}
                </span>
                {": "}
                {messages.join(", ")}
              </li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-colors shrink-0"
            aria-label="Dismiss validation errors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
};
