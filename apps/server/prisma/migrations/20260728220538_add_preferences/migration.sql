-- Add theme and timeZone columns for user preferences
ALTER TABLE "users" ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'dark';
ALTER TABLE "users" ADD COLUMN "timeZone" TEXT NOT NULL DEFAULT 'UTC';
