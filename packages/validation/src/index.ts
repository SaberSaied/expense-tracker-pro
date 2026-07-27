import { z } from "zod";
import { EXPENSE_CATEGORIES } from "@expense-tracker/types";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
export const categorySchema = z.enum(EXPENSE_CATEGORIES);

export const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive").max(999_999_999.99),
  category: categorySchema,
  description: z.string().min(1, "Description is required").max(500),
  date: z.string().regex(isoDateRegex, "Date must be YYYY-MM-DD"),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseQuerySchema = z.object({
  category: categorySchema.optional(),
  startDate: z.string().regex(isoDateRegex).optional(),
  endDate: z.string().regex(isoDateRegex).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(["date", "amount", "category", "createdAt"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
