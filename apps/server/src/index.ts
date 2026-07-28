import express from "express";
import cors from "cors";

// Load environment variables from root .env
const app: express.Express = express();
const PORT = process.env.PORT ?? 4000;

// ─── Middleware ────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────

app.get("/api/v1/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    },
  });
});

// ─── Error Handler ────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message,
    statusCode: 500,
  });
});

// ─── Start Server ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export default app;
