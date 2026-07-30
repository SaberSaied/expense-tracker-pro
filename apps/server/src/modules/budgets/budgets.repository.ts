import { prisma } from "@/db/prisma";
import type { Prisma, BudgetPeriod } from "@/generated/prisma/client";

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Compute the end date of a budget period given its start date and period type.
 */
function computePeriodEnd(startDate: Date, period: string): Date {
  const end = new Date(startDate);
  switch (period) {
    case "WEEKLY":
      end.setDate(end.getDate() + 6);
      break;
    case "MONTHLY":
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // last day of the current month
      break;
    case "QUARTERLY":
      end.setMonth(end.getMonth() + 3);
      end.setDate(0);
      break;
    case "YEARLY":
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(0);
      break;
  }
  return end;
}

/**
 * Compute the number of full days remaining until the period end date.
 * Returns 0 if the period has already ended.
 * The end date is inclusive, so we add 1 to account for the full range.
 */
function computeDaysRemaining(startDate: Date, endDate: Date): number {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;

  // Not started yet → total days in the period
  if (now < startDate) {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;
  }
  // Already ended → 0
  if (now > endDate) {
    return 0;
  }
  // In progress → days remaining (excluding today, counting from tomorrow to end inclusive)
  return Math.ceil((endDate.getTime() - now.getTime()) / msPerDay);
}

/**
 * Compute how much has been spent so far for a given budget category and date range.
 */
async function computeSpending(
  userId: string,
  categoryId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      categoryId,
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

// ─── Repository ───────────────────────────────────────────────

export const budgetRepository = {
  async findAllByUser(
    userId: string,
    options: {
      period?: string;
      status?: "active" | "inactive";
      startDate?: Date;
      endDate?: Date;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ) {
    const where: Prisma.BudgetWhereInput = { userId };

    if (options.period) {
      where.period = options.period as BudgetPeriod;
    }

    if (options.startDate || options.endDate) {
      where.startDate = {};
      if (options.startDate) where.startDate.gte = options.startDate;
      if (options.endDate) where.startDate.lte = options.endDate;
    }

    // Build orderBy — period can't be sorted by Prisma directly as an enum string,
    // so we sort alphabetically: MONTHLY < QUARTERLY < WEEKLY < YEARLY
    const orderKey = (options.sortBy ?? "startDate") as keyof Prisma.BudgetOrderByWithRelationInput;
    const orderDir = options.sortOrder ?? "desc";

    const orderBy: Prisma.BudgetOrderByWithRelationInput = {
      [orderKey === "period" ? "startDate" : orderKey]: orderDir,
    };

    const budgets = await prisma.budget.findMany({
      where,
      orderBy,
      include: { category: true },
    });

    // If status filter is active, compute on the fly and filter
    if (options.status) {
      const now = new Date();
      const filtered = await Promise.all(
        budgets.map(async (budget) => {
          const end = computePeriodEnd(budget.startDate, budget.period);
          const isActive = now >= budget.startDate && now <= end;
          return { budget, isActive };
        })
      );
      return filtered
        .filter(({ isActive }) =>
          options.status === "active" ? isActive : !isActive
        )
        .map(({ budget }) => budget);
    }

    return budgets;
  },

  async findById(id: string) {
    return prisma.budget.findUnique({
      where: { id },
      include: { category: true },
    });
  },

  async findByCategoryAndPeriod(userId: string, categoryId: string, startDate: Date) {
    return prisma.budget.findFirst({
      where: { userId, categoryId, startDate },
    });
  },

  async getBudgetWithProgress(
    userId: string,
    budgetId: string
  ) {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { category: true },
    });

    if (!budget || budget.userId !== userId) return null;

    const end = computePeriodEnd(budget.startDate, budget.period);
    const spent = await computeSpending(userId, budget.categoryId, budget.startDate, end);
    const now = new Date();
    const isActive = now >= budget.startDate && now <= end;
    const progress = budget.targetAmount > 0
      ? Math.round((spent / budget.targetAmount) * 100)
      : 0;
    const daysRemaining = computeDaysRemaining(budget.startDate, end);
    const totalDays = Math.ceil((end.getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysElapsed = Math.max(0, totalDays - daysRemaining);

    return {
      ...budget,
      spent,
      remaining: Math.max(0, budget.targetAmount - spent),
      progress,
      isActive,
      periodEnd: end,
      daysRemaining,
      daysElapsed,
      totalDays,
      isOverBudget: spent > budget.targetAmount,
      isAlertTriggered: progress >= budget.alertThreshold,
    };
  },

  async getProgressSummary(userId: string) {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    if (budgets.length === 0) {
      return {
        totalBudgets: 0,
        activeBudgets: 0,
        totalBudgeted: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallProgress: 0,
        budgets: [],
      };
    }

    const now = new Date();
    let totalBudgeted = 0;
    let totalSpent = 0;
    let activeCount = 0;

    const enriched = await Promise.all(
      budgets.map(async (budget) => {
        const end = computePeriodEnd(budget.startDate, budget.period);
        const spent = await computeSpending(userId, budget.categoryId, budget.startDate, end);
        const isActive = now >= budget.startDate && now <= end;
        const progress = budget.targetAmount > 0
          ? Math.round((spent / budget.targetAmount) * 100)
          : 0;
        const daysRemaining = computeDaysRemaining(budget.startDate, end);

        if (isActive) activeCount++;
        totalBudgeted += budget.targetAmount;
        totalSpent += spent;

        return {
          id: budget.id,
          category: budget.category,
          targetAmount: budget.targetAmount,
          period: budget.period,
          startDate: budget.startDate,
          spent,
          remaining: Math.max(0, budget.targetAmount - spent),
          progress,
          isActive,
          daysRemaining,
          periodEnd: end,
        };
      })
    );

    return {
      totalBudgets: budgets.length,
      activeBudgets: activeCount,
      totalBudgeted,
      totalSpent,
      totalRemaining: Math.max(0, totalBudgeted - totalSpent),
      overallProgress: totalBudgeted > 0
        ? Math.round((totalSpent / totalBudgeted) * 100)
        : 0,
      budgets: enriched,
    };
  },

  async create(userId: string, data: {
    targetAmount: number;
    alertThreshold?: number;
    period?: string;
    startDate: Date;
    categoryId: string;
  }) {
    return prisma.budget.create({
      data: {
        targetAmount: data.targetAmount,
        alertThreshold: data.alertThreshold ?? 80,
        period: (data.period ?? "MONTHLY") as BudgetPeriod,
        startDate: data.startDate,
        category: { connect: { id: data.categoryId } },
        user: { connect: { id: userId } },
      },
      include: { category: true },
    });
  },

  async update(id: string, data: Prisma.BudgetUpdateInput) {
    return prisma.budget.update({
      where: { id },
      data,
      include: { category: true },
    });
  },

  async delete(id: string) {
    return prisma.budget.delete({ where: { id } });
  },
};
