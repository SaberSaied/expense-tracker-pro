import { prisma } from "@/db/prisma";

export const savingsGoalRepository = {
  async findAllByUser(userId: string) {
    return prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.savingsGoal.findUnique({ where: { id } });
  },

  async create(userId: string, data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    deadline?: Date;
    icon?: string;
    color?: string;
  }) {
    return prisma.savingsGoal.create({
      data: { ...data, userId },
    });
  },

  async update(id: string, data: {
    name?: string;
    targetAmount?: number;
    currentAmount?: number;
    deadline?: Date | null;
    icon?: string;
    color?: string;
  }) {
    return prisma.savingsGoal.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.savingsGoal.delete({ where: { id } });
  },

  async addProgress(id: string, amount: number) {
    return prisma.savingsGoal.update({
      where: { id },
      data: { currentAmount: { increment: amount } },
    });
  },
};
