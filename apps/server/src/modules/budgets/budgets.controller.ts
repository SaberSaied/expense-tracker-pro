import type { Response, NextFunction } from "express";
import { budgetService } from "./budgets.service";
import { sendSuccess, sendCreated, sendNoContent } from "@/common/responses";
import type { AuthenticatedRequest } from "@/common/types";

export const budgetController = {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const budgets = await budgetService.findAll(req.user.id);
      sendSuccess(res, { budgets });
    } catch (err) {
      next(err);
    }
  },

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.findById(req.user.id, req.params.id as string);
      sendSuccess(res, { budget });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.create(req.user.id, req.body);
      sendCreated(res, { budget });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.update(req.user.id, req.params.id as string, req.body);
      sendSuccess(res, { budget });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await budgetService.delete(req.user.id, req.params.id as string);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  },
};
