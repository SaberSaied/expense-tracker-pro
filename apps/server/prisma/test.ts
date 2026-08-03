/**
 * Database model validation tests.
 * Tests CRUD operations, relationships, cascade rules, and indexes
 * against the seeded database.
 */
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../.env") });

import bcrypt from "bcrypt";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    failed++;
  }
}

async function main() {
  console.log("🧪 Running database validation tests...\n");

  // ─── 1. CRUD: User ────────────────────────────────────────
  console.log("─── User CRUD ───");

  const user = await prisma.user.findFirst({ where: { email: "alex@freelancer.com" } });
  assert(user !== null, "Find user by email");
  assert(user!.name === "Alex Rivera", "User has correct name");
  assert(user!.emailVerified === true, "User email is verified");

  const updated = await prisma.user.update({
    where: { id: user!.id },
    data: { name: "Alex R." },
  });
  assert(updated.name === "Alex R.", "Update user name");

  // Restore name
  await prisma.user.update({
    where: { id: user!.id },
    data: { name: "Alex Rivera" },
  });

  // ─── 2. CRUD: Category ────────────────────────────────────
  console.log("\n─── Category CRUD ───");

  const categories = await prisma.category.findMany({ where: { userId: user!.id } });
  assert(categories.length >= 16, `Found ${categories.length} system categories`);

  const foodCat = categories.find((c) => c.name === "Food & Dining");
  assert(foodCat !== undefined, "Food & Dining category exists");
  assert(foodCat!.isSystem === true, "Food & Dining is a system category");
  assert(foodCat!.icon === "UtensilsCrossed", "Category has correct icon");
  assert(foodCat!.color === "#F59E0B", "Category has correct color");

  // ─── 3. CRUD: Payment Method ──────────────────────────────
  console.log("\n─── Payment Method CRUD ───");

  const pm = await prisma.paymentMethod.findFirst({ where: { userId: user!.id, isDefault: true } });
  assert(pm !== null, "Default payment method exists");
  assert(pm!.type === "CREDIT_CARD", "Default payment method is CREDIT_CARD");
  assert(pm!.lastFour === "4523", "Payment method has lastFour");

  // ─── 4. CRUD: Transaction ─────────────────────────────────
  console.log("\n─── Transaction CRUD ───");

  const transactions = await prisma.transaction.findMany({
    where: { userId: user!.id },
    orderBy: { date: "desc" },
  });
  assert(transactions.length >= 14, `Found ${transactions.length} transactions`);

  const incomeTx = transactions.find((t) => t.type === "INCOME");
  assert(incomeTx !== undefined, "Income transaction exists");
  assert(incomeTx!.amount === 5200, `Income amount is ${incomeTx!.amount}`);

  const expenseTx = transactions.filter((t) => t.type === "EXPENSE");
  assert(expenseTx.length >= 12, `Found ${expenseTx.length} expense transactions`);

  const transferTx = transactions.find((t) => t.type === "TRANSFER");
  assert(transferTx !== undefined, "Transfer transaction exists");

  // Test date index - query by userId + date range
  const julyTransactions = await prisma.transaction.findMany({
    where: {
      userId: user!.id,
      date: { gte: new Date("2026-07-01"), lte: new Date("2026-07-31") },
    },
    orderBy: { date: "asc" },
  });
  assert(julyTransactions.length >= 14, "Date range query returns transactions");

  // ─── 5. CRUD: Budget ──────────────────────────────────────
  console.log("\n─── Budget CRUD ───");

  const budgets = await prisma.budget.findMany({ where: { userId: user!.id } });
  assert(budgets.length >= 8, `Found ${budgets.length} budgets`);

  const foodBudget = budgets.find((b) => b.categoryId === foodCat!.id);
  assert(foodBudget !== undefined, "Food & Dining budget exists");
  assert(foodBudget!.targetAmount === 1000, "Food & Dining budget target is 1000");
  assert(foodBudget!.period === "MONTHLY", "Budget period is MONTHLY");

  // ─── 6. CRUD: Savings Goal ────────────────────────────────
  console.log("\n─── Savings Goal CRUD ───");

  const goals = await prisma.savingsGoal.findMany({ where: { userId: user!.id } });
  assert(goals.length >= 3, `Found ${goals.length} savings goals`);

  const emergencyFund = goals.find((g) => g.name === "Emergency Fund");
  assert(emergencyFund !== undefined, "Emergency Fund goal exists");
  assert(emergencyFund!.targetAmount === 10000, "Emergency Fund target is 10000");
  assert(emergencyFund!.currentAmount === 3200, "Emergency Fund current amount is 3200");

  // ─── 7. CRUD: Notification ────────────────────────────────
  console.log("\n─── Notification CRUD ───");

  const notifications = await prisma.notification.findMany({ where: { userId: user!.id } });
  assert(notifications.length >= 4, `Found ${notifications.length} notifications`);

  const unread = notifications.filter((n) => !n.read);
  assert(unread.length >= 2, `Found ${unread.length} unread notifications`);

  // ─── 8. Relationships ─────────────────────────────────────
  console.log("\n─── Relationships ───");

  // User → Transactions
  const userTxs = await prisma.user.findUnique({
    where: { id: user!.id },
    include: { transactions: true },
  });
  assert(userTxs!.transactions.length >= 14, "User has related transactions");

  // User → Categories
  const userCats = await prisma.user.findUnique({
    where: { id: user!.id },
    include: { categories: true },
  });
  assert(userCats!.categories.length >= 16, "User has related categories");

  // Transaction → Category
  const firstTx = transactions[0];
  const txWithCat = await prisma.transaction.findUnique({
    where: { id: firstTx.id },
    include: { category: true },
  });
  assert(txWithCat!.category !== null, "Transaction has related category");

  // Transaction → PaymentMethod
  const txWithPM = await prisma.transaction.findFirst({
    where: { paymentMethodId: { not: null } },
    include: { paymentMethod: true },
  });
  assert(txWithPM !== null, "Transaction with payment method found");
  assert(txWithPM!.paymentMethod !== null, "Transaction has related payment method");

  // Budget → Category
  const budgetWithCat = await prisma.budget.findFirst({
    where: { userId: user!.id },
    include: { category: true },
  });
  assert(budgetWithCat!.category !== null, "Budget has related category");

  // Notification → User
  const notifWithUser = await prisma.notification.findFirst({
    where: { userId: user!.id },
    include: { user: true },
  });
  assert(notifWithUser!.user.id === user!.id, "Notification has related user");

  // SavingsGoal → User
  const goalWithUser = await prisma.savingsGoal.findFirst({
    where: { userId: user!.id },
    include: { user: true },
  });
  assert(goalWithUser!.user.id === user!.id, "SavingsGoal has related user");

  // ─── 9. Cascade Delete ────────────────────────────────────
  console.log("\n─── Cascade Rules ───");

  // Create a temp user with data across all models to test cascade
  const tempPw = await bcrypt.hash("Test@123456", 10);
  const tempUser = await prisma.user.create({
    data: {
      email: `temp-${Date.now()}@delete.me`,
      passwordHash: tempPw,
      name: "Temp User",
    },
  });

  const tempCat = await prisma.category.create({
    data: { name: "Temp Category", userId: tempUser.id },
  });

  await prisma.transaction.create({
    data: {
      type: "EXPENSE",
      amount: 10,
      description: "Temp transaction",
      date: new Date(),
      categoryId: tempCat.id,
      userId: tempUser.id,
    },
  });

  await prisma.paymentMethod.create({
    data: { type: "CASH", name: "Temp Wallet", userId: tempUser.id },
  });

  await prisma.budget.create({
    data: {
      targetAmount: 100,
      startDate: new Date("2026-07-01"),
      categoryId: tempCat.id,
      userId: tempUser.id,
    },
  });

  await prisma.notification.create({
    data: { type: "WEEKLY_DIGEST", title: "Test", message: "Test", userId: tempUser.id },
  });

  await prisma.savingsGoal.create({
    data: { name: "Test Goal", targetAmount: 100, userId: tempUser.id },
  });

  // Delete the user - should cascade to all owned data
  await prisma.user.delete({ where: { id: tempUser.id } });

  const orphanTransactions = await prisma.transaction.count({ where: { userId: tempUser.id } });
  assert(orphanTransactions === 0, "Cascade: transactions deleted with user");

  const orphanCategories = await prisma.category.count({ where: { userId: tempUser.id } });
  assert(orphanCategories === 0, "Cascade: categories deleted with user");

  const orphanPMs = await prisma.paymentMethod.count({ where: { userId: tempUser.id } });
  assert(orphanPMs === 0, "Cascade: payment methods deleted with user");

  const orphanBudgets = await prisma.budget.count({ where: { userId: tempUser.id } });
  assert(orphanBudgets === 0, "Cascade: budgets deleted with user");

  const orphanNotifications = await prisma.notification.count({ where: { userId: tempUser.id } });
  assert(orphanNotifications === 0, "Cascade: notifications deleted with user");

  const orphanGoals = await prisma.savingsGoal.count({ where: { userId: tempUser.id } });
  assert(orphanGoals === 0, "Cascade: savings goals deleted with user");

  // ─── 10. Unique Constraints ────────────────────────────────
  console.log("\n─── Unique Constraints ───");

  // Duplicate email
  try {
    await prisma.user.create({
      data: { email: "alex@freelancer.com", passwordHash: "dummy" },
    });
    assert(false, "Unique: duplicate email rejected");
  } catch {
    assert(true, "Unique: duplicate email rejected");
  }

  // Duplicate category name per user
  try {
    await prisma.category.create({
      data: { name: "Food & Dining", userId: user!.id },
    });
    assert(false, "Unique: duplicate category name rejected");
  } catch {
    assert(true, "Unique: duplicate category name rejected");
  }

  // Duplicate budget per category per period
  try {
    await prisma.budget.create({
      data: {
        targetAmount: 100,
        startDate: new Date("2026-07-01"),
        categoryId: foodCat!.id,
        userId: user!.id,
      },
    });
    assert(false, "Unique: duplicate budget rejected");
  } catch {
    assert(true, "Unique: duplicate budget rejected");
  }

  // ─── 11. Index Usage ──────────────────────────────────────
  console.log("\n─── Indexes ───");

  const userTxsByDate = await prisma.transaction.findMany({
    where: { userId: user!.id },
    orderBy: { date: "desc" },
    take: 5,
  });
  assert(userTxsByDate.length > 0, "Index [userId, date]: user transactions sorted by date");

  const userTxsByCat = await prisma.transaction.findMany({
    where: { userId: user!.id, categoryId: foodCat!.id },
    take: 5,
  });
  assert(
    userTxsByCat.length > 0,
    "Index [userId, categoryId]: user transactions filtered by category",
  );

  const unreadNotifs = await prisma.notification.findMany({
    where: { userId: user!.id, read: false },
  });
  assert(unreadNotifs.length > 0, "Index [userId, read]: unread notifications");

  const userBudgets = await prisma.budget.findMany({
    where: { userId: user!.id },
    orderBy: { startDate: "desc" },
  });
  assert(userBudgets.length > 0, "Index [userId, startDate]: user budgets by period");

  // ─── Summary ──────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 Results: ${passed}/${total} passed, ${failed}/${total} failed`);
  console.log(`${"=".repeat(50)}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Test failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
