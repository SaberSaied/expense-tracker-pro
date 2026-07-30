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
};
