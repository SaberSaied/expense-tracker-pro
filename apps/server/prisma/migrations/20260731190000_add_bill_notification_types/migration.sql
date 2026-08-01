-- Add BILL_DUE_SOON and BILL_OVERDUE to NotificationType enum
ALTER TYPE "NotificationType" ADD VALUE 'BILL_DUE_SOON';
ALTER TYPE "NotificationType" ADD VALUE 'BILL_OVERDUE';
