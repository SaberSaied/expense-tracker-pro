import { Router } from "express";
import { authController } from "./auth.controller";
import { validate, asyncHandler } from "@/common/middleware";
import { authMiddleware } from "@/common/middleware/auth";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";

const router: Router = Router();

// ─── Public Routes ────────────────────────────────────────────
router.post("/register", validate(registerSchema), asyncHandler(authController.register));
router.post("/login", validate(loginSchema), asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refreshToken));
router.post("/logout", asyncHandler(authController.logout));
router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(authController.resetPassword));

// ─── Protected Routes ─────────────────────────────────────────
router.get("/me", authMiddleware, asyncHandler(authController.getProfile));

export { router as authRoutes };
