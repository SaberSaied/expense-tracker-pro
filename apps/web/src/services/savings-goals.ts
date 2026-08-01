/**
 * Savings Goals API service.
 * CRUD operations, progress tracking (add/withdraw), and aggregate stats.
 */
import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────

export type GoalPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** Savings goal as returned by the API (enriched with computed fields). */
export interface ApiSavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  priority: GoalPriority;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  /** 0–100 progress percentage. */
  progress: number;
  /** Remaining amount to reach the target. */
  remaining: number;
  /** Days until deadline (null if no deadline). */
  daysRemaining: number | null;
  isCompleted: boolean;
}

/** Aggregate savings goal statistics. */
export interface SavingsGoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTarget: number;
  totalSaved: number;
  overallPercentage: number;
  closestGoal: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    remaining: number;
    deadline: string | null;
  } | null;
}

export interface CreateSavingsGoalInput {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  priority?: GoalPriority;
  icon?: string;
  color?: string;
}

export interface UpdateSavingsGoalInput {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string | null;
  priority?: GoalPriority;
  icon?: string;
  color?: string;
}

// ─── API Response Wrappers ────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── API Functions ────────────────────────────────────────────

export const savingsGoalsApi = {
  /**
   * GET /api/v1/savings-goals
   * Returns all savings goals for the authenticated user.
   */
  async findAll(): Promise<ApiSavingsGoal[]> {
    const response =
      await api.get<ApiResponse<{ savingsGoals: ApiSavingsGoal[] }>>("/savings-goals");
    return response.data.savingsGoals;
  },

  /**
   * GET /api/v1/savings-goals/stats
   * Returns aggregate statistics across all savings goals.
   */
  async getStats(): Promise<SavingsGoalStats> {
    const response =
      await api.get<ApiResponse<{ stats: SavingsGoalStats }>>("/savings-goals/stats");
    return response.data.stats;
  },

  /**
   * POST /api/v1/savings-goals
   * Creates a new savings goal.
   */
  async create(input: CreateSavingsGoalInput): Promise<ApiSavingsGoal> {
    const response = await api.post<ApiResponse<{ savingsGoal: ApiSavingsGoal }>>(
      "/savings-goals",
      input,
    );
    return response.data.savingsGoal;
  },

  /**
   * PATCH /api/v1/savings-goals/:id
   * Updates an existing savings goal.
   */
  async update(id: string, input: UpdateSavingsGoalInput): Promise<ApiSavingsGoal> {
    const response = await api.patch<ApiResponse<{ savingsGoal: ApiSavingsGoal }>>(
      `/savings-goals/${id}`,
      input,
    );
    return response.data.savingsGoal;
  },

  /**
   * DELETE /api/v1/savings-goals/:id
   * Deletes a savings goal (completed goals cannot be deleted).
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/savings-goals/${id}`);
  },

  /**
   * POST /api/v1/savings-goals/:id/progress
   * Adds funds toward the goal target.
   */
  async addProgress(
    id: string,
    input: { amount: number; allowExceed?: boolean },
  ): Promise<ApiSavingsGoal> {
    const response = await api.post<ApiResponse<{ savingsGoal: ApiSavingsGoal }>>(
      `/savings-goals/${id}/progress`,
      input,
    );
    return response.data.savingsGoal;
  },

  /**
   * POST /api/v1/savings-goals/:id/progress/withdraw
   * Withdraws funds from the goal.
   */
  async withdrawProgress(id: string, input: { amount: number }): Promise<ApiSavingsGoal> {
    const response = await api.post<ApiResponse<{ savingsGoal: ApiSavingsGoal }>>(
      `/savings-goals/${id}/progress/withdraw`,
      input,
    );
    return response.data.savingsGoal;
  },
};
