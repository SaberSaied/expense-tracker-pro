export interface ExportTransactionsQuery {
  startDate?: string;
  endDate?: string;
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  categoryId?: string;
  paymentMethodId?: string;
  budgetId?: string;
  savingsGoalId?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExportReportQuery {
  type: "daily" | "weekly" | "monthly" | "yearly" | "summary" | "breakdown";
  year?: string;
  month?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  budgetId?: string;
  savingsGoalId?: string;
}
