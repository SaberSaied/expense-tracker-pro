-- Add REMINDER to NotificationType enum
ALTER TYPE "NotificationType" ADD VALUE 'REMINDER';

-- Create ReminderType enum
CREATE TYPE "ReminderType" AS ENUM ('RECURRING_EXPENSE', 'RECURRING_INCOME', 'SAVINGS_CONTRIBUTION', 'CUSTOM');

-- Create ReminderFrequency enum
CREATE TYPE "ReminderFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- Create reminders table
CREATE TABLE "reminders" (
    "id" UUID NOT NULL,
    "type" "ReminderType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "amount" DOUBLE PRECISION,
    "frequency" "ReminderFrequency" NOT NULL DEFAULT 'MONTHLY',
    "interval" INTEGER NOT NULL DEFAULT 1,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "startDate" DATE NOT NULL,
    "nextTriggerDate" DATE NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" UUID,
    "savingsGoalId" UUID,
    "userId" UUID NOT NULL,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_savingsGoalId_fkey" FOREIGN KEY ("savingsGoalId") REFERENCES "savings_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "reminders_userId_enabled_idx" ON "reminders"("userId", "enabled");
CREATE INDEX "reminders_userId_nextTriggerDate_idx" ON "reminders"("userId", "nextTriggerDate");
CREATE INDEX "reminders_userId_type_idx" ON "reminders"("userId", "type");
