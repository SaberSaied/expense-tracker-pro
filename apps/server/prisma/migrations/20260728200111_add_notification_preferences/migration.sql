-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notificationPreferences" JSONB NOT NULL DEFAULT '{"budgetAlerts":true,"emailWarnings":true,"weeklyDigest":false}';
