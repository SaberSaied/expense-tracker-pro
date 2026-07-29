import type { Response, NextFunction } from "express";
import { savingsGoalService } from "./savings-goals.service";
import { sendSuccess, sendCreated, sendNoContent } from "@/common/responses";
import type { AuthenticatedRequest } from "@/common/types";

export const savingsGoalController = {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const savingsGoals = await savingsGoalService.findAll(req.user.id);
      sendSuccess(res, { savingsGoals });
    } catch (err) {
      next(err);
    }
  },

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const savingsGoal = await savingsGoalService.findById(req.user.id, req.params.id as string);
      sendSuccess(res, { savingsGoal });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const savingsGoal = await savingsGoalService.create(req.user.id, req.body);
      sendCreated(res, { savingsGoal });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const savingsGoal = await savingsGoalService.update(req.user.id, req.params.id as string, req.body);
      sendSuccess(res, { savingsGoal });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await savingsGoalService.delete(req.user.id, req.params.id as string);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  },

  async addProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { amount } = req.body;
      const savingsGoal = await savingsGoalService.addProgress(req.user.id, req.params.id as string, amount);
      sendSuccess(res, { savingsGoal });
    } catch (err) {
      next(err);
    }
  },
};
