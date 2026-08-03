/**
 * Page view barrel exports for router integration.
 */
export {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "./auth";
export { DashboardPage } from "./dashboard";
export { TransactionsPage } from "./transactions";
export { CategoriesPage } from "./categories";
export { BudgetsPage } from "./budgets";
export { ReportsPage } from "./reports";
export { SavingsGoalsPage } from "./savings-goals";
export { ProfilePage } from "./profile";
export { SettingsPage } from "./settings";
export { PaymentMethodsPage } from "./payment-methods";
export {
  NotFoundPage,
  ServerErrorPage,
  NetworkErrorPage,
  UnauthorizedPage,
  ForbiddenPage,
  ValidationErrorPage,
} from "./errors";
