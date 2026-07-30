export interface CreateSavingsGoalInput {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  icon?: string;
  color?: string;
}

export interface UpdateSavingsGoalInput {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  icon?: string;
  color?: string;
}

export interface SavingsGoalQueryFilters {
  status?: "active" | "completed";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sortBy?: "deadline" | "targetAmount" | "priority" | "createdAt" | "currentAmount";
  sortOrder?: "asc" | "desc";
}
