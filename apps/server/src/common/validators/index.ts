import { z } from "zod";

// ─── Pagination ───────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ─── UUID ─────────────────────────────────────────────────────

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});

// ─── Date Range ───────────────────────────────────────────────

export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

// ─── Common Fields ────────────────────────────────────────────

export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");
