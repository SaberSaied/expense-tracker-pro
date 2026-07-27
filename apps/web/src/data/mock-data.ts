/**
 * Mock data seed for all UI pages.
 * Provides realistic sample data matching the design document examples.
 */
import type {
  Category,
  Transaction,
  Budget,
  UserProfile,
  ChartDataPoint,
  SpendingSummary,
} from "@/types";

/* ════════════════════════════════════════════════════════════════════════════════
   Categories
   ════════════════════════════════════════════════════════════════════════════════ */

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Food & Dining",
    icon: "UtensilsCrossed",
    color: "#F59E0B",
    isSystem: true,
    budgetLimit: 1000,
    transactionCount: 14,
    totalSpent: 820,
  },
  {
    id: "cat-2",
    name: "Transportation",
    icon: "Car",
    color: "#06B6D4",
    isSystem: true,
    budgetLimit: 600,
    transactionCount: 8,
    totalSpent: 240,
  },
  {
    id: "cat-3",
    name: "Housing & Rent",
    icon: "Home",
    color: "#8B5CF6",
    isSystem: true,
    budgetLimit: 1500,
    transactionCount: 1,
    totalSpent: 1500,
  },
  {
    id: "cat-4",
    name: "Utilities",
    icon: "Zap",
    color: "#10B981",
    isSystem: true,
    budgetLimit: 400,
    transactionCount: 4,
    totalSpent: 310,
  },
  {
    id: "cat-5",
    name: "Entertainment",
    icon: "Film",
    color: "#F43F5E",
    isSystem: true,
    budgetLimit: 300,
    transactionCount: 6,
    totalSpent: 185,
  },
  {
    id: "cat-6",
    name: "Healthcare",
    icon: "Heart",
    color: "#EC4899",
    isSystem: true,
    budgetLimit: 500,
    transactionCount: 2,
    totalSpent: 145,
  },
  {
    id: "cat-7",
    name: "SaaS Subscriptions",
    icon: "Cloud",
    color: "#6366F1",
    isSystem: false,
    budgetLimit: 200,
    transactionCount: 6,
    totalSpent: 120,
  },
  {
    id: "cat-8",
    name: "Client Dinners",
    icon: "Wine",
    color: "#D946EF",
    isSystem: false,
    budgetLimit: 300,
    transactionCount: 3,
    totalSpent: 100.5,
  },
];

/* ════════════════════════════════════════════════════════════════════════════════
   Transactions
   ════════════════════════════════════════════════════════════════════════════════ */

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn-001",
    amount: 142.5,
    description: "Whole Foods Market",
    categoryId: "cat-1",
    categoryName: "Food & Dining",
    categoryIcon: "UtensilsCrossed",
    categoryColor: "#F59E0B",
    paymentMethod: "credit_card",
    date: "2026-07-27",
    notes: "Weekly grocery run",
    createdAt: "2026-07-27T10:30:00Z",
    updatedAt: "2026-07-27T10:30:00Z",
  },
  {
    id: "txn-002",
    amount: 24.0,
    description: "Uber Ride — Downtown",
    categoryId: "cat-2",
    categoryName: "Transportation",
    categoryIcon: "Car",
    categoryColor: "#06B6D4",
    paymentMethod: "debit_card",
    date: "2026-07-26",
    createdAt: "2026-07-26T14:15:00Z",
    updatedAt: "2026-07-26T14:15:00Z",
  },
  {
    id: "txn-003",
    amount: 1500.0,
    description: "Monthly Rent — Apartment",
    categoryId: "cat-3",
    categoryName: "Housing & Rent",
    categoryIcon: "Home",
    categoryColor: "#8B5CF6",
    paymentMethod: "bank_transfer",
    date: "2026-07-01",
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "txn-004",
    amount: 89.99,
    description: "Electric Power Bill",
    categoryId: "cat-4",
    categoryName: "Utilities",
    categoryIcon: "Zap",
    categoryColor: "#10B981",
    paymentMethod: "bank_transfer",
    date: "2026-07-15",
    createdAt: "2026-07-15T08:00:00Z",
    updatedAt: "2026-07-15T08:00:00Z",
  },
  {
    id: "txn-005",
    amount: 45.0,
    description: "Netflix + Spotify Combo",
    categoryId: "cat-5",
    categoryName: "Entertainment",
    categoryIcon: "Film",
    categoryColor: "#F43F5E",
    paymentMethod: "credit_card",
    date: "2026-07-20",
    createdAt: "2026-07-20T12:00:00Z",
    updatedAt: "2026-07-20T12:00:00Z",
  },
  {
    id: "txn-006",
    amount: 65.0,
    description: "Starbucks — Team Coffee",
    categoryId: "cat-1",
    categoryName: "Food & Dining",
    categoryIcon: "UtensilsCrossed",
    categoryColor: "#F59E0B",
    paymentMethod: "credit_card",
    date: "2026-07-25",
    notes: "Friday office treat",
    createdAt: "2026-07-25T15:30:00Z",
    updatedAt: "2026-07-25T15:30:00Z",
  },
  {
    id: "txn-007",
    amount: 35.5,
    description: "Gas Station Fill-Up",
    categoryId: "cat-2",
    categoryName: "Transportation",
    categoryIcon: "Car",
    categoryColor: "#06B6D4",
    paymentMethod: "debit_card",
    date: "2026-07-22",
    createdAt: "2026-07-22T11:00:00Z",
    updatedAt: "2026-07-22T11:00:00Z",
  },
  {
    id: "txn-008",
    amount: 14.99,
    description: "GitHub Pro Plan",
    categoryId: "cat-7",
    categoryName: "SaaS Subscriptions",
    categoryIcon: "Cloud",
    categoryColor: "#6366F1",
    paymentMethod: "credit_card",
    date: "2026-07-01",
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
  {
    id: "txn-009",
    amount: 220.0,
    description: "Water + Internet Bundle",
    categoryId: "cat-4",
    categoryName: "Utilities",
    categoryIcon: "Zap",
    categoryColor: "#10B981",
    paymentMethod: "bank_transfer",
    date: "2026-07-10",
    createdAt: "2026-07-10T09:00:00Z",
    updatedAt: "2026-07-10T09:00:00Z",
  },
  {
    id: "txn-010",
    amount: 78.0,
    description: "Dental Checkup Co-pay",
    categoryId: "cat-6",
    categoryName: "Healthcare",
    categoryIcon: "Heart",
    categoryColor: "#EC4899",
    paymentMethod: "debit_card",
    date: "2026-07-18",
    createdAt: "2026-07-18T10:00:00Z",
    updatedAt: "2026-07-18T10:00:00Z",
  },
  {
    id: "txn-011",
    amount: 55.0,
    description: "Italian Restaurant — Client Meet",
    categoryId: "cat-8",
    categoryName: "Client Dinners",
    categoryIcon: "Wine",
    categoryColor: "#D946EF",
    paymentMethod: "credit_card",
    date: "2026-07-24",
    notes: "Prospect meeting dinner",
    createdAt: "2026-07-24T19:30:00Z",
    updatedAt: "2026-07-24T19:30:00Z",
  },
  {
    id: "txn-012",
    amount: 150.52,
    description: "Costco Bulk Groceries",
    categoryId: "cat-1",
    categoryName: "Food & Dining",
    categoryIcon: "UtensilsCrossed",
    categoryColor: "#F59E0B",
    paymentMethod: "credit_card",
    date: "2026-07-20",
    createdAt: "2026-07-20T16:45:00Z",
    updatedAt: "2026-07-20T16:45:00Z",
  },
];

/* ════════════════════════════════════════════════════════════════════════════════
   Budgets
   ════════════════════════════════════════════════════════════════════════════════ */

export const MOCK_BUDGETS: Budget[] = [
  {
    id: "bud-1",
    categoryId: "cat-1",
    categoryName: "Food & Dining",
    categoryIcon: "UtensilsCrossed",
    categoryColor: "#F59E0B",
    targetAmount: 1000,
    spentAmount: 820,
    alertThreshold: 80,
    period: "monthly",
    status: "warning",
  },
  {
    id: "bud-2",
    categoryId: "cat-2",
    categoryName: "Transportation",
    categoryIcon: "Car",
    categoryColor: "#06B6D4",
    targetAmount: 600,
    spentAmount: 240,
    alertThreshold: 80,
    period: "monthly",
    status: "normal",
  },
  {
    id: "bud-3",
    categoryId: "cat-3",
    categoryName: "Housing & Rent",
    categoryIcon: "Home",
    categoryColor: "#8B5CF6",
    targetAmount: 1500,
    spentAmount: 1500,
    alertThreshold: 90,
    period: "monthly",
    status: "critical",
  },
  {
    id: "bud-4",
    categoryId: "cat-4",
    categoryName: "Utilities",
    categoryIcon: "Zap",
    categoryColor: "#10B981",
    targetAmount: 400,
    spentAmount: 310,
    alertThreshold: 80,
    period: "monthly",
    status: "warning",
  },
  {
    id: "bud-5",
    categoryId: "cat-5",
    categoryName: "Entertainment",
    categoryIcon: "Film",
    categoryColor: "#F43F5E",
    targetAmount: 300,
    spentAmount: 185,
    alertThreshold: 80,
    period: "monthly",
    status: "normal",
  },
];

/* ════════════════════════════════════════════════════════════════════════════════
   User Profile
   ════════════════════════════════════════════════════════════════════════════════ */

export const MOCK_USER: UserProfile = {
  id: "usr-001",
  name: "Alex Rivera",
  email: "alex@freelancer.com",
  bio: "Senior Software Consultant",
  currency: "USD",
  language: "en-US",
  dateFormat: "YYYY-MM-DD",
  theme: "dark",
  notifications: {
    budgetAlerts: true,
    emailWarnings: true,
    weeklyDigest: false,
  },
};

/* ════════════════════════════════════════════════════════════════════════════════
   Dashboard Summary
   ════════════════════════════════════════════════════════════════════════════════ */

export const MOCK_SUMMARY: SpendingSummary = {
  totalSpent: 3420.5,
  dailyAverage: 114.02,
  topCategory: "Food & Dining",
  topCategoryPercentage: 33.6,
  remainingBudget: 1079.5,
  budgetUsedPercentage: 76,
  totalTransactions: 42,
  trendPercentage: 4.2,
};

/* ════════════════════════════════════════════════════════════════════════════════
   Chart Data
   ════════════════════════════════════════════════════════════════════════════════ */

export const MOCK_CATEGORY_CHART: ChartDataPoint[] = [
  { label: "Food & Dining", value: 820, color: "#F59E0B" },
  { label: "Housing & Rent", value: 1500, color: "#8B5CF6" },
  { label: "Utilities", value: 310, color: "#10B981" },
  { label: "Transportation", value: 240, color: "#06B6D4" },
  { label: "Entertainment", value: 185, color: "#F43F5E" },
  { label: "Healthcare", value: 145, color: "#EC4899" },
  { label: "SaaS Subscriptions", value: 120, color: "#6366F1" },
  { label: "Client Dinners", value: 100.5, color: "#D946EF" },
];

export const MOCK_SPENDING_TREND: ChartDataPoint[] = Array.from(
  { length: 30 },
  (_, i) => ({
    label: `Jul ${i + 1}`,
    value: Math.round((50 + Math.random() * 200 + Math.sin(i / 3) * 50) * 100) / 100,
  }),
);
