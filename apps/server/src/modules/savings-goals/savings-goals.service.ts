import { savingsGoalRepository } from "./savings-goals.repository";
import { NotFoundError, ValidationError } from "@/common/errors";

export const savingsGoalService = {
  async findAll(userId: string) {
    return savingsGoalRepository.findAllByUser(userId);
  },

  async findById(userId: string, id: string) {
    const goal = await savingsGoalRepository.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundError("Savings goal not found");
    }
    return goal;
  },

  async create(userId: string, data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    deadline?: string;
    icon?: string;
    color?: string;
  }) {
    if (data.currentAmount && data.currentAmount > data.targetAmount) {
      throw new ValidationError("Current amount cannot exceed target amount");
    }
    return savingsGoalRepository.create(userId, {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });
  },

  async update(userId: string, id: string, data: Record<string, unknown>) {
    const goal = await savingsGoalRepository.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundError("Savings goal not found");
    }
    return savingsGoalRepository.update(id, data as any);
  },

  async delete(userId: string, id: string) {
    const goal = await savingsGoalRepository.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundError("Savings goal not found");
    }
    return savingsGoalRepository.delete(id);
  },

  async addProgress(userId: string, id: string, amount: number) {
    const goal = await savingsGoalRepository.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundError("Savings goal not found");
    }
    if (amount <= 0) {
      throw new ValidationError("Progress amount must be positive");
    }
    return savingsGoalRepository.addProgress(id, amount);
  },
};
