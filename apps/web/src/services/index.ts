/**
 * Frontend API client services and HTTP integration wrappers.
 */
export { api, ApiError, tokenStorage } from "./api";
export { authApi } from "./auth";
export { categoriesApi } from "./categories";
export { transactionsApi } from "./transactions";
export type { User, AuthTokens, AuthResponse, LoginInput, RegisterInput } from "./auth";
export type { ApiCategory, CreateCategoryInput, UpdateCategoryInput } from "./categories";
export { paymentMethodsApi } from "./payment-methods";
export type { ApiPaymentMethod, CreatePaymentMethodInput, UpdatePaymentMethodInput } from "./payment-methods";
export { dashboardApi } from "./dashboard";
export type { DashboardOverview, BudgetStatus, SavingsSummary, CategorySpending, PaymentMethodSpending, MostUsedPaymentMethod } from "./dashboard";
export type {
  ApiTransaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  TransactionSummary,
} from "./transactions";
