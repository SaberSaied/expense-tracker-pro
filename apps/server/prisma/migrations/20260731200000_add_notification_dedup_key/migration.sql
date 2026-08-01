-- Add a stable de-duplication key to notifications.
-- A unique (userId, dedupKey) pair prevents duplicate notifications at the
-- database level so concurrent batch jobs can insert without races.

ALTER TABLE "notifications" ADD COLUMN "dedupKey" TEXT;

CREATE UNIQUE INDEX "notifications_userId_dedupKey_key"
  ON "notifications"("userId", "dedupKey")
  WHERE "dedupKey" IS NOT NULL;

-- Index for the expired-notification cleanup job (delete old read rows).
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");
