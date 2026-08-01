import { config } from "dotenv";
import { z } from "zod";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (four levels up from src/config/ -> apps/server -> apps -> project root)
config({ path: resolve(__dirname, "../../../../.env") });

const envSchema = z.object({
  // ─── Server ────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().positive().default(4000),
  APP_NAME: z.string().default("ExpenseTracker"),
  APP_VERSION: z.string().default("1.0.0"),

  // ─── Database ──────────────────────────────────────────────
  DATABASE_URL: z.string().url(),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().default("postgres"),
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().positive().default(5432),
  POSTGRES_DB: z.string().default("postgres"),

  // ─── JWT ───────────────────────────────────────────────────
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .default("change-me-in-production-use-a-real-secret"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // ─── CORS ──────────────────────────────────────────────────
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // ─── Proxy ─────────────────────────────────────────────────
  // How many reverse-proxy hops to trust for client IPs (used by rate
  // limiters). "false" = don't trust proxy headers; "1" = one hop
  // (nginx/caddy). Defaults to "1" in production, "false" otherwise
  // (resolved in app.ts). Never "true" — allows X-Forwarded-For spoofing
  // and makes express-rate-limit v8 throw on every request.
  TRUST_PROXY: z
    .string()
    .optional()
    .refine(
      (v) =>
        !v ||
        v === "false" ||
        v === "loopback" ||
        v === "linklocal" ||
        v === "uniquelocal" ||
        /^[1-9]\d*$/.test(v),
      {
        message:
          "TRUST_PROXY must be 'false', a positive hop count (e.g. '1'), " +
          "'loopback', 'linklocal', or 'uniquelocal'. 'true' is not allowed " +
          "(allows X-Forwarded-For spoofing).",
      }
    ),

  // ─── Background Jobs (optional) ────────────────────────────
  JOBS_TRIGGER_TOKEN: z.string().optional(),

  // ─── Email (optional) ──────────────────────────────────────
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().default("noreply@expensetracker.com"),
});

const DEFAULT_JWT_SECRET = "change-me-in-production-use-a-real-secret";

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  // Never boot production with the public placeholder secret — it would
  // allow anyone to forge valid JWTs.
  if (
    result.data.NODE_ENV === "production" &&
    result.data.JWT_SECRET === DEFAULT_JWT_SECRET
  ) {
    console.error(
      "❌ JWT_SECRET must be set to a strong, unique value in production " +
        "(generate one with `openssl rand -hex 64`)."
    );
    process.exit(1);
  }

  return result.data;
}

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;
