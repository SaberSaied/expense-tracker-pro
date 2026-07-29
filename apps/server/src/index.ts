import { createApp } from "./app";
import type { Application } from "express";
import { env, logger } from "./config";

const app: Application = createApp();

app.listen(env.PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${env.PORT}`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`📡 API prefix: /api/v1`);
});

export default app;
