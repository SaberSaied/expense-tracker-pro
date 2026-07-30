import { reportRepository } from "./reports.repository";
import { reportMapper } from "./reports.mapper";

export const reportService = {
  async getCategorySummary(userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const transactions = await reportRepository.findTransactionsInRange(userId, start, end);

    const { categories, grandTotal } = reportMapper.groupTransactionsByCategory(transactions);

    return {
      startDate,
      endDate,
      grandTotal,
      categoryCount: categories.length,
      categories,
    };
  },

  async getMonthlyTrend(userId: string, year: number) {
    const transactions = await reportRepository.findTransactionsByYear(userId, year);

    const months = reportMapper.buildMonthlyMap(transactions, year);

    return {
      year,
      months,
    };
  },

  async getDailyReport(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    const transactions = await reportRepository.findTransactionsByDate(userId, date);

    let income = 0;
    let expenses = 0;
    const categoryMap = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        categoryColor: string;
        categoryIcon: string;
        total: number;
        count: number;
      }
    >();

    const dailyTransactions = transactions.map((tx) => {
      if (tx.type === "INCOME") income += tx.amount;
      else if (tx.type === "EXPENSE") expenses += tx.amount;

      // Track per-category breakdown
      const key = tx.categoryId;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          categoryColor: tx.category.color,
          categoryIcon: tx.category.icon,
          total: 0,
          count: 0,
        });
      }
      const entry = categoryMap.get(key)!;
      entry.total += tx.amount;
      entry.count += 1;

      return {
        id: tx.id,
        amount: tx.amount,
        description: tx.description,
        type: tx.type,
        date: tx.date,
        categoryId: tx.categoryId,
        categoryName: tx.category.name,
        categoryColor: tx.category.color,
        categoryIcon: tx.category.icon,
      };
    });

    const spendingByCategory = Array.from(categoryMap.values()).sort(
      (a, b) => b.total - a.total
    );

    return {
      date: dateStr,
      income,
      expenses,
      balance: income - expenses,
      transactionCount: transactions.length,
      transactions: dailyTransactions,
      spendingByCategory,
    };
  },
};
