import type { Response, NextFunction } from "express";
import { dashboardService } from "./dashboard.service";
import { sendSuccess } from "@/common/responses";
import type { AuthenticatedRequest } from "@/common/types";

export const dashboardController = {
  async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const overview = await dashboardService.getOverview(req.user.id);
      sendSuccess(res, { overview });
    } catch (err) {
      next(err);
    }
  },
};
