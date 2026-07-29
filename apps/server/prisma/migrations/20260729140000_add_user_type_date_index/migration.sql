-- Add composite index for chart queries filtering by userId + type + date
CREATE INDEX IF NOT EXISTS "transactions_userId_type_date_idx" ON "transactions" ("userId", "type", "date");
