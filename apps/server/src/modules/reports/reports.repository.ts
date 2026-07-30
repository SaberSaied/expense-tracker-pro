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
};
