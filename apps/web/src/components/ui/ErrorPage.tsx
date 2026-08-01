import React from "react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "./Button";

export interface ErrorPageProps {
  /** Optional status code / short code label (e.g. "404", "500", "OFFLINE"). */
  code?: string;
  /** Lucide icon used in the illustration. */
  icon: LucideIcon;
  /** Headline title. */
  title: string;
  /** Clear, human-friendly description of what went wrong. */
  description: string;
  /** Illustration tint class override. */
  iconColor?: string;
  /** Optional retry action — shows a "Try Again" button when provided. */
  onRetry?: () => void;
  /** Custom retry button label. */
  retryLabel?: string;
  /** Primary navigation button (e.g. "Back to Dashboard"). */
  primaryLabel?: string;
  onPrimary?: () => void;
  /** Secondary navigation button (e.g. "Go Back"). */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Hides the brand header — used when embedded inside the app shell. */
  showBrand?: boolean;
  /** Extra classes applied to the root container. */
  className?: string;
}

/**
 * Full-page error state with an illustration, clear message, retry action,
 * and navigation options. Used for 404, 500, network, auth, and validation errors.
 */
export const ErrorPage: React.FC<ErrorPageProps> = ({
  code,
  icon: Icon,
  title,
  description,
  iconColor = "text-error",
  onRetry,
  retryLabel = "Try Again",
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  showBrand = true,
  className,
}) => {
  return (
    <div
      className={clsx(
        "relative flex min-h-dvh flex-col items-center justify-center px-6 py-12 overflow-hidden",
        className,
      )}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 bg-bg-app" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/6 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md text-center">
        {/* Brand header */}
        {showBrand && (
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <TrendingUp className="size-5 text-primary" />
            </div>
            <span className="font-bold text-text-primary">
              Expense<span className="text-primary">Pro</span>
            </span>
          </div>
        )}

        {/* Illustration — layered glow, ring, badge */}
        <div className={clsx("relative inline-flex mb-6", iconColor)}>
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-full bg-current/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -inset-3.5 rounded-full border border-dashed border-current/25"
          />
          <div className="relative flex size-20 items-center justify-center rounded-2xl bg-current/10 ring-1 ring-current/20 transition-transform duration-200 hover:scale-105">
            <Icon className="size-10" strokeWidth={1.75} />
          </div>
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 size-2.5 rounded-full bg-current/40"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-1 -left-1 size-1.5 rounded-full bg-current/30"
          />
        </div>

        {/* Status code badge */}
        {code && (
          <span className="inline-block font-mono text-xs font-semibold tracking-widest text-text-muted uppercase bg-overlay/5 border border-border-card rounded-full px-3 py-1 mb-3">
            Error {code}
          </span>
        )}

        <h1 className="text-2xl font-bold text-text-primary mb-3">{title}</h1>
        <p className="text-sm text-text-secondary max-w-sm mx-auto mb-8 leading-relaxed">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              leftIcon={<RefreshCw className="size-4" />}
            >
              {retryLabel}
            </Button>
          )}
          {onPrimary && primaryLabel && (
            <Button onClick={onPrimary}>{primaryLabel}</Button>
          )}
          {onSecondary && secondaryLabel && (
            <Button
              variant="ghost"
              onClick={onSecondary}
              leftIcon={<ArrowLeft className="size-4" />}
            >
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
