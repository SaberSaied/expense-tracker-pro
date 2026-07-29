import { z } from "zod";

export const createBudgetSchema = z.object({
  targetAmount: z.number().min(0, "Target amount must be >= 0"),
  alertThreshold: z.number().int().min(1).max(100).optional(),
  period: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  categoryId: z.string().uuid("Invalid category ID"),
});

export const updateBudgetSchema = createBudgetSchema.partial();
