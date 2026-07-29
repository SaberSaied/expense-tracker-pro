import { Router } from "express";
import { notificationController } from "./notifications.controller";
import { asyncHandler } from "@/common/middleware";
import { uuidParamSchema } from "@/common/validators";
import { validate } from "@/common/middleware";
import { authMiddleware } from "@/common/middleware/auth";

const router: Router = Router();

router.get("/", authMiddleware, asyncHandler(notificationController.findAll));
router.get("/unread", authMiddleware, asyncHandler(notificationController.findUnread));
router.get("/unread/count", authMiddleware, asyncHandler(notificationController.getUnreadCount));
router.patch("/:id/read", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(notificationController.markAsRead));
router.patch("/read-all", authMiddleware, asyncHandler(notificationController.markAllAsRead));
router.delete("/:id", validate(uuidParamSchema, "params"), authMiddleware, asyncHandler(notificationController.delete));

export { router as notificationRoutes };
