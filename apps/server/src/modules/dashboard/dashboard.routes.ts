import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { asyncHandler } from "@/common/middleware";
import { authMiddleware } from "@/common/middleware/auth";

const router: Router = Router();

router.get("/overview", authMiddleware, asyncHandler(dashboardController.getOverview));
router.get(
  "/income-expense-chart",
  authMiddleware,
  asyncHandler(dashboardController.getIncomeExpenseChart)
);
router.get(
  "/category-distribution",
  authMiddleware,
  asyncHandler(dashboardController.getCategoryDistribution)
);
router.get(
  "/monthly-expenses",
  authMiddleware,
  asyncHandler(dashboardController.getMonthlyExpenses)
);
router.get(
  "/budget-usage",
  authMiddleware,
  asyncHandler(dashboardController.getBudgetUsage)
);
router.get(
  "/cash-flow",
  authMiddleware,
  asyncHandler(dashboardController.getCashFlow)
);

export { router as dashboardRoutes };
