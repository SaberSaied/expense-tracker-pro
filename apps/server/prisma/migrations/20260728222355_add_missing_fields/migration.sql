-- Add missing user columns that were added to the schema but never migrated
ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" ADD COLUMN "firstName" TEXT;
ALTER TABLE "users" ADD COLUMN "lastName" TEXT;
ALTER TABLE "users" ADD COLUMN "resetTokenHash" TEXT;
ALTER TABLE "users" ADD COLUMN "resetTokenExpiresAt" TIMESTAMPTZ;

-- Add unique index on username (matching schema: @unique)
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
