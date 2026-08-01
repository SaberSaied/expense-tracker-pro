/**
 * Budgets API service.
 * All CRUD operations plus progress summary for user spending budgets.
 */
import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────

export type BudgetPeriod = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export interface ApiBudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

/** Budget as returned by the progress summary endpoint (enriched with computed fields). */
export interface ApiBudget {
  id: string;
  category: ApiBudgetCategory;
  targetAmount: number;
  /** Alert threshold may be absent from progress-summary items. */
  alertThreshold?: number;
  period: BudgetPeriod;
  startDate: string;
  spent: number;
  remaining: number;
  progress: number;
  isActive: boolean;
  daysRemaining: number;
  periodEnd: string;
}

/** Aggregate budget progress summary. */
export interface BudgetProgressSummary {
  totalBudgets: number;
  activeBudgets: number;
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overallProgress: number;
  budgets: Array<{
    id: string;
    category: ApiBudgetCategory;
    targetAmount: number;
    period: BudgetPeriod;
    startDate: string;
    spent: number;
    remaining: number;
    progress: number;
    isActive: boolean;
    daysRemaining: number;
    periodEnd: string;
  }>;
}

export interface CreateBudgetInput {
  targetAmount: number;
  alertThreshold?: number;
  period?: BudgetPeriod;
  startDate: string;
  categoryId: string;
}

export interface UpdateBudgetInput {
  targetAmount?: number;
  alertThreshold?: number;
  period?: BudgetPeriod;
  startDate?: string;
}

// ─── API Response Wrappers ────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── API Functions ────────────────────────────────────────────

export const budgetsApi = {
  /**
   * GET /api/v1/budgets/progress/summary
   * Returns aggregate budget totals plus each budget enriched with computed
   * spending, remaining, progress, and time-based fields.
   */
  async getProgressSummary(): Promise<BudgetProgressSummary> {
    const response = await api.get<ApiResponse<BudgetProgressSummary>>("/budgets/progress/summary");
    return response.data;
  },

  /**
   * POST /api/v1/budgets
   * Creates a new budget for a category + period.
   */
  async create(input: CreateBudgetInput): Promise<ApiBudget> {
    const response = await api.post<ApiResponse<{ budget: ApiBudget }>>("/budgets", input);
    return response.data.budget;
  },

  /**
   * PATCH /api/v1/budgets/:id
   * Updates an existing budget.
   */
  async update(id: string, input: UpdateBudgetInput): Promise<ApiBudget> {
    const response = await api.patch<ApiResponse<{ budget: ApiBudget }>>(`/budgets/${id}`, input);
    return response.data.budget;
  },

  /**
   * DELETE /api/v1/budgets/:id
   * Deletes a budget.
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};
