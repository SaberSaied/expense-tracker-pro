import { prisma } from "@/db/prisma";

export const dashboardService = {
  async getOverview(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Current month transactions
    const monthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: now },
      },
    });

    const monthlyIncome = monthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpense = monthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    // Year to date
    const yearTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfYear, lte: now },
      },
    });

    const yearlyIncome = yearTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const yearlyExpense = yearTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    // Budget overview
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    const budgetStatuses = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: "EXPENSE",
            date: { gte: budget.startDate },
          },
          _sum: { amount: true },
        });

        const spentAmount = spent._sum.amount ?? 0;
        return {
          categoryId: budget.categoryId,
          categoryName: budget.category.name,
          categoryColor: budget.category.color,
          budgeted: budget.targetAmount,
          spent: spentAmount,
          remaining: budget.targetAmount - spentAmount,
          percentage: budget.targetAmount > 0
            ? Math.round((spentAmount / budget.targetAmount) * 100)
            : 0,
        };
      })
    );

    // Recent transactions (last 5)
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
      include: { category: true, paymentMethod: true },
    });

    // Savings goals summary
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

    return {
      monthlyIncome,
      monthlyExpense,
      monthlyNet: monthlyIncome - monthlyExpense,
      yearlyIncome,
      yearlyExpense,
      yearlyNet: yearlyIncome - yearlyExpense,
      budgetStatuses,
      recentTransactions,
      savingsSummary: {
        totalSaved,
        totalTarget,
        progress: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
        goalCount: savingsGoals.length,
      },
    };
  },
};
