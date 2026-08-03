import React from "react";
import { clsx } from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable glassmorphic styling. */
  glass?: boolean;
  /** Enable hover lift effect. */
  hoverEffect?: boolean;
  children: React.ReactNode;
}

/**
 * Glassmorphic card container used across all modules.
 */
export const Card: React.FC<CardProps> = ({
  glass = true,
  hoverEffect = true,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "rounded-xl p-6 transition-all duration-150 ease-standard border",
        glass
          ? "bg-bg-card-glass backdrop-blur-md border-border-glass shadow-glass"
          : "bg-bg-card border-border-card shadow-card",
        hoverEffect && "hover:border-text-muted/30 hover:shadow-hover hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx("mb-4 flex flex-col gap-1", className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3
    className={clsx("text-lg font-semibold text-text-primary tracking-tight", className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={clsx("text-sm text-text-secondary", className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx(className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={clsx(
      "mt-6 flex items-center justify-between border-t border-border-card pt-4",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
