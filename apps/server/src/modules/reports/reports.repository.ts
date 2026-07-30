import { prisma } from "@/db/prisma";

export const reportRepository = {
  async findTransactionsInRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    return prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
      orderBy: { date: "asc" },
    });
  },

  async findTransactionsByYear(userId: string, year: number) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year + 1}-01-01`);

    return prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lt: endDate },
      },
      orderBy: { date: "asc" },
    });
  },

  async findTransactionsByDate(userId: string, date: Date) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    return prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: { category: true },
      orderBy: { date: "desc" },
    });
  },

  async findTransactionsInMonth(
    userId: string,
    startOfMonth: Date,
    endOfMonth: Date
  ) {
    return prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { category: true, paymentMethod: true },
      orderBy: { date: "asc" },
    });
  },

  async findBudgetsForUser(userId: string) {
    return prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });
  },

  async findPaymentMethodsForUser(userId: string) {
    return prisma.paymentMethod.findMany({
      where: { userId },
    });
  },
};
