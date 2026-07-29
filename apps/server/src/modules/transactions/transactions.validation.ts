import { z } from "zod";

const transactionTypeSchema = z.enum(["INCOME", "EXPENSE", "TRANSFER"]);

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  amount: z.number().positive("Amount must be positive"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be at most 500 characters"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  notes: z.string().max(2000).optional(),
  categoryId: z.string().uuid("Invalid category ID"),
  paymentMethodId: z.string().uuid("Invalid payment method ID").optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one transaction ID is required"),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one transaction ID is required"),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  paymentMethodId: z.string().uuid("Invalid payment method ID").nullable().optional(),
});

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  type: transactionTypeSchema.optional(),
  categoryId: z.string().uuid().optional(),
  paymentMethodId: z.string().uuid().optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sortBy: z.enum(["date", "amount", "createdAt", "updatedAt", "description"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  search: z.string().max(200).optional(),
});
