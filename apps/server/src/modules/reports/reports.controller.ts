import type { Response, NextFunction } from "express";
import { reportService } from "./reports.service";
import { sendSuccess } from "@/common/responses";
import type { AuthenticatedRequest } from "@/common/types";

export const reportController = {
  async getCategorySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const startDate = (req.query.startDate as string) ?? firstDayOfMonth.toISOString().slice(0, 10);
      const endDate = (req.query.endDate as string) ?? now.toISOString().slice(0, 10);

      const result = await reportService.getCategorySummary(
        req.user.id,
        startDate,
        endDate
      );
      sendSuccess(res, { report: result });
    } catch (err) {
      next(err);
    }
  },

  async getMonthlyTrend(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
      const result = await reportService.getMonthlyTrend(req.user.id, year);
      sendSuccess(res, { report: result });
    } catch (err) {
      next(err);
    }
  },

  async getDailyReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
      const result = await reportService.getDailyReport(req.user.id, date);
      sendSuccess(res, { report: result });
    } catch (err) {
      next(err);
    }
  },
};
