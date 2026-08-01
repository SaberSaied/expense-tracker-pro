import React, { useEffect, useId, useRef, useState } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks";

export interface ModalProps {
  /** Whether the modal is visible. */
  isOpen: boolean;
  /** Callback fired when the modal should close. */
  onClose: () => void;
  /** Modal title displayed in the header. */
  title?: string;
  /** Optional description below the title. */
  description?: string;
  /** Accessible name used when no visible `title` is rendered (e.g. ConfirmDialog). */
  ariaLabel?: string;
  /** Modal content. */
  children: React.ReactNode;
  /** Maximum width class override. */
  maxWidth?: string;
}

/**
 * Overlay modal dialog with focus trap, backdrop blur, and Escape-to-close.
 * Follows the accessibility guidelines from 11-states-and-feedback.md.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  ariaLabel,
  children,
  maxWidth = "max-w-lg",
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  // Keeps the dialog mounted for the exit animation once isOpen flips to false.
  const [mounted, setMounted] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Unique IDs per instance so multiple mounted dialogs never collide (WCAG 1.3.1).
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Drive the exit animation: stay mounted briefly after isOpen → false.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    // Skip the exit animation entirely for users who prefer reduced motion.
    if (prefersReducedMotion) {
      setMounted(false);
      return;
    }
    setClosing(true);
    // Must outlast the longest exit animation (slide-down = 0.2s).
    closeTimerRef.current = window.setTimeout(() => {
      setMounted(false);
    }, 220);
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, [isOpen, mounted, prefersReducedMotion]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Auto-focus first input or focusable element on open if focus is outside the modal
    const frameId = requestAnimationFrame(() => {
      if (dialogRef.current && !dialogRef.current.contains(document.activeElement)) {
        const focusTarget =
          dialogRef.current.querySelector<HTMLElement>("input:not([type='hidden']), select, textarea") ??
          dialogRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
        focusTarget?.focus();
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-label={!title && ariaLabel ? ariaLabel : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* Backdrop */}
      <div
        className={clsx(
          "absolute inset-0 bg-black/60 backdrop-blur-sm",
          closing
            ? "animate-[fade-out_0.15s_ease-in_forwards]"
            : "animate-[fade-in_0.2s_ease-out]",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog — bottom sheet on mobile, centered dialog on sm+ */}
      <div
        ref={dialogRef}
        className={clsx(
          "relative w-full max-h-[92dvh] flex flex-col overflow-hidden",
          "rounded-t-2xl sm:rounded-2xl bg-bg-card border border-border-card shadow-modal",
          closing
            ? "animate-[slide-down_0.2s_ease-in_forwards] sm:animate-[scale-out_0.15s_ease-in_forwards]"
            : "animate-[slide-up_0.3s_ease-out] sm:animate-[scale-in_0.2s_ease-out]",
          maxWidth,
        )}
      >
        {/* Header — sticky within the scrollable sheet */}
        {title && (
          <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-border-card/50 shrink-0">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-lg font-semibold text-text-primary"
              >
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-text-secondary">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 -m-1 text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-colors shrink-0"
              aria-label="Close dialog"
            >
              <X className="size-5" />
            </button>
          </div>
        )}

        {/* Close button for title-less dialogs (e.g. ConfirmDialog) — WCAG 2.4.3:
            every dialog needs a visible, keyboard-reachable dismissal control. */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-2 text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-colors shrink-0 z-10"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        )}

        {/* Content — scrolls independently on small screens */}
        <div className="p-6 pt-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
