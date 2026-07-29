export interface CreateBudgetInput {
  targetAmount: number;
  alertThreshold?: number;
  period?: string;
  startDate: string;
  categoryId: string;
}

export interface UpdateBudgetInput {
  targetAmount?: number;
  alertThreshold?: number;
  period?: string;
  startDate?: string;
}
