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

export type CategorySummaryQueryInput = z.infer<typeof categorySummaryQuerySchema>;
export type MonthlyTrendQueryInput = z.infer<typeof monthlyTrendQuerySchema>;
