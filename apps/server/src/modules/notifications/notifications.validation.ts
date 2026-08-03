import { z } from "zod";

/**
 * Schema for updating notification preferences.
 * All fields are optional for partial updates.
 */
export const updateNotificationPreferencesSchema = z.object({
  enabled: z.boolean().optional(),
  budgetAlerts: z.boolean().optional(),
  budgetCriticalAlerts: z.boolean().optional(),
  emailWarnings: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  monthlySummary: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "reminderTime must be in HH:mm format (24-hour)")
    .optional(),
  channels: z
    .object({
      inApp: z.boolean().optional(),
      email: z.boolean().optional(),
      push: z.boolean().optional(),
    })
    .optional(),
});

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;

/**
 * Query schema for the monthly summary endpoints.
 * `month` is optional and must be formatted as YYYY-MM (defaults to the previous month).
 */
export const monthlySummaryQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Invalid month format (YYYY-MM)")
    .refine((val) => {
      const m = Number(val.split("-")[1]);
      return m >= 1 && m <= 12;
    }, "Month must be between 01 and 12")
    .optional(),
});

export type MonthlySummaryQuery = z.infer<typeof monthlySummaryQuerySchema>;

/**
 * Query schema for listing notifications (Notification Center).
 * Supports filtering by read status and type, plus pagination.
 */
export const notificationQuerySchema = z.object({
  read: z.enum(["true", "false"]).optional(),
  type: z
    .enum([
      "BUDGET_WARNING",
      "BUDGET_CRITICAL",
      "EXPORT_COMPLETE",
      "WEEKLY_DIGEST",
      "REMINDER",
      "MONTHLY_SUMMARY",
    ])
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type NotificationQuery = z.infer<typeof notificationQuerySchema>;

/**
 * Body schema for cleaning up expired notifications.
 */
export const cleanupNotificationsSchema = z.object({
  olderThanDays: z.coerce.number().int().positive().max(3650).optional(),
  readOnly: z.boolean().optional(),
});

export type CleanupNotificationsInput = z.infer<typeof cleanupNotificationsSchema>;
