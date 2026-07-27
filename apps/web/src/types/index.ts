/**
 * Core domain type definitions for the Expense Tracker Pro application.
 * These interfaces represent the data shapes used across all UI modules.
 */

/** Payment method types. */
export type PaymentMethod = "credit_card" | "debit_card" | "cash" | "bank_transfer";

/** Budget alert status levels. */
export type BudgetStatus = "normal" | "warning" | "critical";

/** Expense category with icon and color metadata. */
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
  budgetLimit?: number;
  transactionCount: number;
  totalSpent: number;
}

/** Individual expense/transaction record. */
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  paymentMethod: PaymentMethod;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Budget target for a specific category. */
export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  targetAmount: number;
  spentAmount: number;
  alertThreshold: number;
  period: "monthly" | "custom";
  status: BudgetStatus;
}

/** User profile information. */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  currency: string;
  language: string;
  dateFormat: string;
  theme: "dark" | "light" | "system";
  notifications: {
    budgetAlerts: boolean;
    emailWarnings: boolean;
    weeklyDigest: boolean;
  };
}

/** Data point for chart visualizations. */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/** Date range for filtering. */
export interface DateRange {
  from: string;
  to: string;
}

/** Summary statistics for the dashboard and reports. */
export interface SpendingSummary {
  totalSpent: number;
  dailyAverage: number;
  topCategory: string;
  topCategoryPercentage: number;
  remainingBudget: number;
  budgetUsedPercentage: number;
  totalTransactions: number;
  trendPercentage: number;
}
