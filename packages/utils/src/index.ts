import type { Expense, CategoryBreakdownItem } from "@expense-tracker/types";
import { CURRENCY } from "@expense-tracker/constants";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: "currency",
    currency: CURRENCY.CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString(CURRENCY.LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function groupExpensesByCategory(expenses: Expense[]): Record<string, Expense[]> {
  return expenses.reduce(
    (groups, e) => {
      (groups[e.category] ??= []).push(e);
      return groups;
    },
    {} as Record<string, Expense[]>,
  );
}

export function buildCategoryBreakdown(expenses: Expense[]): CategoryBreakdownItem[] {
  const groups = groupExpensesByCategory(expenses);
  const total = calculateTotal(expenses);
  return (Object.entries(groups) as [string, Expense[]][])
    .map(([category, items]) => ({
      category: category as CategoryBreakdownItem["category"],
      amount: calculateTotal(items),
      percentage: total > 0 ? Math.round((calculateTotal(items) / total) * 100) : 0,
      count: items.length,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function generateId(): string {
  // UUID v4 — Math.random is sufficient for in-memory expense IDs
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  const data = items.slice((page - 1) * limit, page * limit);
  return { data, totalItems, totalPages };
}
