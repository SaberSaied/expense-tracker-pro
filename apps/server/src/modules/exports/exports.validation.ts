import { z } from "zod";

export const formatSchema = z.enum(["csv", "pdf"]).optional().default("csv");

export const orientationSchema = z.enum(["portrait", "landscape"]).optional().default("portrait");

export const sortOrderSchema = z.enum(["asc", "desc"]).optional().default("desc");

export const sortBySchema = z.enum(["date", "amount", "description", "type"]).optional().default("date");

/** Valid column names for transaction exports */
export const transactionColumnSchema = z.enum([
  "id", "date", "type", "amount", "description",
  "category", "paymentmethod", "notes",
]);

export const columnsSchema = z
  .string()
  .transform((val) => val.split(",").map((c) => c.trim().toLowerCase()))
  .pipe(z.array(transactionColumnSchema).min(1).max(8))
  .optional();

const uuidField = () => z.string().uuid("Invalid UUID").optional();

export const exportTransactionsQuerySchema = z.object({
  format: formatSchema,
  columns: columnsSchema,
  sortBy: sortBySchema,
  sortOrder: sortOrderSchema,
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
  orientation: orientationSchema,
  columns: columnsSchema,
  sortBy: sortBySchema,
  sortOrder: sortOrderSchema,
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
export type ColumnsType = z.infer<typeof columnsSchema>;
export type ExportTransactionsQueryInput = z.infer<typeof exportTransactionsQuerySchema>;
export type ExportReportQueryInput = z.infer<typeof exportReportQuerySchema>;
