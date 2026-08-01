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
  page?: number;
  limit?: number;
}

export interface ExportTransactionsResult {
  csv: string;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExportTransactionsXlsxResult {
  buffer: Buffer;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
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
