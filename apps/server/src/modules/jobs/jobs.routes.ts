import { Router } from "express";
import { jobsController } from "./jobs.controller";
import { validate, asyncHandler } from "@/common/middleware";
import { jobNameParamSchema, runJobQuerySchema } from "./jobs.validation";

const router: Router = Router();

// ─── Job triggers (guarded by JOBS_TRIGGER_TOKEN) ───────────
router.get("/run-all", asyncHandler(jobsController.runAll));
router.post("/run-all", asyncHandler(jobsController.runAll));

router.get(
  "/run/:name",
  validate(jobNameParamSchema, "params"),
  validate(runJobQuerySchema, "query"),
  asyncHandler(jobsController.runOne),
);
router.post(
  "/run/:name",
  validate(jobNameParamSchema, "params"),
  validate(runJobQuerySchema, "query"),
  asyncHandler(jobsController.runOne),
);

export { router as jobsRoutes };
