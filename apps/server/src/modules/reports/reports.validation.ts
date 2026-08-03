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
  year: z
    .string()
    .regex(/^\d{4}$/, "Invalid year format (YYYY)")
    .optional(),
  month: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, "Invalid month format (01-12)")
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
});

export const yearlyReportQuerySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, "Invalid year format (YYYY)")
    .optional(),
});

export const customReportQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  categoryId: z.string().uuid("Invalid category UUID").optional(),
  paymentMethodId: z.string().uuid("Invalid payment method UUID").optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional(),
  minAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid minAmount")
    .optional(),
  maxAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid maxAmount")
    .optional(),
});

export const reportSummaryQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
});

export const reportBreakdownQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
});

export type CategorySummaryQueryInput = z.infer<typeof categorySummaryQuerySchema>;
export type MonthlyTrendQueryInput = z.infer<typeof monthlyTrendQuerySchema>;
export type DailyReportQueryInput = z.infer<typeof dailyReportQuerySchema>;
export type WeeklyReportQueryInput = z.infer<typeof weeklyReportQuerySchema>;
export type MonthlyReportQueryInput = z.infer<typeof monthlyReportQuerySchema>;
export type YearlyReportQueryInput = z.infer<typeof yearlyReportQuerySchema>;
export type CustomReportQueryInput = z.infer<typeof customReportQuerySchema>;
export type ReportSummaryQueryInput = z.infer<typeof reportSummaryQuerySchema>;
export type ReportBreakdownQueryInput = z.infer<typeof reportBreakdownQuerySchema>;
