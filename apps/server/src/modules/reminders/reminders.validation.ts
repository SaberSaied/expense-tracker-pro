import { z } from "zod";

const reminderTypeSchema = z.enum([
  "RECURRING_EXPENSE",
  "RECURRING_INCOME",
  "SAVINGS_CONTRIBUTION",
  "CUSTOM",
]);

const reminderFrequencySchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

export const createReminderSchema = z
  .object({
    type: reminderTypeSchema,
    title: z.string().min(1, "Title is required").max(100, "Title must be at most 100 characters"),
    message: z.string().max(500, "Message must be at most 500 characters").optional(),
    amount: z.number().positive("Amount must be positive").optional(),
    frequency: reminderFrequencySchema.optional(),
    interval: z
      .number()
      .int()
      .min(1, "Interval must be at least 1")
      .max(365, "Interval must be at most 365")
      .optional(),
    dayOfWeek: z
      .number()
      .int()
      .min(0)
      .max(6, "Day of week must be 0 (Sunday) - 6 (Saturday)")
      .optional(),
    dayOfMonth: z.number().int().min(1).max(31, "Day of month must be 1-31").optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    enabled: z.boolean().optional(),
    categoryId: z.string().uuid("Invalid category ID").optional(),
    savingsGoalId: z.string().uuid("Invalid savings goal ID").optional(),
  })
  // Financial reminder types (expense/income/contribution) must carry an amount.
  .superRefine((data, ctx) => {
    if (data.type !== "CUSTOM" && data.amount === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Amount is required for this reminder type",
      });
    }
  });

export const updateReminderSchema = z.object({
  type: reminderTypeSchema.optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters")
    .optional(),
  message: z.string().max(500, "Message must be at most 500 characters").nullable().optional(),
  amount: z.number().positive("Amount must be positive").nullable().optional(),
  frequency: reminderFrequencySchema.optional(),
  interval: z
    .number()
    .int()
    .min(1, "Interval must be at least 1")
    .max(365, "Interval must be at most 365")
    .optional(),
  dayOfWeek: z
    .number()
    .int()
    .min(0)
    .max(6, "Day of week must be 0 (Sunday) - 6 (Saturday)")
    .nullable()
    .optional(),
  dayOfMonth: z.number().int().min(1).max(31, "Day of month must be 1-31").nullable().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  enabled: z.boolean().optional(),
  categoryId: z.string().uuid("Invalid category ID").nullable().optional(),
  savingsGoalId: z.string().uuid("Invalid savings goal ID").nullable().optional(),
});

export const reminderQuerySchema = z.object({
  type: reminderTypeSchema.optional(),
  frequency: reminderFrequencySchema.optional(),
  enabled: z.enum(["true", "false"]).optional(),
  sortBy: z
    .enum(["createdAt", "startDate", "nextTriggerDate", "title"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
