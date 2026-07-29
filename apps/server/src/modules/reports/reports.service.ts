import { prisma } from "@/db/prisma";
import { ValidationError } from "@/common/errors";

export const reportService = {
  async getCategorySummary(userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError("Invalid date range");
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      include: { category: true },
    });

    // Group by category
    const categoryMap = new Map<string, {
      categoryId: string;
      categoryName: string;
      categoryColor: string;
      categoryIcon: string;
      total: number;
      count: number;
      transactions: Array<{ amount: number; date: Date; description: string }>;
    }>();

    for (const tx of transactions) {
      const key = tx.categoryId;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          categoryColor: tx.category.color,
          categoryIcon: tx.category.icon,
          total: 0,
          count: 0,
          transactions: [],
        });
      }
      const entry = categoryMap.get(key)!;
      entry.total += tx.amount;
      entry.count += 1;
      entry.transactions.push({ amount: tx.amount, date: tx.date, description: tx.description });
    }

    const categories = Array.from(categoryMap.values());
    const grandTotal = categories.reduce((sum, cat) => sum + cat.total, 0);

    return {
      startDate,
      endDate,
      grandTotal,
      categoryCount: categories.length,
      categories: categories.map((cat) => ({
        ...cat,
        percentage: grandTotal > 0 ? Math.round((cat.total / grandTotal) * 100) : 0,
      })),
    };
  },

  async getMonthlyTrend(userId: string, year: number) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year + 1}-01-01`);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lt: endDate },
      },
    });

    const monthlyData: Record<string, { income: number; expense: number; net: number }> = {};

    for (let month = 0; month < 12; month++) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;
      monthlyData[key] = { income: 0, expense: 0, net: 0 };
    }

    for (const tx of transactions) {
      const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key]) {
        if (tx.type === "INCOME") monthlyData[key].income += tx.amount;
        else if (tx.type === "EXPENSE") monthlyData[key].expense += tx.amount;
      }
    }

    for (const key of Object.keys(monthlyData)) {
      monthlyData[key].net = monthlyData[key].income - monthlyData[key].expense;
    }

    return {
      year,
      months: Object.entries(monthlyData).map(([month, data]) => ({
        month,
        ...data,
      })),
    };
  },
};
