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

  async findTransactionsInYearWithDetails(userId: string, year: number) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year + 1}-01-01`);

    return prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lt: endDate },
      },
      include: { category: true },
      orderBy: { date: "asc" },
    });
  },

  async findCustomTransactions(
    userId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      categoryId?: string;
      paymentMethodId?: string;
      type?: string;
      minAmount?: number;
      maxAmount?: number;
    }
  ) {
    const where: Record<string, unknown> = { userId };

    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.startDate) dateFilter.gte = filters.startDate;
      if (filters.endDate) dateFilter.lte = filters.endDate;
      where.date = dateFilter;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.paymentMethodId) {
      where.paymentMethodId = filters.paymentMethodId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      const amountFilter: Record<string, number> = {};
      if (filters.minAmount !== undefined) amountFilter.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) amountFilter.lte = filters.maxAmount;
      where.amount = amountFilter;
    }

    return prisma.transaction.findMany({
      where: where as any,
      include: { category: true },
      orderBy: { date: "desc" },
    });
  },
};
