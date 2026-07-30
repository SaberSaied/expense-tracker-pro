/**
 * Budgets Module — Full API Integration Tests
 *
 * Tests: create budget, list budgets, get budget details, update budget,
 *        delete budget, progress calculations, overspending detection,
 *        budget alerts, insights accuracy.
 *
 * Run: npx tsx src/modules/budgets/budgets.test.ts
 *
 * Prerequisites: PostgreSQL running, migrations applied
 */

import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env before any imports that read it
config({ path: resolve(__dirname, "../../../../.env") });

// Override port for test isolation
process.env.PORT = "4004";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-for-budgets-integration-tests";
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
let server: Server;
let app: Application;

const BASE = "http://localhost:4004/api/v1";
const TEST_EMAIL = `bud-test-${Date.now()}@example.com`;
const TEST_PASSWORD = "Test@123456";
const SECOND_USER_EMAIL = `bud-test-2-${Date.now()}@example.com`;

interface ApiResult {
  success: boolean;
  data?: Record<string, unknown>;
  message?: string;
  error?: string;
  statusCode?: number;
  details?: Record<string, string[]>;
}

async function request(
  method: string,
  path: string,
  body?: unknown,
  token?: string | null
): Promise<{ status: number; json: ApiResult }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const status = response.status;
  let json: ApiResult = { success: false };
  try {
    json = (await response.json()) as ApiResult;
  } catch {
    json = { success: false };
  }

  return { status, json };
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

async function getFirstCategoryId(token: string): Promise<string> {
  const res = await request("GET", "/categories", undefined, token);
  const cats = res.json.data?.categories as Array<Record<string, unknown>> | undefined;
  return (cats?.[0]?.id as string) ?? "";
}

async function getSecondCategoryId(token: string): Promise<string> {
  const res = await request("GET", "/categories", undefined, token);
  const cats = res.json.data?.categories as Array<Record<string, unknown>> | undefined;
  return (cats?.[1]?.id as string) ?? "";
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Tests ────────────────────────────────────────────────────

async function runTests() {
  console.log("\n🧪 Budgets Module — API Integration Tests\n");
  console.log(`Test user: ${TEST_EMAIL}\n`);

  // ─── 0. Health Check ───────────────────────────────────────
  console.log("─── 0. Health Check ───");
  const health = await request("GET", "/health");
  assert(health.status === 200, "Health endpoint returns 200");
  assert(health.json.success === true, "Health response success=true");

  // ─── 1. Register Primary User ──────────────────────────────
  console.log("\n─── 1. Register Primary User ───");
  const register = await request("POST", "/auth/register", {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    name: "Budget Tester",
  });
  assert(register.status === 201, "Register returns 201");
  assert(register.json.data?.user != null, "Register returns user");
  assert(register.json.data?.tokens != null, "Register returns tokens");
  userTokens = register.json.data?.tokens as { accessToken: string; refreshToken: string };

  // ─── 2. Create Budget ──────────────────────────────────────
  console.log("\n─── 2. Create Budget (POST /budgets) ───");
  const catId1 = await getFirstCategoryId(userTokens!.accessToken);
  assert(catId1.length > 0, "Got first category ID");

  const budgetData = {
    targetAmount: 500,
    alertThreshold: 80,
    period: "MONTHLY",
    startDate: todayStr(),
    categoryId: catId1,
  };

  const created = await request("POST", "/budgets", budgetData, userTokens?.accessToken);
  assert(created.status === 201, "Create budget returns 201");
  assert(created.json.success === true, "Create budget success=true");
  const createdBudget = created.json.data?.budget as Record<string, unknown> | undefined;
  assert(createdBudget != null, "Created budget returned");
  assert(createdBudget!.targetAmount === 500, "Budget targetAmount matches");
  assert(createdBudget!.period === "MONTHLY", "Budget period matches");
  assert(createdBudget!.category != null, "Budget includes category");
  const budgetId = createdBudget!.id as string;
  assert(budgetId != null, "Budget has an ID");

  // ─── 3. Duplicate Budget Prevention ────────────────────────
  console.log("\n─── 3. Duplicate Budget Prevention ───");
  const duplicate = await request("POST", "/budgets", budgetData, userTokens?.accessToken);
  assert(duplicate.status === 409, "Duplicate budget returns 409");
  assert(duplicate.json.success === false, "Duplicate budget rejected");

  // ─── 4. Get All Budgets ────────────────────────────────────
  console.log("\n─── 4. Get All Budgets (GET /budgets) ───");
  const list = await request("GET", "/budgets", undefined, userTokens?.accessToken);
  assert(list.status === 200, "List budgets returns 200");
  assert(list.json.success === true, "List budgets success=true");
  const budgets = list.json.data?.budgets as Array<Record<string, unknown>> | undefined;
  assert(budgets != null, "Budgets array exists");
  assert(budgets!.length >= 1, "At least 1 budget exists");
  assert(budgets![0].category != null, "Budget includes category info");

  // ─── 5. Filter Budgets by Period ───────────────────────────
  console.log("\n─── 5. Filter Budgets (GET /budgets?period=MONTHLY) ───");
  const filtered = await request(
    "GET",
    "/budgets?period=MONTHLY",
    undefined,
    userTokens?.accessToken
  );
  assert(filtered.status === 200, "Filtered budgets returns 200");
  const monthBudgets = filtered.json.data?.budgets as Array<Record<string, unknown>> | undefined;
  assert(monthBudgets!.length >= 1, "Filtered budgets include monthly budgets");

  // ─── 6. Get Budget Details ─────────────────────────────────
  console.log("\n─── 6. Get Budget Details (GET /budgets/:id) ───");
  const byId = await request(
    "GET",
    `/budgets/${budgetId}`,
    undefined,
    userTokens?.accessToken
  );
  assert(byId.status === 200, "Get budget by ID returns 200");
  assert(byId.json.success === true, "Get budget success=true");
  const fetched = byId.json.data?.budget as Record<string, unknown> | undefined;
  assert(fetched != null, "Budget returned");
  assert(fetched!.id === budgetId, "Budget ID matches");
  assert(fetched!.category != null, "Budget includes category");
  assert(fetched!.spent !== undefined, "Budget includes spent amount");
  assert(fetched!.remaining !== undefined, "Budget includes remaining amount");
  assert(fetched!.progress !== undefined, "Budget includes progress percentage");
  assert(fetched!.isActive !== undefined, "Budget includes active status");
  assert(fetched!.daysRemaining !== undefined, "Budget includes days remaining");

  // ─── 7. Update Budget ──────────────────────────────────────
  console.log("\n─── 7. Update Budget (PATCH /budgets/:id) ───");
  const updated = await request(
    "PATCH",
    `/budgets/${budgetId}`,
    { targetAmount: 750, alertThreshold: 85 },
    userTokens?.accessToken
  );
  assert(updated.status === 200, "Update budget returns 200");
  assert(updated.json.success === true, "Update budget success=true");
  const updatedBudget = updated.json.data?.budget as Record<string, unknown> | undefined;
  assert(updatedBudget != null, "Updated budget returned");
  assert(updatedBudget!.targetAmount === 750, "Target amount updated to 750");
  assert(updatedBudget!.alertThreshold === 85, "Alert threshold updated to 85");
  assert(updatedBudget!.spent !== undefined, "Updated budget includes progress data");

  // Update category
  const catId2 = await getSecondCategoryId(userTokens!.accessToken);
  const catUpdated = await request(
    "PATCH",
    `/budgets/${budgetId}`,
    { categoryId: catId2 },
    userTokens?.accessToken
  );
  assert(catUpdated.status === 200, "Update category returns 200");
  const catUpdatedBudget = catUpdated.json.data?.budget as Record<string, unknown> | undefined;
  assert(catUpdatedBudget!.category?.id === catId2, "Category updated");

  // Partial update — period only
  const periodUpdated = await request(
    "PATCH",
    `/budgets/${budgetId}`,
    { period: "WEEKLY" },
    userTokens?.accessToken
  );
  assert(periodUpdated.status === 200, "Partial period update returns 200");
  const periodBudget = periodUpdated.json.data?.budget as Record<string, unknown> | undefined;
  assert(periodBudget!.period === "WEEKLY", "Period updated to WEEKLY");
  assert(periodBudget!.targetAmount === 750, "Target amount unchanged after partial update");

  // ─── 8. Budget Progress (GET /budgets/:id/progress) ────────
  console.log("\n─── 8. Budget Progress (GET /budgets/:id/progress) ───");
  const progress = await request(
    "GET",
    `/budgets/${budgetId}/progress`,
    undefined,
    userTokens?.accessToken
  );
  assert(progress.status === 200, "Progress endpoint returns 200");
  assert(progress.json.success === true, "Progress success=true");
  const progBudget = progress.json.data?.budget as Record<string, unknown> | undefined;
  assert(progBudget != null, "Progress budget returned");
  assert(progBudget!.spent !== undefined, "Progress includes spent");
  assert(progBudget!.remaining !== undefined, "Progress includes remaining");
  assert(progBudget!.progress !== undefined, "Progress includes percentage");
  assert(progBudget!.daysRemaining !== undefined, "Progress includes days remaining");
  assert(progBudget!.totalDays !== undefined, "Progress includes total days");
  assert(progBudget!.daysElapsed !== undefined, "Progress includes days elapsed");
  assert(progBudget!.isActive !== undefined, "Progress includes active status");
  assert(progBudget!.isOverBudget !== undefined, "Progress includes over budget flag");
  assert(progBudget!.isAlertTriggered !== undefined, "Progress includes alert flag");

  // ─── 9. Progress Summary (GET /budgets/progress/summary) ───
  console.log("\n─── 9. Progress Summary (GET /budgets/progress/summary) ───");
  const summary = await request(
    "GET",
    "/budgets/progress/summary",
    undefined,
    userTokens?.accessToken
  );
  assert(summary.status === 200, "Progress summary returns 200");
  assert(summary.json.success === true, "Progress summary success=true");
  const summaryData = summary.json.data as Record<string, unknown> | undefined;
  assert(summaryData!.totalBudgets >= 1, "Summary includes total budget count");
  assert(summaryData!.totalBudgeted !== undefined, "Summary includes total budgeted");
  assert(summaryData!.totalSpent !== undefined, "Summary includes total spent");
  assert(summaryData!.overallProgress !== undefined, "Summary includes overall progress");
  const summaryBudgets = summaryData!.budgets as Array<Record<string, unknown>> | undefined;
  assert(summaryBudgets!.length >= 1, "Summary includes individual budget data");

  // ─── 10. Overspending Detection (GET /budgets/alerts) ──────
  console.log("\n─── 10. Overspending Detection (GET /budgets/alerts) ───");
  const alerts = await request("GET", "/budgets/alerts", undefined, userTokens?.accessToken);
  assert(alerts.status === 200, "Alerts endpoint returns 200");
  assert(alerts.json.success === true, "Alerts success=true");
  // @ts-expect-error - Runtime type guaranteed for test assertions
  const alertsData = alerts.json.data;
  // @ts-expect-error - Dynamic access for test assertions
  assert((alertsData as any)?.alerts !== undefined, "Alerts includes alerts array");
  // @ts-expect-error - Dynamic access for test assertions
  assert((alertsData as any)?.summary !== undefined, "Alerts includes summary");
  // @ts-expect-error - Dynamic access for test assertions
  const alertSummary = (alertsData as any)?.summary;
  assert(alertSummary?.totalBudgets >= 1, "Alert summary includes total budgets");

  // ─── 11. Insights (GET /budgets/insights) ──────────────────
  console.log("\n─── 11. Insights (GET /budgets/insights) ───");
  const insights = await request(
    "GET",
    "/budgets/insights",
    undefined,
    userTokens?.accessToken
  );
  assert(insights.status === 200, "Insights endpoint returns 200");
  assert(insights.json.success === true, "Insights success=true");
  const insightData = insights.json.data as Record<string, unknown> | undefined;
  assert(insightData!.highestSpending != null, "Insights includes highest spending");
  assert(insightData!.lowestSpending != null, "Insights includes lowest spending");
  assert(insightData!.closestToLimit != null, "Insights includes closest to limit");
  assert(insightData!.overall != null, "Insights includes overall stats");
  const overall = insightData!.overall as Record<string, number>;
  assert(overall.totalBudgeted! >= 0, "Overall includes total budgeted");
  assert(overall.utilizationRate! >= 0, "Overall includes utilization rate");
  assert(overall.budgetCount! >= 1, "Overall includes budget count");

  // ─── 12. Ownership Verification ────────────────────────────
  console.log("\n─── 12. Ownership Verification ───");

  // Register a second user
  const register2 = await request("POST", "/auth/register", {
    email: SECOND_USER_EMAIL,
    password: TEST_PASSWORD,
    name: "Second User",
  });
  assert(register2.status === 201, "Second user registered");
  secondUserTokens = register2.json.data?.tokens as { accessToken: string; refreshToken: string };

  // Second user cannot see primary user's budgets
  const secondList = await request(
    "GET",
    "/budgets",
    undefined,
    secondUserTokens?.accessToken
  );
  assert(secondList.status === 200, "Second user list returns 200");
  const secondBuds = secondList.json.data?.budgets as Array<Record<string, unknown>> | undefined;
  // @ts-expect-error - Runtime type guaranteed for test assertions
  const hasPrimaryBudget = secondBuds!.some((b: any) => b.id === budgetId);
  assert(!hasPrimaryBudget, "Second user cannot see primary user's budgets");

  // Second user cannot get primary user's budget by ID
  const forbiddenGet = await request(
    "GET",
    `/budgets/${budgetId}`,
    undefined,
    secondUserTokens?.accessToken
  );
  assert(forbiddenGet.status === 404, "Second user gets 404 on primary's budget");

  // Second user cannot update primary user's budget
  const forbiddenUpdate = await request(
    "PATCH",
    `/budgets/${budgetId}`,
    { targetAmount: 999 },
    secondUserTokens?.accessToken
  );
  assert(forbiddenUpdate.status === 404, "Second user gets 404 on update");

  // ─── 13. Validation ────────────────────────────────────────
  console.log("\n─── 13. Validation ───");

  // Missing required fields
  const missingFields = await request(
    "POST",
    "/budgets",
    { targetAmount: 100 },
    userTokens?.accessToken
  );
  assert(missingFields.status === 400, "Missing fields returns 400");

  // Invalid target amount
  const negativeAmount = await request(
    "POST",
    "/budgets",
    { targetAmount: -50, startDate: todayStr(), categoryId: catId1 },
    userTokens?.accessToken
  );
  assert(negativeAmount.status === 400, "Negative target amount returns 400");

  // Invalid period
  const invalidPeriod = await request(
    "POST",
    "/budgets",
    { targetAmount: 100, period: "BIWEEKLY", startDate: todayStr(), categoryId: catId1 },
    userTokens?.accessToken
  );
  assert(invalidPeriod.status === 400, "Invalid period returns 400");

  // Invalid UUID for categoryId
  const invalidCategory = await request(
    "POST",
    "/budgets",
    { targetAmount: 100, startDate: todayStr(), categoryId: "not-a-uuid" },
    userTokens?.accessToken
  );
  assert(invalidCategory.status === 400, "Invalid category ID returns 400");

  // ─── 14. Delete Budget ─────────────────────────────────────
  console.log("\n─── 14. Delete Budget (DELETE /budgets/:id) ───");
  const deleted = await request(
    "DELETE",
    `/budgets/${budgetId}`,
    undefined,
    userTokens?.accessToken
  );
  assert(deleted.status === 204, "Delete budget returns 204 No Content");

  // Verify it's gone
  const gone = await request(
    "GET",
    `/budgets/${budgetId}`,
    undefined,
    userTokens?.accessToken
  );
  assert(gone.status === 404, "Deleted budget returns 404");

  // Delete non-existent budget
  const deleteGone = await request(
    "DELETE",
    `/budgets/${budgetId}`,
    undefined,
    userTokens?.accessToken
  );
  assert(deleteGone.status === 404, "Delete non-existent returns 404");

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
  server = app.listen(4004, async () => {
    console.log(`🧪 Test server running on port 4004`);
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
