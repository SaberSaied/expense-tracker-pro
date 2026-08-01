import { ApiError } from "@/services/api";

/**
 * Extracts the `details` field-error map from an API error,
 * or undefined when the error has no structured validation details.
 */
export function extractFieldErrors(err: unknown): Record<string, string[]> | undefined {
  if (err instanceof ApiError && err.details && Object.keys(err.details).length > 0) {
    return err.details;
  }
  return undefined;
}

/**
 * Moves keyboard focus to the first field in a form that has a validation
 * error (WCAG 3.3.1 Error Identification — errors must be easy to locate).
 * No-op when the form or an invalid field is not present.
 */
export function focusFirstInvalidField(formId: string): void {
  const form = document.getElementById(formId);
  const firstInvalid = form?.querySelector<HTMLElement>('[aria-invalid="true"]');
  firstInvalid?.focus();
}
