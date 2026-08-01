import { z } from "zod";

export const JOB_NAMES = [
  "check-budgets",
  "process-reminders",
  "detect-upcoming-bills",
  "generate-monthly-summaries",
  "cleanup-notifications",
] as const;

export const jobNameParamSchema = z.object({
  name: z.enum(JOB_NAMES, {
    errorMap: () => ({ message: "Invalid job name" }),
  }),
});

export const runJobQuerySchema = z.object({
  windowDays: z.coerce.number().int().positive().max(90).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  retentionDays: z.coerce.number().int().positive().max(3650).optional(),
});
