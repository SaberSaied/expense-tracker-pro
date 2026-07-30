import { budgetRepository } from "./budgets.repository";
import { categoryRepository } from "@/modules/categories/categories.repository";
import { NotFoundError, ConflictError, ValidationError } from "@/common/errors";
import type { BudgetQueryFilters } from "./budgets.types";

export const budgetService = {
  async findAll(
    userId: string,
    filters: BudgetQueryFilters = {}
  ) {
    return budgetRepository.findAllByUser(userId, {
      period: filters.period,
      status: filters.status,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  },

  async findById(userId: string, id: string) {
    const budgetWithDetails = await budgetRepository.getBudgetWithProgress(userId, id);
    if (!budgetWithDetails) {
      throw new NotFoundError("Budget not found");
    }
    return budgetWithDetails;
  },

  async getProgress(userId: string, id: string) {
    const budgetWithProgress = await budgetRepository.getBudgetWithProgress(userId, id);
    if (!budgetWithProgress) {
      throw new NotFoundError("Budget not found");
    }
    return budgetWithProgress;
  },

  async getProgressSummary(userId: string) {
    return budgetRepository.getProgressSummary(userId);
  },

  async getAlerts(userId: string) {
    return budgetRepository.getAlerts(userId);
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

  async update(
    userId: string,
    id: string,
    data: {
      targetAmount?: number;
      alertThreshold?: number;
      period?: string;
      startDate?: string;
      categoryId?: string;
    }
  ) {
    // Fetch existing budget and verify ownership
    const existing = await budgetRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Budget not found");
    }

    // If categoryId is being updated, validate ownership
    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new ValidationError("Category not found");
      }
      if (category.userId !== userId) {
        throw new ValidationError("Category does not belong to this user");
      }
    }

    // If categoryId or startDate changed, check for duplicate budgets
    const effectiveCategoryId = data.categoryId ?? existing.categoryId;
    const effectiveStartDate = data.startDate
      ? new Date(data.startDate)
      : existing.startDate;

    if (
      data.categoryId ||
      (data.startDate && new Date(data.startDate).getTime() !== existing.startDate.getTime())
    ) {
      const duplicate = await budgetRepository.findByCategoryAndPeriod(
        userId,
        effectiveCategoryId,
        effectiveStartDate
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError("A budget already exists for this category and period");
      }
    }

    // Prepare update payload
    const updateData: Record<string, unknown> = {};
    if (data.targetAmount !== undefined) updateData.targetAmount = data.targetAmount;
    if (data.alertThreshold !== undefined) updateData.alertThreshold = data.alertThreshold;
    if (data.period !== undefined) updateData.period = data.period;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    await budgetRepository.update(id, updateData);

    // Return enriched budget with progress
    return budgetRepository.getBudgetWithProgress(userId, id);
  },

  async delete(userId: string, id: string) {
    const budget = await budgetRepository.findById(id);
    if (!budget || budget.userId !== userId) {
      throw new NotFoundError("Budget not found");
    }
    return budgetRepository.delete(id);
  },
};
