export type ColumnName = "id" | "date" | "type" | "amount" | "description" | "category" | "paymentmethod" | "notes";

export type SortField = "date" | "amount" | "description" | "type";

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
  columns?: ColumnName[];
  sortBy?: SortField;
  sortOrder?: "asc" | "desc";
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
  columns?: ColumnName[];
  sortBy?: SortField;
  sortOrder?: "asc" | "desc";
}
