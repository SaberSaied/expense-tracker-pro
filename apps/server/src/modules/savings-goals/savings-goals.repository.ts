import { prisma } from "@/db/prisma";
import type { GoalPriority } from "@/generated/prisma/client";

export const savingsGoalRepository = {
  async findAllByUser(
    userId: string,
    options: {
      status?: "active" | "completed";
      priority?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ) {
    // Fetch goals with optional DB-level priority filter
    const goals = await prisma.savingsGoal.findMany({
      where: { userId, ...(options.priority ? { priority: options.priority as GoalPriority } : {}) },
      orderBy: { createdAt: "desc" },
    });

    // Compute status and apply filter/sort
    let result = goals.map((goal) => ({
      ...goal,
      progress: goal.targetAmount > 0
        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
        : 0,
      isCompleted: goal.currentAmount >= goal.targetAmount,
    }));

    if (options.status) {
      result = result.filter((g) =>
        options.status === "completed" ? g.isCompleted : !g.isCompleted
      );
    }

    // Sort
    const orderDir = options.sortOrder ?? "desc";
    const sortBy = options.sortBy ?? "createdAt";

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "deadline": {
          const aDate = a.deadline?.getTime() ?? 0;
          const bDate = b.deadline?.getTime() ?? 0;
          cmp = aDate - bDate;
          break;
        }
        case "targetAmount":
          cmp = a.targetAmount - b.targetAmount;
          break;
        case "currentAmount":
          cmp = a.currentAmount - b.currentAmount;
          break;
        case "priority": {
          const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          cmp = (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) -
                (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3);
          break;
        }
        case "createdAt":
        default:
          cmp = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      return orderDir === "asc" ? cmp : -cmp;
    });

    return result;
  },

  async findById(id: string) {
    return prisma.savingsGoal.findUnique({ where: { id } });
  },

  async create(userId: string, data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    deadline?: Date;
    priority?: string;
    icon?: string;
    color?: string;
  }) {
    return prisma.savingsGoal.create({
      data: { ...data, userId } as any,
    });
  },

  async update(id: string, data: {
    name?: string;
    targetAmount?: number;
    currentAmount?: number;
    deadline?: Date | null;
    priority?: string;
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
