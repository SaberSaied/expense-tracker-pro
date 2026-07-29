import type { Response, NextFunction } from "express";
import { reportService } from "./reports.service";
import { sendSuccess } from "@/common/responses";
import type { AuthenticatedRequest } from "@/common/types";

export const reportController = {
  async getCategorySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const result = await reportService.getCategorySummary(
        req.user.id,
        startDate as string,
        endDate as string
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
};
