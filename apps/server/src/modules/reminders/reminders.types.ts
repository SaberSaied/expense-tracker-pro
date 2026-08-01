export type ReminderType = "RECURRING_EXPENSE" | "RECURRING_INCOME" | "SAVINGS_CONTRIBUTION" | "CUSTOM";
export type ReminderFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface CreateReminderInput {
  type: ReminderType;
  title: string;
  message?: string;
  amount?: number;
  frequency?: ReminderFrequency;
  interval?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  startDate: string;
  enabled?: boolean;
  categoryId?: string;
  savingsGoalId?: string;
}

export interface UpdateReminderInput {
  type?: ReminderType;
  title?: string;
  message?: string | null;
  amount?: number | null;
  frequency?: ReminderFrequency;
  interval?: number;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  startDate?: string;
  enabled?: boolean;
  categoryId?: string | null;
  savingsGoalId?: string | null;
}

export interface ReminderQueryFilters {
  type?: ReminderType;
  frequency?: ReminderFrequency;
  enabled?: boolean;
  sortBy?: "createdAt" | "startDate" | "nextTriggerDate" | "title";
  sortOrder?: "asc" | "desc";
}
