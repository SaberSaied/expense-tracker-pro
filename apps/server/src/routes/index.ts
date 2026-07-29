import { Router } from "express";
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

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/budgets", budgetRoutes);
router.use("/payment-methods", paymentMethodRoutes);
router.use("/savings-goals", savingsGoalRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);

export { router as routes };
