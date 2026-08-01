import { createApp } from "./app";
import type { Application } from "express";
import { env, logger } from "./config";
import { startJobsScheduler } from "./modules/jobs";

const app: Application = createApp();

app.listen(env.PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${env.PORT}`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`📡 API prefix: /api/v1`);

  // Start background jobs (skipped in test mode — tests drive jobs manually)
  if (env.NODE_ENV !== "test") {
    startJobsScheduler();
  }
});

export default app;
