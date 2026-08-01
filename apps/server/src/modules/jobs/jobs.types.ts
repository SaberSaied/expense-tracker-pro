export type JobName =
  | "check-budgets"
  | "process-reminders"
  | "detect-upcoming-bills"
  | "generate-monthly-summaries"
  | "cleanup-notifications";

export interface JobRunSummary {
  job: JobName;
  users: number;
  generated: number;
  suppressed: number;
  errors: string[];
  /** Per-user results (trimmed for large user bases). */
  results: Array<Record<string, unknown>>;
}
