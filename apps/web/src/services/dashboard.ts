/**
 * Dashboard API service.
 * Fetches aggregated financial overview data for the user.
 */
import { api } from "./api";
import type { ApiTransaction } from "./transactions";

// ─── Types ────────────────────────────────────────────────────

export interface BudgetStatus {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface SavingsSummary {
  totalSaved: number;
  totalTarget: number;
  progress: number;
  goalCount: number;
}

export interface QuickStats {
  totalTransactions: number;
  totalCategories: number;
  totalPaymentMethods: number;
  averageTransactionAmount: number;
  largestExpense: number;
  largestIncome: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalSpent: number;
  percentage: number;
}

export interface PaymentMethodSpending {
  paymentMethodId: string;
  paymentMethodName: string;
  paymentMethodType: string;
  paymentMethodIcon: string;
  paymentMethodColor: string;
  totalExpense: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
}

export interface MostUsedPaymentMethod {
  paymentMethodId: string;
  paymentMethodName: string;
  paymentMethodIcon: string;
  paymentMethodColor: string;
  transactionCount: number;
}

export interface DashboardOverview {
  // Financial summary (all-time)
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  totalBalance: number;
  // Monthly breakdown
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  // Yearly breakdown
  yearlyIncome: number;
  yearlyExpense: number;
  yearlyNet: number;
  // Widgets
  budgetStatuses: BudgetStatus[];
  recentTransactions: ApiTransaction[];
  savingsSummary: SavingsSummary;
  // Quick statistics
  quickStats: QuickStats;
  // Spending by category
  spendingByCategory: CategorySpending[];
  // Spending by payment method
  spendingByPaymentMethod: PaymentMethodSpending[];
  mostUsedPaymentMethod: MostUsedPaymentMethod | null;
}

// ─── API Response Wrapper ─────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── Shared Date Range Types ───────────────────────────────────

export type DateRangePreset =
  "today" | "this_week" | "this_month" | "last_month" | "this_year" | "custom";

export interface DateRangeFilter {
  range: DateRangePreset;
  startDate?: string;
  endDate?: string;
}

// ─── Income/Expense Chart Types ────────────────────────────────

export interface IncomeExpenseChartDataPoint {
  period: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface IncomeExpenseChartResponse {
  chartData: IncomeExpenseChartDataPoint[];
}

// ─── Monthly Expenses Types ────────────────────────────────────

export interface MonthlyExpensesDataPoint {
  period: string;
  label: string;
  total: number;
  transactionCount: number;
}

export interface MonthlyExpensesSummary {
  totalExpenses: number;
  averageMonthly: number;
  monthsWithData: number;
  totalMonths: number;
  highestMonth: MonthlyExpensesDataPoint | null;
  lowestMonth: MonthlyExpensesDataPoint | null;
}

export interface MonthlyExpensesResponse {
  chartData: MonthlyExpensesDataPoint[];
  summary: MonthlyExpensesSummary;
}

// ─── Budget Usage Types ────────────────────────────────────────

export interface BudgetUsageData {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  budgeted: number;
  alertThreshold: number;
  spent: number;
  remaining: number;
  percentage: number;
  transactionCount: number;
  status: "on_track" | "warning" | "critical";
  period: string;
  startDate: string;
}

export interface BudgetUsageSummary {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  overspentCount: number;
  onTrackCount: number;
  warningCount: number;
  criticalCount: number;
}

export interface BudgetUsagePeriod {
  start: string;
  end: string;
  label: string;
}

export interface BudgetUsageResponse {
  budgets: BudgetUsageData[];
  period: BudgetUsagePeriod;
  summary: BudgetUsageSummary | null;
}

// ─── Cash Flow Types ───────────────────────────────────────────

export interface CashFlowDataPoint {
  period: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  balance: number;
}

export interface CashFlowSummary {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  finalBalance: number;
  bestMonth: CashFlowDataPoint | null;
  totalMonths: number;
}

export interface CashFlowResponse {
  chartData: CashFlowDataPoint[];
  summary: CashFlowSummary;
}

// ─── Category Distribution Types ───────────────────────────────

export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  totalSpent: number;
  percentage: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface CategoryDistributionSummary {
  totalSpent: number;
  categoryCount: number;
  transactionCount: number;
  topCategory: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    totalSpent: number;
    percentage: number;
  } | null;
  averagePerCategory: number;
}

export interface CategoryDistributionResponse {
  distribution: CategoryDistribution[];
  summary: CategoryDistributionSummary;
}

// ─── API Functions ────────────────────────────────────────────

export const dashboardApi = {
  /**
   * GET /api/v1/dashboard/overview
   * Returns aggregated financial overview for the authenticated user.
   */
  async getOverview(): Promise<DashboardOverview> {
    const response =
      await api.get<ApiResponse<{ overview: DashboardOverview }>>("/dashboard/overview");
    return response.data.overview;
  },

  /**
   * Build URLSearchParams from optional months and DateRangeFilter.
   */
  buildParams(params?: {
    months?: number;
    range?: DateRangePreset;
    startDate?: string;
    endDate?: string;
  }): string {
    const query = new URLSearchParams();
    if (params?.months) query.set("months", String(params.months));
    if (params?.range) query.set("range", params.range);
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    const qs = query.toString();
    return qs ? `?${qs}` : "";
  },

  /**
   * GET /api/v1/dashboard/income-expense-chart
   * Returns income vs expense chart data aggregated by month.
   */
  async getIncomeExpenseChart(params?: {
    months?: number;
    period?: string;
    range?: DateRangePreset;
    startDate?: string;
    endDate?: string;
  }): Promise<IncomeExpenseChartResponse> {
    const query = dashboardApi.buildParams(params);
    if (params?.period) {
      const sep = query.includes("?") ? "&" : "?";
      const response = await api.get<ApiResponse<IncomeExpenseChartResponse>>(
        `/dashboard/income-expense-chart${query}${sep}period=${params.period}`,
      );
      return response.data;
    }
    const response = await api.get<ApiResponse<IncomeExpenseChartResponse>>(
      `/dashboard/income-expense-chart${query}`,
    );
    return response.data;
  },

  /**
   * GET /api/v1/dashboard/monthly-expenses
   * Returns monthly expense totals grouped chronologically with empty-month handling.
   */
  async getMonthlyExpenses(params?: {
    months?: number;
    range?: DateRangePreset;
    startDate?: string;
    endDate?: string;
  }): Promise<MonthlyExpensesResponse> {
    const query = dashboardApi.buildParams(params);
    const response = await api.get<ApiResponse<MonthlyExpensesResponse>>(
      `/dashboard/monthly-expenses${query}`,
    );
    return response.data;
  },

  /**
   * GET /api/v1/dashboard/budget-usage
   * Returns budget usage data with limits, spent, remaining, and percentage for the current month or a specific month.
   */
  async getBudgetUsage(params?: { month?: string }): Promise<BudgetUsageResponse> {
    const query = new URLSearchParams();
    if (params?.month) query.set("month", params.month);
    const qs = query.toString();
    const response = await api.get<ApiResponse<BudgetUsageResponse>>(
      `/dashboard/budget-usage${qs ? `?${qs}` : ""}`,
    );
    return response.data;
  },

  /**
   * GET /api/v1/dashboard/cash-flow
   * Returns cash flow data with income, expenses, running balance, and net cash flow over time.
   */
  async getCashFlow(params?: {
    months?: number;
    range?: DateRangePreset;
    startDate?: string;
    endDate?: string;
  }): Promise<CashFlowResponse> {
    const query = dashboardApi.buildParams(params);
    const response = await api.get<ApiResponse<CashFlowResponse>>(`/dashboard/cash-flow${query}`);
    return response.data;
  },

  /**
   * GET /api/v1/dashboard/category-distribution
   * Returns expense breakdown grouped by category with totals, percentages, sorted by highest spending.
   */
  async getCategoryDistribution(params?: {
    months?: number;
    range?: DateRangePreset;
    startDate?: string;
    endDate?: string;
  }): Promise<CategoryDistributionResponse> {
    const query = dashboardApi.buildParams(params);
    const response = await api.get<ApiResponse<CategoryDistributionResponse>>(
      `/dashboard/category-distribution${query}`,
    );
    return response.data;
  },
};
