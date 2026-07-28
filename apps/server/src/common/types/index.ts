import type { Request } from "express";

// ─── JWT ──────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
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
