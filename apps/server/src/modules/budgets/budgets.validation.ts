import { z } from "zod";

const budgetPeriodSchema = z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]);

export const createBudgetSchema = z.object({
  targetAmount: z.number().min(0, "Target amount must be >= 0"),
  alertThreshold: z.number().int().min(1).max(100).optional(),
  period: budgetPeriodSchema.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  categoryId: z.string().uuid("Invalid category ID"),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const budgetQuerySchema = z.object({
  period: budgetPeriodSchema.optional(),
  status: z.enum(["active", "inactive"]).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  sortBy: z.enum(["startDate", "targetAmount", "period", "createdAt"]).optional().default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
