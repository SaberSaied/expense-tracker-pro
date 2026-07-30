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
