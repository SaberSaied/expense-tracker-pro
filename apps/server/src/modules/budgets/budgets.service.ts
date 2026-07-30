import { budgetRepository } from "./budgets.repository";
import { categoryRepository } from "@/modules/categories/categories.repository";
import { NotFoundError, ConflictError, ValidationError } from "@/common/errors";

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

    // Validate category exists and belongs to the user
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new ValidationError("Category not found");
    }
    if (category.userId !== userId) {
      throw new ValidationError("Category does not belong to this user");
    }

    // Check for duplicates — one budget per category per period per user
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
