export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface CategorySummaryQuery {
  startDate?: string;
  endDate?: string;
}

export interface MonthlyTrendQuery {
  year?: number;
}

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
    date: Date;
    description: string;
  }>;
}

export interface CategorySummary {
  startDate: string;
  endDate: string;
  grandTotal: number;
  categoryCount: number;
  categories: CategorySummaryItem[];
}

export interface MonthlyTrendMonth {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyTrend {
  year: number;
  months: MonthlyTrendMonth[];
}

export interface DailyReportTransaction {
  id: string;
  amount: number;
  description: string;
  type: string;
  date: Date;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
}

export interface DailyCategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  count: number;
}

export interface DailyReport {
  date: string;
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
  transactions: DailyReportTransaction[];
  spendingByCategory: DailyCategoryBreakdown[];
}

export interface WeeklyDaySummary {
  date: string;
  dayName: string;
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

export interface WeeklyReport {
  startDate: string;
  endDate: string;
  weekLabel: string;
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
  dailyBreakdown: WeeklyDaySummary[];
  transactions: DailyReportTransaction[];
  spendingByCategory: DailyCategoryBreakdown[];
}

export interface MonthlyCategorySummary {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyPaymentMethodSummary {
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

export interface MonthlyBudgetPerformance {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "on_track" | "warning" | "critical";
}

export interface MonthlyReport {
  month: string;
  label: string;
  income: number;
  expenses: number;
  netSavings: number;
  transactionCount: number;
  budgetPerformance: MonthlyBudgetPerformance[];
  categorySummary: MonthlyCategorySummary[];
  paymentMethodSummary: MonthlyPaymentMethodSummary[];
}
