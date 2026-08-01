import { Router } from "express";
import { authLimiter } from "@/config/rate-limit";
import { authRoutes } from "@/modules/auth/auth.routes";
import { userRoutes } from "@/modules/users/users.routes";
import { categoryRoutes } from "@/modules/categories/categories.routes";
import { transactionRoutes } from "@/modules/transactions/transactions.routes";
import { budgetRoutes } from "@/modules/budgets/budgets.routes";
import { paymentMethodRoutes } from "@/modules/payment-methods/payment-methods.routes";
import { savingsGoalRoutes } from "@/modules/savings-goals/savings-goals.routes";
import { reportRoutes } from "@/modules/reports/reports.routes";
import { dashboardRoutes } from "@/modules/dashboard/dashboard.routes";
import { notificationRoutes } from "@/modules/notifications/notifications.routes";
import { exportRoutes } from "@/modules/exports/exports.routes";
import { searchRoutes } from "@/modules/search/search.routes";
import { reminderRoutes } from "@/modules/reminders/reminders.routes";
import { jobsRoutes } from "@/modules/jobs/jobs.routes";

const router: Router = Router();

// Stricter rate limit for auth endpoints (brute-force protection).
router.use("/auth", authLimiter, authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/budgets", budgetRoutes);
router.use("/payment-methods", paymentMethodRoutes);
router.use("/savings-goals", savingsGoalRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);
router.use("/exports", exportRoutes);

// ─── Global Search ───────────────────────────────────────────
router.use("/search", searchRoutes);

// ─── Recurring Reminders ──────────────────────────────────────
router.use("/reminders", reminderRoutes);

// ─── Background Jobs ──────────────────────────────────────────
router.use("/jobs", jobsRoutes);

export { router as routes };
