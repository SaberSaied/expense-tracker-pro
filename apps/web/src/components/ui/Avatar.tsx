import React from "react";
import { clsx } from "clsx";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL. */
  src?: string;
  /** Alt text for the avatar image. */
  alt?: string;
  /** Fallback initials when no image is available. */
  initials?: string;
  /** Size preset. */
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-32 text-2xl",
};

/**
 * Circular avatar with optional image and fallback initials.
 */
export const Avatar = React.memo(function Avatar({
  src,
  alt = "User avatar",
  initials,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      className={clsx(
        "relative rounded-full overflow-hidden flex items-center justify-center",
        "bg-primary/20 text-primary font-semibold",
        "border-2 border-border-glass",
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        <span role="img" aria-label={alt}>
          {initials ?? "?"}
        </span>
      )}
    </div>
  );
});
