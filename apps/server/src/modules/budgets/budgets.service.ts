import { budgetRepository } from "./budgets.repository";
import { NotFoundError, ConflictError } from "@/common/errors";

export const budgetService = {
  async findAll(userId: string) {
    return budgetRepository.findAllByUser(userId);
  },

  async findById(userId: string, id: string) {
    const budget = await budgetRepository.findById(id);
    if (!budget || budget.userId !== userId) {
      throw new NotFoundError("Budget not found");
    }
    return budget;
  },

  async create(userId: string, data: {
    targetAmount: number;
    alertThreshold?: number;
    period?: string;
    startDate: string;
    categoryId: string;
  }) {
    const startDate = new Date(data.startDate);

    // Check for duplicates
    const existing = await budgetRepository.findByCategoryAndPeriod(
      userId,
      data.categoryId,
      startDate
    );
    if (existing) {
      throw new ConflictError("A budget already exists for this category and period");
    }

    return budgetRepository.create(userId, {
      ...data,
      startDate,
    });
  },

  async update(userId: string, id: string, data: Record<string, unknown>) {
    const budget = await budgetRepository.findById(id);
    if (!budget || budget.userId !== userId) {
      throw new NotFoundError("Budget not found");
    }
    return budgetRepository.update(id, data as any);
  },

  async delete(userId: string, id: string) {
    const budget = await budgetRepository.findById(id);
    if (!budget || budget.userId !== userId) {
      throw new NotFoundError("Budget not found");
    }
    return budgetRepository.delete(id);
  },
};
