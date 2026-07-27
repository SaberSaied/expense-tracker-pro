export { EXPENSE_CATEGORIES } from "@expense-tracker/types";
export type { ExpenseCategory } from "@expense-tracker/types";

export const API_ROUTES = {
  BASE: "/api",
  V1: "/api/v1",
  EXPENSES: "/api/v1/expenses",
  EXPENSE_BY_ID: (id: string) => `/api/v1/expenses/${id}`,
  SUMMARY: "/api/v1/expenses/summary",
  CATEGORIES: "/api/v1/categories",
  HEALTH: "/api/v1/health",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const CURRENCY = {
  CODE: "USD",
  SYMBOL: "$",
  LOCALE: "en-US",
} as const;
