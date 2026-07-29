import { Router } from "express";
import { reportController } from "./reports.controller";
import { asyncHandler } from "@/common/middleware";
import { authMiddleware } from "@/common/middleware/auth";

const router: Router = Router();

router.get("/category-summary", authMiddleware, asyncHandler(reportController.getCategorySummary));
router.get("/monthly-trend", authMiddleware, asyncHandler(reportController.getMonthlyTrend));

export { router as reportRoutes };
