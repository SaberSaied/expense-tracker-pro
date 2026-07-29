import React from "react";
import {
  Tag,
  UtensilsCrossed,
  Car,
  Home,
  Zap,
  Film,
  Heart,
  Cloud,
  Wine,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Plane,
  Gift,
  PawPrint,
  Dumbbell,
  BookOpen,
  Sparkles,
  Apple,
  Repeat,
  Shield,
  TrendingUp,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

/**
 * Map of icon name strings to their Lucide React components.
 * Kept in sync with CATEGORY_ICONS in @expense-tracker/types.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Tag,
  UtensilsCrossed,
  Car,
  Home,
  Zap,
  Film,
  Heart,
  Cloud,
  Wine,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Plane,
  Gift,
  PawPrint,
  Dumbbell,
  BookOpen,
  Sparkles,
  Apple,
  Repeat,
  Shield,
  TrendingUp,
  MoreHorizontal,
};

export interface CategoryIconProps extends React.SVGProps<SVGSVGElement> {
  /** Lucide icon name string (e.g. "UtensilsCrossed", "Car"). */
  name: string;
  /** Optional size in px — defaults to 16 (size-4). */
  size?: number;
}

/**
 * Renders a Lucide icon by its string name.
 * Falls back to a simple letter initial if the icon is unknown.
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  size = 16,
  className,
  ...props
}) => {
  const Icon = ICON_MAP[name];

  if (!Icon) {
    // Fallback: show the first letter of the icon name
    return (
      <span
        className="inline-flex items-center justify-center font-bold select-none"
        style={{ width: size, height: size, fontSize: size * 0.6 }}
        aria-hidden="true"
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return <Icon size={size} className={className} {...props} />;
};
