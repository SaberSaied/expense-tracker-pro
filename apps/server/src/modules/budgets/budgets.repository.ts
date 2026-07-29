import { prisma } from "@/db/prisma";
import type { Prisma, BudgetPeriod } from "@/generated/prisma/client";

export const budgetRepository = {
  async findAllByUser(userId: string) {
    return prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { startDate: "desc" },
    });
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
