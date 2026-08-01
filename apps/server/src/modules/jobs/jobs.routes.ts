import { Router } from "express";
import { jobsController } from "./jobs.controller";
import { validate, asyncHandler } from "@/common/middleware";
import { jobNameParamSchema, runJobQuerySchema } from "./jobs.validation";

const router: Router = Router();

// ─── Manual job triggers (guarded by JOBS_TRIGGER_TOKEN) ────
router.post(
  "/run-all",
  asyncHandler(jobsController.runAll)
);

router.post(
  "/run/:name",
  validate(jobNameParamSchema, "params"),
  validate(runJobQuerySchema, "query"),
  asyncHandler(jobsController.runOne)
);

export { router as jobsRoutes };
