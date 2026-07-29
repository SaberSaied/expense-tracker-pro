import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { asyncHandler } from "@/common/middleware";
import { authMiddleware } from "@/common/middleware/auth";

const router: Router = Router();

router.get("/overview", authMiddleware, asyncHandler(dashboardController.getOverview));

export { router as dashboardRoutes };
