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

  async getWeeklyReport(userId: string, dateStr: string) {
    const date = new Date(dateStr);

    // Calculate Monday of the week containing the given date
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Go back to Monday
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + mondayOffset);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59, 999);

    const startDateStr = monday.toISOString().slice(0, 10);
    const endDateStr = sunday.toISOString().slice(0, 10);

    const transactions = await reportRepository.findTransactionsInRange(
      userId,
      monday,
      sunday
    );

    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Build day-by-day breakdown
    const dayMap = new Map<
      string,
      { date: string; dayName: string; income: number; expenses: number; transactionCount: number }
    >();

    // Initialize all 7 days
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, {
        date: key,
        dayName: DAY_NAMES[d.getDay()],
        income: 0,
        expenses: 0,
        transactionCount: 0,
      });
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = new Map<
      string,
      { categoryId: string; categoryName: string; categoryColor: string; categoryIcon: string; total: number; count: number }
    >();

    const mappedTransactions = transactions.map((tx) => {
      if (tx.type === "INCOME") totalIncome += tx.amount;
      else if (tx.type === "EXPENSE") totalExpenses += tx.amount;

      // Day-by-day aggregation
      const txDateStr = new Date(tx.date).toISOString().slice(0, 10);
      const dayEntry = dayMap.get(txDateStr);
      if (dayEntry) {
        if (tx.type === "INCOME") dayEntry.income += tx.amount;
        else if (tx.type === "EXPENSE") dayEntry.expenses += tx.amount;
        dayEntry.transactionCount += 1;
      }

      // Category breakdown
      const catKey = tx.categoryId;
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          categoryColor: tx.category.color,
          categoryIcon: tx.category.icon,
          total: 0,
          count: 0,
        });
      }
      const catEntry = categoryMap.get(catKey)!;
      catEntry.total += tx.amount;
      catEntry.count += 1;

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

    const dailyBreakdown = Array.from(dayMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const spendingByCategory = Array.from(categoryMap.values()).sort(
      (a, b) => b.total - a.total
    );

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      weekLabel: `${startDateStr} - ${endDateStr}`,
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      dailyBreakdown,
      transactions: mappedTransactions,
      spendingByCategory,
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
