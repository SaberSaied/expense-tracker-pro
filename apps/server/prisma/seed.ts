import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../.env") });

import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcrypt";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Clean existing data ──────────────────────────────────
  await prisma.savingsGoal.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ─── Demo User ────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Demo@123456", 10);
  const user = await prisma.user.create({
    data: {
      email: "alex@freelancer.com",
      passwordHash,
      name: "Alex Rivera",
      bio: "Senior Software Consultant",
      currency: "USD",
      language: "en-US",
      dateFormat: "YYYY-MM-DD",
      emailVerified: true,
      notificationPreferences: {
        budgetAlerts: true,
        emailWarnings: true,
        weeklyDigest: false,
      },
    },
  });
  console.log(`✅ Created user: ${user.name} (${user.email})`);

  // ─── Categories ───────────────────────────────────────────
  const systemCategories = [
    { name: "Food & Dining",      icon: "UtensilsCrossed", color: "#F59E0B", isSystem: true },
    { name: "Transportation",     icon: "Car",            color: "#06B6D4", isSystem: true },
    { name: "Housing & Rent",     icon: "Home",           color: "#8B5CF6", isSystem: true },
    { name: "Utilities",          icon: "Zap",            color: "#10B981", isSystem: true },
    { name: "Entertainment",      icon: "Film",           color: "#F43F5E", isSystem: true },
    { name: "Healthcare",         icon: "Heart",          color: "#EC4899", isSystem: true },
    { name: "Shopping",           icon: "ShoppingBag",    color: "#F97316", isSystem: true },
    { name: "Education",          icon: "BookOpen",       color: "#A855F7", isSystem: true },
    { name: "Travel",             icon: "Plane",          color: "#14B8A6", isSystem: true },
    { name: "Personal Care",      icon: "Sparkles",       color: "#E879F9", isSystem: true },
    { name: "Groceries",          icon: "Apple",          color: "#22C55E", isSystem: true },
    { name: "Subscriptions",      icon: "Repeat",         color: "#3B82F6", isSystem: true },
    { name: "Insurance",          icon: "Shield",         color: "#64748B", isSystem: true },
    { name: "Savings & Investments", icon: "TrendingUp",  color: "#10B981", isSystem: true },
    { name: "Income",             icon: "Briefcase",      color: "#22C55E", isSystem: true },
    { name: "Other",              icon: "MoreHorizontal", color: "#94A3B8", isSystem: true },
  ];

  const categories: Record<string, string> = {};
  for (const cat of systemCategories) {
    const created = await prisma.category.create({
      data: { ...cat, userId: user.id },
    });
    categories[cat.name] = created.id;
  }

  // Custom categories
  const customCat1 = await prisma.category.create({
    data: { name: "SaaS Subscriptions", icon: "Cloud", color: "#6366F1", isSystem: false, userId: user.id },
  });
  const customCat2 = await prisma.category.create({
    data: { name: "Client Dinners", icon: "Wine", color: "#D946EF", isSystem: false, userId: user.id },
  });
  categories["SaaS Subscriptions"] = customCat1.id;
  categories["Client Dinners"] = customCat2.id;

  console.log(`✅ Created ${systemCategories.length + 2} categories`);

  // ─── Payment Methods ──────────────────────────────────────
  const pmCredit = await prisma.paymentMethod.create({
    data: { type: "CREDIT_CARD", name: "Chase Sapphire", isDefault: true, lastFour: "4523", userId: user.id },
  });
  const pmDebit = await prisma.paymentMethod.create({
    data: { type: "DEBIT_CARD", name: "Bank of America Checking", isDefault: false, lastFour: "7890", userId: user.id },
  });
  const pmBank = await prisma.paymentMethod.create({
    data: { type: "BANK_TRANSFER", name: "Wells Fargo Savings", isDefault: false, userId: user.id },
  });
  const pmCash = await prisma.paymentMethod.create({
    data: { type: "CASH", name: "Cash Wallet", isDefault: false, userId: user.id },
  });
  console.log("✅ Created 4 payment methods");

  // ─── Transactions ─────────────────────────────────────────
  const txData = [
    { amount: 1500.00, description: "Monthly Rent — Apartment",             date: new Date("2026-07-01"), categoryId: categories["Housing & Rent"],     paymentMethodId: pmBank.id,   type: "EXPENSE" as const },
    { amount: 142.50,  description: "Whole Foods Market",                   date: new Date("2026-07-27"), categoryId: categories["Food & Dining"],      paymentMethodId: pmCredit.id, type: "EXPENSE" as const, notes: "Weekly grocery run" },
    { amount: 24.00,   description: "Uber Ride — Downtown",                 date: new Date("2026-07-26"), categoryId: categories["Transportation"],     paymentMethodId: pmDebit.id,  type: "EXPENSE" as const },
    { amount: 89.99,   description: "Electric Power Bill",                  date: new Date("2026-07-15"), categoryId: categories["Utilities"],          paymentMethodId: pmBank.id,   type: "EXPENSE" as const },
    { amount: 45.00,   description: "Netflix + Spotify Combo",              date: new Date("2026-07-20"), categoryId: categories["Entertainment"],      paymentMethodId: pmCredit.id, type: "EXPENSE" as const },
    { amount: 65.00,   description: "Starbucks — Team Coffee",              date: new Date("2026-07-25"), categoryId: categories["Food & Dining"],      paymentMethodId: pmCredit.id, type: "EXPENSE" as const, notes: "Friday office treat" },
    { amount: 35.50,   description: "Gas Station Fill-Up",                  date: new Date("2026-07-22"), categoryId: categories["Transportation"],     paymentMethodId: pmDebit.id,  type: "EXPENSE" as const },
    { amount: 14.99,   description: "GitHub Pro Plan",                      date: new Date("2026-07-01"), categoryId: categories["SaaS Subscriptions"],  paymentMethodId: pmCredit.id, type: "EXPENSE" as const },
    { amount: 220.00,  description: "Water + Internet Bundle",              date: new Date("2026-07-10"), categoryId: categories["Utilities"],          paymentMethodId: pmBank.id,   type: "EXPENSE" as const },
    { amount: 78.00,   description: "Dental Checkup Co-pay",                date: new Date("2026-07-18"), categoryId: categories["Healthcare"],         paymentMethodId: pmDebit.id,  type: "EXPENSE" as const },
    { amount: 55.00,   description: "Italian Restaurant — Client Meet",     date: new Date("2026-07-24"), categoryId: categories["Client Dinners"],     paymentMethodId: pmCredit.id, type: "EXPENSE" as const, notes: "Prospect meeting dinner" },
    { amount: 150.52,  description: "Costco Bulk Groceries",                date: new Date("2026-07-20"), categoryId: categories["Groceries"],          paymentMethodId: pmCredit.id, type: "EXPENSE" as const },
    { amount: 5200.00, description: "Freelance Project — Q3 Website Build", date: new Date("2026-07-15"), categoryId: categories["Income"],             paymentMethodId: pmBank.id,   type: "INCOME" as const },
    { amount: 200.00,  description: "Transfer to Savings",                  date: new Date("2026-07-16"), categoryId: categories["Savings & Investments"], paymentMethodId: pmBank.id, type: "TRANSFER" as const },
  ];

  for (const tx of txData) {
    await prisma.transaction.create({
      data: {
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        date: tx.date,
        notes: tx.notes ?? null,
        categoryId: tx.categoryId,
        paymentMethodId: tx.paymentMethodId,
        userId: user.id,
      },
    });
  }
  console.log(`✅ Created ${txData.length} transactions`);

  // ─── Budgets ──────────────────────────────────────────────
  const budgets = [
    { targetAmount: 1000, categoryId: categories["Food & Dining"],         startDate: new Date("2026-07-01") },
    { targetAmount: 600,  categoryId: categories["Transportation"],        startDate: new Date("2026-07-01") },
    { targetAmount: 1500, categoryId: categories["Housing & Rent"],        startDate: new Date("2026-07-01"), alertThreshold: 90 },
    { targetAmount: 400,  categoryId: categories["Utilities"],             startDate: new Date("2026-07-01") },
    { targetAmount: 300,  categoryId: categories["Entertainment"],         startDate: new Date("2026-07-01") },
    { targetAmount: 500,  categoryId: categories["Healthcare"],            startDate: new Date("2026-07-01") },
    { targetAmount: 200,  categoryId: categories["SaaS Subscriptions"],    startDate: new Date("2026-07-01") },
    { targetAmount: 300,  categoryId: categories["Client Dinners"],        startDate: new Date("2026-07-01") },
  ];

  for (const b of budgets) {
    await prisma.budget.create({
      data: {
        targetAmount: b.targetAmount,
        alertThreshold: b.alertThreshold ?? 80,
        period: "MONTHLY",
        startDate: b.startDate,
        categoryId: b.categoryId,
        userId: user.id,
      },
    });
  }
  console.log(`✅ Created ${budgets.length} budgets`);

  // ─── Savings Goals ────────────────────────────────────────
  const goals = [
    { name: "Emergency Fund",       targetAmount: 10000, currentAmount: 3200, deadline: new Date("2027-06-30"), icon: "Shield",        color: "#10B981" },
    { name: "New Laptop",           targetAmount: 2500,  currentAmount: 1200, deadline: new Date("2026-12-31"), icon: "Laptop",        color: "#6366F1" },
    { name: "Summer Vacation 2027", targetAmount: 4000,  currentAmount: 800,  deadline: new Date("2027-05-31"), icon: "Palmtree",      color: "#06B6D4" },
  ];

  for (const g of goals) {
    await prisma.savingsGoal.create({
      data: { ...g, userId: user.id },
    });
  }
  console.log(`✅ Created ${goals.length} savings goals`);

  // ─── Notifications ────────────────────────────────────────
  const notifications = [
    { type: "BUDGET_WARNING" as const,  title: "Budget Alert",           message: "You've used 82% of your Food & Dining budget for July.",     read: false },
    { type: "BUDGET_CRITICAL" as const, title: "Budget Critical",        message: "You've exceeded 100% of your Housing & Rent budget for July.", read: true },
    { type: "EXPORT_COMPLETE" as const, title: "Export Ready",           message: "Your CSV export of June transactions is ready to download.",   read: true },
    { type: "WEEKLY_DIGEST" as const,   title: "Weekly Digest",          message: "You spent $1,245 this week — 12% more than last week.",        read: false },
  ];

  for (const n of notifications) {
    await prisma.notification.create({
      data: { ...n, userId: user.id },
    });
  }
  console.log(`✅ Created ${notifications.length} notifications`);

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
