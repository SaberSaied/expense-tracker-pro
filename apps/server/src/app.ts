import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import { corsOptions, helmetOptions, logger, env } from "./config";
import { errorHandler, notFoundHandler } from "./common/middleware";
import { routes } from "./routes";
import { API_PREFIX } from "./common/constants";
import { prisma } from "./db";
import { UPLOADS_DIR } from "./common/utils/upload";

export function createApp(): Application {
  const app = express();

  // ─── Security Middleware ──────────────────────────────────
  app.use(helmet(helmetOptions));
  app.use(cors(corsOptions));

  // ─── Static Files (uploads) ───────────────────────────────
  app.use("/uploads", express.static(UPLOADS_DIR));

  // ─── Body Parsing ─────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Cookie Parsing ───────────────────────────────────────
  app.use(cookieParser());

  // ─── Compression ──────────────────────────────────────────
  app.use(compression());

  // ─── Request Logging (Morgan) ─────────────────────────────
  if (env.NODE_ENV !== "test") {
    app.use(morgan("combined", { stream: logger.stream }));
  }

  // ─── Health Check ─────────────────────────────────────────
  app.get(`${API_PREFIX}/health`, async (_req, res) => {
    let dbStatus = "disconnected";
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch {
      dbStatus = "error";
    }

    res.json({
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: env.NODE_ENV,
        application: {
          name: env.APP_NAME,
          version: env.APP_VERSION,
        },
        database: {
          status: dbStatus,
        },
      },
    });
  });

  // ─── API Routes ───────────────────────────────────────────
  app.use(API_PREFIX, routes);

  // ─── Error Handling (must be last) ────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
