import { z } from "zod";

export const formatSchema = z.enum(["csv", "pdf"]).optional().default("csv");

const uuidField = () => z.string().uuid("Invalid UUID").optional();

export const exportTransactionsQuerySchema = z.object({
  format: formatSchema,
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional(),
  categoryId: z.string().uuid("Invalid category UUID").optional(),
  paymentMethodId: z.string().uuid("Invalid payment method UUID").optional(),
  budgetId: uuidField(),
  savingsGoalId: uuidField(),
  minAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid minAmount")
    .optional(),
  maxAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid maxAmount")
    .optional(),
});

export const exportReportQuerySchema = z.object({
  format: formatSchema,
  type: z.enum(["daily", "weekly", "monthly", "yearly", "summary", "breakdown"]),
  year: z.string().regex(/^\d{4}$/, "Invalid year format (YYYY)").optional(),
  month: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month format (01-12)").optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  budgetId: uuidField(),
  savingsGoalId: uuidField(),
});

export type FormatType = z.infer<typeof formatSchema>;
export type ExportTransactionsQueryInput = z.infer<typeof exportTransactionsQuerySchema>;
export type ExportReportQueryInput = z.infer<typeof exportReportQuerySchema>;
