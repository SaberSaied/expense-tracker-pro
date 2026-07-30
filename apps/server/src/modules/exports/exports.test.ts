/**
 * Exports Module — API Integration Tests
 *
 * Tests: CSV export of transactions and reports.
 *
 * Run: npx tsx src/modules/exports/exports.test.ts
 *
 * Prerequisites: PostgreSQL running, migrations applied
 */

import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "../../../../.env") });

process.env.PORT = "4008";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-for-exports-integration-tests";
process.env.JWT_EXPIRES_IN = "1h";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";

import { createApp } from "../../app";
import type { Application } from "express";
import type { Server } from "node:http";

// ─── Test Runner ──────────────────────────────────────────────

let passed = 0;
let failed = 0;
let userTokens: { accessToken: string; refreshToken: string } | null = null;
let secondUserTokens: { accessToken: string; refreshToken: string } | null = null;
let testCategoryId: string | null = null;
let incomeCategoryId: string | null = null;
let testPaymentMethodId: string | null = null;
let server: Server;
let app: Application;

const BASE = "http://localhost:4008/api/v1";
const TEST_EMAIL = `exp-test-${Date.now()}@example.com`;
const TEST_PASSWORD = "Test@123456";
const SECOND_USER_EMAIL = `exp-test-2-${Date.now()}@example.com`;

async function request(
  method: string,
  path: string,
  reqBody?: unknown,
  token?: string | null
): Promise<{ status: number; text: string; contentType: string }> {
  const headers: Record<string, string> = {};
  // Set Content-Type for requests with a body (POST, PATCH)
  if (reqBody !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: reqBody ? JSON.stringify(reqBody) : undefined,
  });

  const status = response.status;
  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "";

  return { status, text, contentType };
}

function assert(condition: unknown, label: string) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    failed++;
  }
}

// ─── Tests ────────────────────────────────────────────────────

async function runTests() {
  console.log("\n🧪 Exports Module — API Integration Tests\n");
  console.log(`Test user: ${TEST_EMAIL}\n`);

  // ─── 0. Health Check ───────────────────────────────────────
  console.log("─── 0. Health Check ───");
  const health = await request("GET", "/health");
  assert(health.status === 200, "Health endpoint returns 200");

  // ─── 1. Register User & Set Up Test Data ───────────────────
  console.log("\n─── 1. Register & Create Test Data ───");
  const register = await request("POST", "/auth/register", {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    name: "Export Tester",
  });
  assert(register.status === 201, "Register returns 201");
  const registerJson = JSON.parse(register.text);
  userTokens = registerJson.data?.tokens as { accessToken: string; refreshToken: string };
  assert(userTokens != null, "Register returns tokens");

  // Get default categories
  const defaultCats = await request("GET", "/categories", undefined, userTokens?.accessToken);
  assert(defaultCats.status === 200, "Default categories fetched");
  const catsJson = JSON.parse(defaultCats.text);
  const cats = catsJson.data?.categories as Array<Record<string, unknown>> | undefined;

  const foodCat = cats?.find((c) => c.name === "Food");
  testCategoryId = (foodCat?.id as string) ?? null;
  assert(testCategoryId != null, "Found Food expense category");

  const salaryCat = cats?.find((c) => c.name === "Salary");
  incomeCategoryId = (salaryCat?.id as string) ?? null;
  assert(incomeCategoryId != null, "Found Salary income category");

  // Create a payment method
  const pm = await request(
    "POST",
    "/payment-methods",
    { type: "CREDIT_CARD", name: "Test Visa", lastFour: "1234" },
    userTokens?.accessToken
  );
  assert(pm.status === 201, "Payment method created");
  const pmJson = JSON.parse(pm.text);
  testPaymentMethodId = (pmJson.data?.paymentMethod as Record<string, unknown>)?.id as string ?? null;
  assert(testPaymentMethodId != null, "Payment method has ID");

  // Create transactions
  const today = new Date().toISOString().slice(0, 10);

  const tx1 = await request(
    "POST",
    "/transactions",
    {
      type: "EXPENSE",
      amount: 42.50,
      description: "Whole Foods Market",
      date: today,
      categoryId: testCategoryId,
      paymentMethodId: testPaymentMethodId,
    },
    userTokens?.accessToken
  );
  assert(tx1.status === 201, "Created expense transaction");

  const tx2 = await request(
    "POST",
    "/transactions",
    {
      type: "INCOME",
      amount: 5000.00,
      description: "Monthly Paycheck",
      date: today,
      categoryId: incomeCategoryId,
    },
    userTokens?.accessToken
  );
  assert(tx2.status === 201, "Created income transaction");

  // ─── 2. Export Transactions as CSV ─────────────────────────
  console.log("\n─── 2. Export Transactions (GET /exports/transactions) ───");

  const exportTx = await request("GET", "/exports/transactions", undefined, userTokens?.accessToken);
  assert(exportTx.status === 200, "Export transactions returns 200");
  assert(exportTx.contentType.includes("text/csv"), "Content-Type is text/csv");
  assert(exportTx.text.startsWith("ID,Date,Type,Amount,"), "CSV starts with transaction headers");
  assert(exportTx.text.includes("42.50"), "CSV contains expense amount 42.50");
  assert(exportTx.text.includes("5000.00"), "CSV contains income amount 5000.00");
  assert(exportTx.text.includes("Whole Foods Market"), "CSV contains transaction description");
  assert(exportTx.text.includes("Monthly Paycheck"), "CSV contains income description");
  assert(exportTx.text.includes("EXPENSE"), "CSV contains EXPENSE type");
  assert(exportTx.text.includes("INCOME"), "CSV contains INCOME type");
  assert(exportTx.text.includes("Food"), "CSV contains category name Food");
  assert(exportTx.text.includes("Salary"), "CSV contains category name Salary");
  assert(exportTx.text.includes("Test Visa"), "CSV contains payment method name");

  // Count rows: header + 2 transactions = 3 lines
  const txLines = exportTx.text.trim().split("\n");
  assert(txLines.length === 3, `CSV has 3 lines (header + 2 data rows, got ${txLines.length})`);

  // Validate first data row format: ID,Date,Type,Amount,Description,...
  const dataRow = txLines[1].split(",");
  assert(dataRow.length >= 7, "Data row has at least 7 columns");

  // ─── 3. Export Transactions with Filters ───────────────────
  console.log("\n─── 3. Export Transactions with Filters ───");

  // Filter by type EXPENSE
  const exportExpense = await request(
    "GET",
    "/exports/transactions?type=EXPENSE",
    undefined,
    userTokens?.accessToken
  );
  assert(exportExpense.status === 200, "Export expense transactions returns 200");
  const expenseLines = exportExpense.text.trim().split("\n");
  assert(expenseLines.length === 2, `Expense CSV has 2 lines (header + 1 expense, got ${expenseLines.length})`);
  assert(!exportExpense.text.includes("INCOME"), "Expense CSV does not contain income");
  assert(exportExpense.text.includes("42.50"), "Expense CSV contains 42.50");

  // Filter by type INCOME
  const exportIncome = await request(
    "GET",
    "/exports/transactions?type=INCOME",
    undefined,
    userTokens?.accessToken
  );
  assert(exportIncome.status === 200, "Export income transactions returns 200");
  const incomeLines = exportIncome.text.trim().split("\n");
  assert(incomeLines.length === 2, `Income CSV has 2 lines (header + 1 income, got ${incomeLines.length})`);
  assert(exportIncome.text.includes("5000.00"), "Income CSV contains 5000.00");

  // Filter by category
  const exportCat = await request(
    "GET",
    `/exports/transactions?categoryId=${testCategoryId}`,
    undefined,
    userTokens?.accessToken
  );
  assert(exportCat.status === 200, "Export by category returns 200");
  const catLines = exportCat.text.trim().split("\n");
  assert(catLines.length === 2, "Category-filtered CSV has header + 1 expense");
  assert(exportCat.text.includes("Food"), "Category CSV contains Food category");

  // Filter by amount range
  const exportAmount = await request(
    "GET",
    "/exports/transactions?minAmount=100&maxAmount=10000",
    undefined,
    userTokens?.accessToken
  );
  assert(exportAmount.status === 200, "Export by amount range returns 200");
  const amountLines = exportAmount.text.trim().split("\n");
  assert(amountLines.length === 2, "Amount-filtered CSV has header + 1 transaction");
  assert(exportAmount.text.includes("5000.00"), "Amount filter CSV contains income");

  // Combined filters
  const exportCombined = await request(
    "GET",
    `/exports/transactions?categoryId=${testCategoryId}&type=EXPENSE`,
    undefined,
    userTokens?.accessToken
  );
  assert(exportCombined.status === 200, "Combined filters return 200");
  const combinedLines = exportCombined.text.trim().split("\n");
  assert(combinedLines.length === 2, "Combined filters CSV has header + 1 row");

  // ─── 4. Export Report - Daily ──────────────────────────────
  console.log("\n─── 4. Export Report - Daily (GET /exports/reports?type=daily) ───");

  const dailyReport = await request(
    "GET",
    `/exports/reports?type=daily&date=${today}`,
    undefined,
    userTokens?.accessToken
  );
  assert(dailyReport.status === 200, "Export daily report returns 200");
  assert(dailyReport.contentType.includes("text/csv"), "Daily report CSV content type");
  assert(dailyReport.text.includes("Daily Report"), "Daily report CSV has title");
  assert(dailyReport.text.includes("42.50"), "Daily report CSV contains expense");
  assert(dailyReport.text.includes("5000.00"), "Daily report CSV contains income");
  assert(dailyReport.text.includes("Whole Foods Market"), "Daily report CSV has transaction");
  assert(dailyReport.text.includes("ID,Date,Type,Amount,"), "Daily report CSV has transaction headers");

  // ─── 5. Export Report - Weekly ─────────────────────────────
  console.log("\n─── 5. Export Report - Weekly (GET /exports/reports?type=weekly) ───");

  const weeklyReport = await request(
    "GET",
    `/exports/reports?type=weekly&date=${today}`,
    undefined,
    userTokens?.accessToken
  );
  assert(weeklyReport.status === 200, "Export weekly report returns 200");
  assert(weeklyReport.text.includes("Weekly Report"), "Weekly report CSV has title");
  assert(weeklyReport.text.includes("Daily Breakdown"), "Weekly report CSV has daily breakdown");
  assert(weeklyReport.text.includes("Transactions"), "Weekly report CSV has transactions section");
  assert(weeklyReport.text.includes("Spending by Category"), "Weekly report has category section");

  // ─── 6. Export Report - Monthly ────────────────────────────
  console.log("\n─── 6. Export Report - Monthly (GET /exports/reports?type=monthly) ───");

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = String(now.getMonth() + 1).padStart(2, "0");

  const monthlyReport = await request(
    "GET",
    `/exports/reports?type=monthly&year=${thisYear}&month=${thisMonth}`,
    undefined,
    userTokens?.accessToken
  );
  assert(monthlyReport.status === 200, "Export monthly report returns 200");
  assert(monthlyReport.text.includes("Monthly Report"), "Monthly report CSV has title");
  assert(monthlyReport.text.includes("Category Summary"), "Monthly report has category section");
  assert(monthlyReport.text.includes("Payment Method Summary"), "Monthly report has payment method section");
  assert(monthlyReport.text.includes("Budget Performance"), "Monthly report has budget section");
  assert(monthlyReport.text.includes("Food"), "Monthly report has category name");
  assert(monthlyReport.text.includes("Test Visa"), "Monthly report has payment method name");

  // ─── 7. Export Report - Yearly ─────────────────────────────
  console.log("\n─── 7. Export Report - Yearly (GET /exports/reports?type=yearly) ───");

  const yearlyReport = await request(
    "GET",
    `/exports/reports?type=yearly&year=${thisYear}`,
    undefined,
    userTokens?.accessToken
  );
  assert(yearlyReport.status === 200, "Export yearly report returns 200");
  assert(yearlyReport.text.includes("Yearly Report"), "Yearly report CSV has title");
  assert(yearlyReport.text.includes("Monthly Comparison"), "Yearly report has monthly comparison");
  assert(yearlyReport.text.includes("Top Categories"), "Yearly report has top categories");
  assert(yearlyReport.text.includes("Budget Performance"), "Yearly report has budget section");

  // ─── 8. Export Report - Summary ────────────────────────────
  console.log("\n─── 8. Export Report - Summary (GET /exports/reports?type=summary) ───");

  const summaryReport = await request(
    "GET",
    "/exports/reports?type=summary",
    undefined,
    userTokens?.accessToken
  );
  assert(summaryReport.status === 200, "Export summary report returns 200");
  assert(summaryReport.text.includes("Report Summary"), "Summary CSV has title");
  assert(summaryReport.text.includes("5000.00"), "Summary CSV contains income");
  assert(summaryReport.text.includes("42.50"), "Summary CSV contains expenses");
  assert(summaryReport.text.includes("Savings Rate"), "Summary CSV has savings rate");

  // ─── 9. Export Report - Breakdown ──────────────────────────
  console.log("\n─── 9. Export Report - Breakdown (GET /exports/reports?type=breakdown) ───");

  const breakdownReport = await request(
    "GET",
    "/exports/reports?type=breakdown",
    undefined,
    userTokens?.accessToken
  );
  assert(breakdownReport.status === 200, "Export breakdown report returns 200");
  assert(breakdownReport.text.includes("Report Breakdown"), "Breakdown CSV has title");
  assert(breakdownReport.text.includes("Income vs Expense"), "Breakdown CSV has income/expense");
  assert(breakdownReport.text.includes("Category Breakdown"), "Breakdown CSV has category section");
  assert(breakdownReport.text.includes("Payment Method Breakdown"), "Breakdown CSV has payment method section");
  assert(breakdownReport.text.includes("Food"), "Breakdown CSV has category name");
  assert(breakdownReport.text.includes("Salary"), "Breakdown CSV has income category name");

  // ─── 10. Budget Filter ───────────────────────────────────────
  console.log("\n─── 10. Budget Filter (GET /exports/transactions?budgetId=xxx) ───");

  // Create a budget
  const budget = await request(
    "POST",
    "/budgets",
    {
      targetAmount: 500,
      categoryId: testCategoryId,
      startDate: today,
      period: "MONTHLY",
    },
    userTokens?.accessToken
  );
  assert(budget.status === 201, "Budget created");
  const budgetJson = JSON.parse(budget.text);
  const budgetId = budgetJson.data?.budget?.id as string ?? budgetJson.data?.id as string;
  assert(budgetId != null, "Budget has ID");

  // Filter transactions by budgetId
  const exportBudgetTx = await request(
    "GET",
    `/exports/transactions?budgetId=${budgetId}`,
    undefined,
    userTokens?.accessToken
  );
  assert(exportBudgetTx.status === 200, "Export by budget returns 200");
  const budgetLines = exportBudgetTx.text.trim().split("\n");
  // Should only include transactions for the budget's category (Food)
  assert(budgetLines.length === 2, "Budget-filtered CSV has header + 1 transaction");
  assert(exportBudgetTx.text.includes("42.50"), "Budget CSV contains expense 42.50");
  assert(!exportBudgetTx.text.includes("5000.00"), "Budget CSV does not contain income (different category)");
  assert(exportBudgetTx.text.includes("Food"), "Budget CSV contains Food category");

  // Budget filter on reports
  const exportBudgetReport = await request(
    "GET",
    `/exports/reports?type=summary&budgetId=${budgetId}`,
    undefined,
    userTokens?.accessToken
  );
  assert(exportBudgetReport.status === 200, "Export report by budget returns 200");

  // Invalid budgetId returns empty data (no such budget for this user)
  const fakeBudgetExport = await request(
    "GET",
    "/exports/transactions?budgetId=00000000-0000-0000-0000-000000000000",
    undefined,
    userTokens?.accessToken
  );
  assert(fakeBudgetExport.status === 200, "Export with non-existent budget returns 200");
  const fakeBudgetLines = fakeBudgetExport.text.trim().split("\n");
  assert(fakeBudgetLines.length === 3, "Non-existent budget CSV has all transactions (header + 2 rows)");

  // ─── 11. Savings Goal Filter ──────────────────────────────────
  console.log("\n─── 11. Savings Goal Filter (GET /exports/reports?savingsGoalId=xxx) ───");

  // Create a savings goal
  const goal = await request(
    "POST",
    "/savings-goals",
    {
      name: "Emergency Fund",
      targetAmount: 10000,
      deadline: "2027-01-01",
      priority: "HIGH",
    },
    userTokens?.accessToken
  );
  assert(goal.status === 201, "Savings goal created");
  const goalJson = JSON.parse(goal.text);
  const goalId = goalJson.data?.savingsGoal?.id as string ?? goalJson.data?.id as string;
  assert(goalId != null, "Savings goal has ID");

  // Export summary report with savingsGoalId filter
  const exportGoalReport = await request(
    "GET",
    `/exports/reports?type=summary&savingsGoalId=${goalId}`,
    undefined,
    userTokens?.accessToken
  );
  assert(exportGoalReport.status === 200, "Export report with savings goal returns 200");

  // Export breakdown report with savingsGoalId filter
  const exportGoalBreakdown = await request(
    "GET",
    `/exports/reports?type=breakdown&savingsGoalId=${goalId}`,
    undefined,
    userTokens?.accessToken
  );
  assert(exportGoalBreakdown.status === 200, "Export breakdown with savings goal returns 200");

  // Combined budget + savings goal filter
  const exportCombinedFilter = await request(
    "GET",
    `/exports/reports?type=summary&budgetId=${budgetId}&savingsGoalId=${goalId}`,
    undefined,
    userTokens?.accessToken
  );
  assert(exportCombinedFilter.status === 200, "Combined budget+goal filter returns 200");

  // ─── 12. Ownership Scoping ─────────────────────────────────
  console.log("\n─── 12. Ownership Verification ───");

  const register2 = await request("POST", "/auth/register", {
    email: SECOND_USER_EMAIL,
    password: TEST_PASSWORD,
    name: "Second User",
  });
  assert(register2.status === 201, "Second user registered");
  const register2Json = JSON.parse(register2.text);
  secondUserTokens = register2Json.data?.tokens as { accessToken: string; refreshToken: string };

  // Second user's export has no transactions
  const secondExport = await request(
    "GET",
    "/exports/transactions",
    undefined,
    secondUserTokens?.accessToken
  );
  assert(secondExport.status === 200, "Second user export returns 200");
  const secondLines = secondExport.text.trim().split("\n");
  assert(secondLines.length === 1, "Second user CSV has only headers (no data rows)");

  // Second user's summary report has 0 values
  const secondSummary = await request(
    "GET",
    "/exports/reports?type=summary",
    undefined,
    secondUserTokens?.accessToken
  );
  assert(secondSummary.status === 200, "Second user summary returns 200");
  assert(secondSummary.text.includes("0.00"), "Second user summary has zero amounts");

  // Second user's breakdown has empty categories
  const secondBreakdown = await request(
    "GET",
    "/exports/reports?type=breakdown",
    undefined,
    secondUserTokens?.accessToken
  );
  assert(secondBreakdown.status === 200, "Second user breakdown returns 200");
  // Should not contain Food or Salary since second user has no transactions
  assert(!secondBreakdown.text.includes("Food"), "Second user breakdown does not have primary's categories");

  // ─── 13. Validation ────────────────────────────────────────
  console.log("\n─── 13. Validation ───");

  // Invalid date format in transaction export
  const badDate = await request(
    "GET",
    "/exports/transactions?startDate=not-a-date",
    undefined,
    userTokens?.accessToken
  );
  assert(badDate.status === 400, "Invalid date returns 400");

  // Invalid type enum
  const badType = await request(
    "GET",
    "/exports/transactions?type=INVALID",
    undefined,
    userTokens?.accessToken
  );
  assert(badType.status === 400, "Invalid type returns 400");

  // Invalid UUID
  const badUuid = await request(
    "GET",
    "/exports/transactions?categoryId=not-a-uuid",
    undefined,
    userTokens?.accessToken
  );
  assert(badUuid.status === 400, "Invalid UUID returns 400");

  // Invalid report type
  const badReportType = await request(
    "GET",
    "/exports/reports?type=invalid",
    undefined,
    userTokens?.accessToken
  );
  assert(badReportType.status === 400, "Invalid report type returns 400");

  // Missing type param (required for report export)
  const missingType = await request(
    "GET",
    "/exports/reports",
    undefined,
    userTokens?.accessToken
  );
  assert(missingType.status === 400, "Missing report type returns 400");

  // ─── 14. Unauthenticated Access ────────────────────────────
  console.log("\n─── 14. Unauthenticated Access ───");

  const noAuthTx = await request("GET", "/exports/transactions");
  assert(noAuthTx.status === 401, "Export transactions without auth returns 401");

  const noAuthReport = await request("GET", "/exports/reports?type=summary");
  assert(noAuthReport.status === 401, "Export report without auth returns 401");

  // ─── Summary ──────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${"=".repeat(55)}`);
  console.log(`📊 Results: ${passed}/${total} passed, ${failed}/${total} failed`);
  console.log(`${"=".repeat(55)}`);

  if (failed > 0) {
    process.exit(1);
  }
}

// ─── Start Server & Run Tests ────────────────────────────────

async function main() {
  app = createApp();
  server = app.listen(4008, async () => {
    console.log(`🧪 Test server running on port 4008`);
    try {
      await runTests();
    } finally {
      server.close();
      console.log("\n🧪 Test server stopped.\n");
    }
  });
}

main().catch((err) => {
  console.error("❌ Test runner failed:", err);
  server?.close();
  process.exit(1);
});
