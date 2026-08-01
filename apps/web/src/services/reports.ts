/**
 * Reports API service.
 * Financial analytics — summaries, category breakdowns, and monthly trends.
 */
import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────

/** Overall spending summary for a date range. */
export interface ReportSummary {
  income: number;
  expenses: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  averageTransactionAmount: number;
  averageIncome: number;
  averageExpense: number;
}

/** Per-category row in a category summary report. */
export interface CategorySummaryItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  count: number;
  percentage: number;
  transactions: Array<{
    amount: number;
    date: string;
    description: string;
  }>;
}

/** Category summary report (grouped expenses for a date range). */
export interface CategorySummaryReport {
  startDate: string;
  endDate: string;
  grandTotal: number;
  categoryCount: number;
  categories: CategorySummaryItem[];
}

/** Monthly income/expense point for the trend chart. */
export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

/** Monthly trend report for a given year. */
export interface MonthlyTrendReport {
  year: number;
  months: MonthlyTrendPoint[];
}

/** Income vs expense comparison block. */
export interface IncomeVsExpense {
  income: number;
  expenses: number;
  net: number;
  incomeCount: number;
  expenseCount: number;
  incomePercentage: number;
  expensePercentage: number;
}

/** Per-category breakdown row. */
export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  count: number;
  percentage: number;
}

/** Full breakdown report. */
export interface ReportBreakdown {
  categoryBreakdown: CategoryBreakdownItem[];
  paymentMethodBreakdown: Array<{
    paymentMethodId: string;
    paymentMethodName: string;
    paymentMethodType: string;
    paymentMethodIcon: string;
    paymentMethodColor: string;
    totalExpense: number;
    totalIncome: number;
    transactionCount: number;
    netAmount: number;
  }>;
  incomeVsExpense: IncomeVsExpense;
  largestTransaction: {
    id: string;
    amount: number;
    description: string;
    type: string;
    date: string;
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
  } | null;
  smallestTransaction: {
    id: string;
    amount: number;
    description: string;
    type: string;
    date: string;
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
  } | null;
}

// ─── API Response Wrappers ────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── API Functions ────────────────────────────────────────────

export const reportsApi = {
  /**
   * GET /api/v1/reports/summary
   * Returns aggregate income/expense summary for the given (optional) date range.
   */
  async getSummary(startDate?: string, endDate?: string): Promise<ReportSummary> {
    const query = new URLSearchParams();
    if (startDate) query.set("startDate", startDate);
    if (endDate) query.set("endDate", endDate);
    const qs = query.toString();
    const response = await api.get<ApiResponse<{ summary: ReportSummary }>>(
      `/reports/summary${qs ? `?${qs}` : ""}`,
    );
    return response.data.summary;
  },

  /**
   * GET /api/v1/reports/category-summary
   * Returns expenses grouped by category for a date range (defaults to current month).
   */
  async getCategorySummary(startDate?: string, endDate?: string): Promise<CategorySummaryReport> {
    const query = new URLSearchParams();
    if (startDate) query.set("startDate", startDate);
    if (endDate) query.set("endDate", endDate);
    const qs = query.toString();
    const response = await api.get<ApiResponse<{ report: CategorySummaryReport }>>(
      `/reports/category-summary${qs ? `?${qs}` : ""}`,
    );
    return response.data.report;
  },

  /**
   * GET /api/v1/reports/monthly-trend
   * Returns 12 months of income/expense data for a year (defaults to current year).
   */
  async getMonthlyTrend(year?: number): Promise<MonthlyTrendReport> {
    const query = new URLSearchParams();
    if (year) query.set("year", String(year));
    const qs = query.toString();
    const response = await api.get<ApiResponse<{ report: MonthlyTrendReport }>>(
      `/reports/monthly-trend${qs ? `?${qs}` : ""}`,
    );
    return response.data.report;
  },

  /**
   * GET /api/v1/reports/breakdown
   * Returns a detailed breakdown by category, payment method, and income vs expense.
   */
  async getBreakdown(startDate?: string, endDate?: string): Promise<ReportBreakdown> {
    const query = new URLSearchParams();
    if (startDate) query.set("startDate", startDate);
    if (endDate) query.set("endDate", endDate);
    const qs = query.toString();
    const response = await api.get<ApiResponse<{ breakdown: ReportBreakdown }>>(
      `/reports/breakdown${qs ? `?${qs}` : ""}`,
    );
    return response.data.breakdown;
  },
};
