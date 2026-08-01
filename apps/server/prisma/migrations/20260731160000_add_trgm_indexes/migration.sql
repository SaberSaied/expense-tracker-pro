-- Enable pg_trgm extension for trigram-based text search indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index on transaction description for ILIKE/contains searches
CREATE INDEX IF NOT EXISTS "idx_transactions_description_gin"
  ON "transactions"
  USING gin ("description" gin_trgm_ops);

-- GIN index on transaction notes for ILIKE/contains searches
CREATE INDEX IF NOT EXISTS "idx_transactions_notes_gin"
  ON "transactions"
  USING gin ("notes" gin_trgm_ops);

-- GIN index on category name for ILIKE/contains searches
CREATE INDEX IF NOT EXISTS "idx_categories_name_gin"
  ON "categories"
  USING gin ("name" gin_trgm_ops);

-- GIN index on payment method name for ILIKE/contains searches
CREATE INDEX IF NOT EXISTS "idx_payment_methods_name_gin"
  ON "payment_methods"
  USING gin ("name" gin_trgm_ops);

-- GIN index on savings goal name for ILIKE/contains searches
CREATE INDEX IF NOT EXISTS "idx_savings_goals_name_gin"
  ON "savings_goals"
  USING gin ("name" gin_trgm_ops);

-- Composite index for budgets searching by category name (via join)
-- This speeds up the nested keyword filter
CREATE INDEX IF NOT EXISTS "idx_budgets_category_user"
  ON "budgets" ("userId", "categoryId");
