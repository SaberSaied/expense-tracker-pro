import { Router } from "express";
import { userController } from "./users.controller";
import { validate, asyncHandler } from "@/common/middleware";
import { authMiddleware } from "@/common/middleware/auth";
import {
  updateProfileSchema,
  updatePasswordSchema,
  deactivateAccountSchema,
  deleteAccountSchema,
} from "./users.validation";
import { uploadAvatarMiddleware } from "@/common/utils/upload";

const router: Router = Router();

// All routes require authentication
router.get("/me", authMiddleware, asyncHandler(userController.getProfile));
router.patch(
  "/me",
  authMiddleware,
  validate(updateProfileSchema),
  asyncHandler(userController.updateProfile),
);

// Avatar upload / removal
router.post(
  "/me/avatar",
  authMiddleware,
  uploadAvatarMiddleware,
  asyncHandler(userController.uploadAvatar),
);
router.delete("/me/avatar", authMiddleware, asyncHandler(userController.removeAvatar));

router.post(
  "/me/password",
  authMiddleware,
  validate(updatePasswordSchema),
  asyncHandler(userController.updatePassword),
);

// Account lifecycle
router.post(
  "/me/deactivate",
  authMiddleware,
  validate(deactivateAccountSchema),
  asyncHandler(userController.deactivateAccount),
);
router.post("/me/reactivate", authMiddleware, asyncHandler(userController.reactivateAccount));
router.delete(
  "/me",
  authMiddleware,
  validate(deleteAccountSchema),
  asyncHandler(userController.deleteAccount),
);

export { router as userRoutes };
