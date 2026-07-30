import { z } from "zod";

export const categorySummaryQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
});

export const monthlyTrendQuerySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, "Invalid year format (YYYY)")
    .optional(),
});

export const dailyReportQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
});

export const weeklyReportQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
});

export const monthlyReportQuerySchema = z.object({
  year: z.string().regex(/^\d{4}$/, "Invalid year format (YYYY)").optional(),
  month: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month format (01-12)").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
});

export type CategorySummaryQueryInput = z.infer<typeof categorySummaryQuerySchema>;
export type MonthlyTrendQueryInput = z.infer<typeof monthlyTrendQuerySchema>;
export type DailyReportQueryInput = z.infer<typeof dailyReportQuerySchema>;
export type WeeklyReportQueryInput = z.infer<typeof weeklyReportQuerySchema>;
export type MonthlyReportQueryInput = z.infer<typeof monthlyReportQuerySchema>;
