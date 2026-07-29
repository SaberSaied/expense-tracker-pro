import { Router } from "express";
import { transactionController } from "./transactions.controller";
import { validate, asyncHandler } from "@/common/middleware";
import { createTransactionSchema, updateTransactionSchema, transactionQuerySchema, bulkDeleteSchema, bulkUpdateSchema } from "./transactions.validation";
import { uuidParamSchema } from "@/common/validators";
import { authMiddleware } from "@/common/middleware/auth";
import { uploadReceiptMiddleware } from "@/common/utils/upload";

const router: Router = Router();

// ─── Static routes (must come before :id routes) ────────
router.get("/", validate(transactionQuerySchema, "query"), authMiddleware, asyncHandler(transactionController.findAll));
router.get("/summary", authMiddleware, asyncHandler(transactionController.getSummary));
router.post("/", validate(createTransactionSchema), authMiddleware, asyncHandler(transactionController.create));

// ─── Bulk operations ────────────────────────────────────
router.post("/bulk/delete", validate(bulkDeleteSchema), authMiddleware, asyncHandler(transactionController.bulkDelete));
router.post("/bulk/update", validate(bulkUpdateSchema), authMiddleware, asyncHandler(transactionController.bulkUpdate));

// ─── Parameterized routes ───────────────────────────────
router.get("/:id", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(transactionController.findById));
router.post("/:id/receipt", validate(uuidParamSchema, "params"), authMiddleware, uploadReceiptMiddleware, asyncHandler(transactionController.uploadReceipt));
router.delete("/:id/receipt", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(transactionController.removeReceipt));
router.patch("/:id", validate(uuidParamSchema, "params"), validate(updateTransactionSchema), authMiddleware, asyncHandler(transactionController.update));
router.delete("/:id", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(transactionController.delete));

export { router as transactionRoutes };
