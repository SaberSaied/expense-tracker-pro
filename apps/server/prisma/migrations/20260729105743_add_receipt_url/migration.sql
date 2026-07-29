-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "receiptUrl" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "deactivatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "resetTokenExpiresAt" SET DATA TYPE TIMESTAMP(3);
