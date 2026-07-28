import { config } from "dotenv";
import { z } from "zod";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (two levels up from src/config/)
config({ path: resolve(__dirname, "../../../.env") });

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
  JWT_SECRET: z.string().min(32).default("change-me-in-production-use-a-real-secret"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // ─── CORS ──────────────────────────────────────────────────
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // ─── Email (optional) ──────────────────────────────────────
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().default("noreply@expensetracker.com"),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  return result.data;
}

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;
