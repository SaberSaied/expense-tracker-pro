import { Router } from "express";
import { exportController } from "./exports.controller";
import { validate, asyncHandler } from "@/common/middleware";
import {
  exportTransactionsQuerySchema,
  exportReportQuerySchema,
} from "./exports.validation";
import { authMiddleware } from "@/common/middleware/auth";

const router: Router = Router();

router.get(
  "/transactions",
  validate(exportTransactionsQuerySchema, "query"),
  authMiddleware,
  asyncHandler(exportController.exportTransactions)
);

router.get(
  "/reports",
  validate(exportReportQuerySchema, "query"),
  authMiddleware,
  asyncHandler(exportController.exportReport)
);

export { router as exportRoutes };
