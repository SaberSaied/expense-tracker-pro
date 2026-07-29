import { Router } from "express";
import { budgetController } from "./budgets.controller";
import { validate, asyncHandler } from "@/common/middleware";
import { createBudgetSchema, updateBudgetSchema } from "./budgets.validation";
import { uuidParamSchema } from "@/common/validators";
import { authMiddleware } from "@/common/middleware/auth";

const router: Router = Router();

router.get("/", authMiddleware, asyncHandler(budgetController.findAll));
router.get("/:id", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(budgetController.findById));
router.post("/", validate(createBudgetSchema), authMiddleware, asyncHandler(budgetController.create));
router.patch("/:id", validate(uuidParamSchema, "params"), validate(updateBudgetSchema), authMiddleware, asyncHandler(budgetController.update));
router.delete("/:id", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(budgetController.delete));

export { router as budgetRoutes };
