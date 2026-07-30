import { Router } from "express";
import { savingsGoalController } from "./savings-goals.controller";
import { validate, asyncHandler } from "@/common/middleware";
import { createSavingsGoalSchema, updateSavingsGoalSchema, savingsGoalQuerySchema, addProgressSchema } from "./savings-goals.validation";
import { uuidParamSchema } from "@/common/validators";
import { authMiddleware } from "@/common/middleware/auth";

const router: Router = Router();

router.get("/", validate(savingsGoalQuerySchema, "query"), authMiddleware, asyncHandler(savingsGoalController.findAll));
router.get("/:id", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(savingsGoalController.findById));
router.post("/", validate(createSavingsGoalSchema), authMiddleware, asyncHandler(savingsGoalController.create));
router.patch("/:id", validate(uuidParamSchema, "params"), validate(updateSavingsGoalSchema), authMiddleware, asyncHandler(savingsGoalController.update));
router.delete("/:id", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(savingsGoalController.delete));
router.post("/:id/progress", validate(uuidParamSchema, "params"), validate(addProgressSchema), authMiddleware, asyncHandler(savingsGoalController.addProgress));

export { router as savingsGoalRoutes };
