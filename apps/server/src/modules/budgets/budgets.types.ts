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

export interface BudgetQueryFilters {
  period?: string;
  status?: "active" | "inactive";
  startDate?: string;
  endDate?: string;
  sortBy?: "startDate" | "targetAmount" | "period" | "createdAt";
  sortOrder?: "asc" | "desc";
}
