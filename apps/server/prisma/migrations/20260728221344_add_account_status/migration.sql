-- Add account status columns for deactivation/soft-delete
ALTER TABLE "users" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "deactivatedAt" TIMESTAMPTZ;
