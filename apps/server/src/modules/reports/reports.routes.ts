import { Router } from "express";
import { reportController } from "./reports.controller";
import { validate, asyncHandler } from "@/common/middleware";
import { authMiddleware } from "@/common/middleware/auth";
import { categorySummaryQuerySchema, monthlyTrendQuerySchema, dailyReportQuerySchema } from "./reports.validation";

const router: Router = Router();

router.get(
  "/daily",
  validate(dailyReportQuerySchema, "query"),
  authMiddleware,
  asyncHandler(reportController.getDailyReport)
);
router.get(
  "/category-summary",
  validate(categorySummaryQuerySchema, "query"),
  authMiddleware,
  asyncHandler(reportController.getCategorySummary)
);
router.get(
  "/monthly-trend",
  validate(monthlyTrendQuerySchema, "query"),
  authMiddleware,
  asyncHandler(reportController.getMonthlyTrend)
);

export { router as reportRoutes };
