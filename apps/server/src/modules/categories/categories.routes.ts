import { Router } from "express";
import { categoryController } from "./categories.controller";
import { validate, asyncHandler } from "@/common/middleware";
import { createCategorySchema, updateCategorySchema } from "./categories.validation";
import { uuidParamSchema } from "@/common/validators";
import { authMiddleware } from "@/common/middleware/auth";

const router: Router = Router();

router.get("/", authMiddleware, asyncHandler(categoryController.findAll));
router.get("/:id", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(categoryController.findById));
router.post("/", validate(createCategorySchema), authMiddleware, asyncHandler(categoryController.create));
router.patch("/:id", validate(uuidParamSchema, "params"), validate(updateCategorySchema), authMiddleware, asyncHandler(categoryController.update));
router.delete("/:id", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(categoryController.delete));

export { router as categoryRoutes };
