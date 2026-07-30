import { savingsGoalRepository } from "./savings-goals.repository";
import { NotFoundError, ValidationError } from "@/common/errors";
import type { SavingsGoalQueryFilters } from "./savings-goals.types";

export const savingsGoalService = {
  async findAll(
    userId: string,
    filters: SavingsGoalQueryFilters = {}
  ) {
    return savingsGoalRepository.findAllByUser(userId, {
      status: filters.status,
      priority: filters.priority,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  },

  async findById(userId: string, id: string) {
    const goal = await savingsGoalRepository.getGoalWithDetails(userId, id);
    if (!goal) {
      throw new NotFoundError("Savings goal not found");
    }
    return goal;
  },

  async create(userId: string, data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    deadline?: string;
    priority?: string;
    icon?: string;
    color?: string;
  }) {
    if (data.currentAmount && data.currentAmount > data.targetAmount) {
      throw new ValidationError("Current amount cannot exceed target amount");
    }
    return savingsGoalRepository.create(userId, {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });
  },

  async update(
    userId: string,
    id: string,
    data: {
      name?: string;
      targetAmount?: number;
      currentAmount?: number;
      deadline?: string | null;
      priority?: string;
      icon?: string;
      color?: string;
    }
  ) {
    const existing = await savingsGoalRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Savings goal not found");
    }

    // Validate: currentAmount must not exceed the (new or existing) targetAmount
    const effectiveTarget = data.targetAmount ?? existing.targetAmount;
    const effectiveCurrent = data.currentAmount ?? existing.currentAmount;
    if (effectiveCurrent > effectiveTarget) {
      throw new ValidationError("Current amount cannot exceed target amount");
    }

    // Build update payload with proper date conversion
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.targetAmount !== undefined) updateData.targetAmount = data.targetAmount;
    if (data.currentAmount !== undefined) updateData.currentAmount = data.currentAmount;
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;

    await savingsGoalRepository.update(id, updateData as any);

    // Return enriched goal with progress details
    return savingsGoalRepository.getGoalWithDetails(userId, id);
  },

  async delete(userId: string, id: string) {
    const goal = await savingsGoalRepository.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundError("Savings goal not found");
    }

    // Prevent deletion of completed goals to maintain data integrity
    if (goal.currentAmount >= goal.targetAmount) {
      throw new ValidationError(
        "Cannot delete a completed savings goal. Archive it instead."
      );
    }

    return savingsGoalRepository.delete(id);
  },

  async addProgress(userId: string, id: string, amount: number) {
    const goal = await savingsGoalRepository.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundError("Savings goal not found");
    }
    if (amount <= 0) {
      throw new ValidationError("Progress amount must be positive");
    }
    return savingsGoalRepository.addProgress(id, amount);
  },
};
