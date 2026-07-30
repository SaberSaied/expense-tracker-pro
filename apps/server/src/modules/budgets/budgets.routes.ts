import { Router } from "express";
import { budgetController } from "./budgets.controller";
import { validate, asyncHandler } from "@/common/middleware";
import { createBudgetSchema, updateBudgetSchema, budgetQuerySchema } from "./budgets.validation";
import { uuidParamSchema } from "@/common/validators";
import { authMiddleware } from "@/common/middleware/auth";

const router: Router = Router();

// ─── Static routes (must come before :id routes) ────────
router.get("/", validate(budgetQuerySchema, "query"), authMiddleware, asyncHandler(budgetController.findAll));

// ─── Insights / Alert / Progress routes (must come before :id routes) ─
router.get("/insights", authMiddleware, asyncHandler(budgetController.getInsights));
router.get("/alerts", authMiddleware, asyncHandler(budgetController.getAlerts));
router.post("/alerts/generate", authMiddleware, asyncHandler(budgetController.generateAlerts));
router.get("/progress/summary", authMiddleware, asyncHandler(budgetController.getProgressSummary));
router.get("/:id/progress", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(budgetController.getProgress));
router.get("/:id", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(budgetController.findById));
router.post("/", validate(createBudgetSchema), authMiddleware, asyncHandler(budgetController.create));
router.patch("/:id", validate(uuidParamSchema, "params"), validate(updateBudgetSchema), authMiddleware, asyncHandler(budgetController.update));
router.delete("/:id", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(budgetController.delete));

export { router as budgetRoutes };
