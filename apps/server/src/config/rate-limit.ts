import { rateLimit } from "express-rate-limit";
import type { Response, Request } from "express";

/**
 * Skip rate limiting entirely during tests — integration tests hammer
 * endpoints far beyond human limits and rely on real responses.
 *
 * Reads `process.env.NODE_ENV` per-request rather than the module-load
 * snapshot (`env.NODE_ENV`), because test files set NODE_ENV=test after
 * imports are hoisted/evaluated.
 */
const skipInTests = () => process.env.NODE_ENV === "test";

/** JSON 429 response consistent with the rest of the API. */
function rateLimitHandler(_req: Request, res: Response, message: string) {
  res.status(429).json({
    success: false,
    error: "RateLimitError",
    message,
    statusCode: 429,
  });
}

/** General API limiter: 300 requests / 15 min per IP. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: (req, res) => rateLimitHandler(req, res, "Too many requests, please try again later"),
});

/** Stricter limiter for authentication endpoints: 20 requests / 15 min per IP. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: (req, res) => rateLimitHandler(req, res, "Too many attempts, please try again later"),
});
