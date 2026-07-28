import { Currency } from "@/generated/prisma/client";

// ─── API ──────────────────────────────────────────────────────

export const API_PREFIX = "/api/v1";

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

// ─── Common Currencies ────────────────────────────────────────

export const SUPPORTED_CURRENCIES: Currency[] = Object.values(Currency);

export const DEFAULT_CURRENCY = Currency.USD;

// ─── Regular Expressions ──────────────────────────────────────

export const REGEX = {
  /** UUID v4 format */
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  /** ISO 8601 date (YYYY-MM-DD) */
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  /** Hexadecimal color */
  HEX_COLOR: /^#[0-9a-fA-F]{6}$/,
} as const;

// ─── System Category Defaults ─────────────────────────────────

export const SYSTEM_CATEGORIES = [
  { name: "Food & Dining",       icon: "UtensilsCrossed", color: "#F59E0B" },
  { name: "Transportation",      icon: "Car",            color: "#06B6D4" },
  { name: "Housing & Rent",      icon: "Home",           color: "#8B5CF6" },
  { name: "Utilities",           icon: "Zap",            color: "#10B981" },
  { name: "Entertainment",       icon: "Film",           color: "#F43F5E" },
  { name: "Healthcare",          icon: "Heart",          color: "#EC4899" },
  { name: "Shopping",            icon: "ShoppingBag",    color: "#F97316" },
  { name: "Education",           icon: "BookOpen",       color: "#A855F7" },
  { name: "Travel",              icon: "Plane",          color: "#14B8A6" },
  { name: "Personal Care",       icon: "Sparkles",       color: "#E879F9" },
  { name: "Groceries",           icon: "Apple",          color: "#22C55E" },
  { name: "Subscriptions",       icon: "Repeat",         color: "#3B82F6" },
  { name: "Insurance",           icon: "Shield",         color: "#64748B" },
  { name: "Savings & Investments", icon: "TrendingUp",   color: "#10B981" },
  { name: "Income",              icon: "Briefcase",      color: "#22C55E" },
  { name: "Other",               icon: "MoreHorizontal", color: "#94A3B8" },
] as const;

// ─── Notification Defaults ────────────────────────────────────

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  budgetAlerts: true,
  emailWarnings: true,
  weeklyDigest: false,
} as const;
