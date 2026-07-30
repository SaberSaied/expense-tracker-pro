import { Router } from "express";
import { reportController } from "./reports.controller";
import { validate, asyncHandler } from "@/common/middleware";
import { authMiddleware } from "@/common/middleware/auth";
import { categorySummaryQuerySchema, monthlyTrendQuerySchema, dailyReportQuerySchema, weeklyReportQuerySchema, monthlyReportQuerySchema, yearlyReportQuerySchema } from "./reports.validation";

const router: Router = Router();

router.get(
  "/daily",
  validate(dailyReportQuerySchema, "query"),
  authMiddleware,
  asyncHandler(reportController.getDailyReport)
);
router.get(
  "/weekly",
  validate(weeklyReportQuerySchema, "query"),
  authMiddleware,
  asyncHandler(reportController.getWeeklyReport)
);
router.get(
  "/monthly",
  validate(monthlyReportQuerySchema, "query"),
  authMiddleware,
  asyncHandler(reportController.getMonthlyReport)
);
router.get(
  "/yearly",
  validate(yearlyReportQuerySchema, "query"),
  authMiddleware,
  asyncHandler(reportController.getYearlyReport)
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
