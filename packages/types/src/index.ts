// ─── Enum Values ──────────────────────────────────────────────

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE", "TRANSFER"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const BUDGET_PERIODS = ["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;
export type BudgetPeriod = (typeof BUDGET_PERIODS)[number];

export const THEMES = ["LIGHT", "DARK", "SYSTEM"] as const;
export type Theme = (typeof THEMES)[number];

export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "EGP",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "CNY",
  "INR",
  "BRL",
  "MXN",
  "KRW",
  "SEK",
  "NOK",
  "DKK",
  "NZD",
  "SGD",
  "HKD",
  "SAR",
  "AED",
] as const;
export type Currency = (typeof CURRENCIES)[number];

// ─── Category Types ────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Education",
  "Travel",
  "Personal Care",
  "Groceries",
  "Subscriptions",
  "Insurance",
  "Savings & Investments",
  "Income",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

// ─── Expense Types ────────────────────────────────────────────

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

export interface UpdateExpenseInput {
  amount?: number;
  category?: ExpenseCategory;
  description?: string;
  date?: string;
}

// ─── Summary Types ────────────────────────────────────────────

export interface CategoryBreakdownItem {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
}

// ─── Query / Filter Types ─────────────────────────────────────

export interface ExpenseQuery {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "date" | "amount" | "category" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// ─── Notification Preferences Type ────────────────────────────

export interface NotificationPreferences {
  budgetAlerts: boolean;
  emailWarnings: boolean;
  weeklyDigest: boolean;
}

// ─── User Types ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  currency: Currency;
  language: string;
  dateFormat: string;
  notifications: NotificationPreferences;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  currency?: Currency;
  language?: string;
  dateFormat?: string;
  notifications?: Partial<NotificationPreferences>;
}

// ─── API Response Types ───────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
