import type { Request } from "express";

// ─── JWT ──────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

// ─── Authenticated Request ────────────────────────────────────

/**
 * Express request with authenticated user attached.
 */
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

// ─── Pagination ───────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

// ─── Date Range ───────────────────────────────────────────────

export interface DateRange {
  startDate: string;
  endDate: string;
}

/** Date range preset identifiers for chart filtering. */
export type DateRangePreset =
  "today" | "this_week" | "this_month" | "last_month" | "this_year" | "custom";

/** Query params for date-range-filtered endpoints. */
export interface DateRangeFilter {
  range: DateRangePreset;
  startDate?: string;
  endDate?: string;
}
