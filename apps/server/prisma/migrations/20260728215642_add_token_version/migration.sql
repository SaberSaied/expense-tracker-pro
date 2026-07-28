-- Add tokenVersion column for refresh token invalidation on password change
ALTER TABLE "users" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
