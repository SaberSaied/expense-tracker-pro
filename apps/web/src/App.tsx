import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { lazy, useEffect } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "@/pages/auth";
import {
  NotFoundPage,
  ServerErrorPage,
  NetworkErrorPage,
  UnauthorizedPage,
  ForbiddenPage,
  ValidationErrorPage,
} from "@/pages/errors";
import { useAuth } from "@/hooks/useAuth";

// ─── Route-level code splitting (perf) ─────────────────────────
// Feature pages are lazy-loaded so each route's chunk is fetched on
// demand instead of shipping the whole app in one bundle. Auth and
// error pages stay eager — they're small and needed for first paint
// and failure states.
//
// Note: these modules export *named* page components, so each lazy()
// remaps the named export to the default export React.lazy expects.
const DashboardPage = lazy(() =>
  import("@/pages/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const TransactionsPage = lazy(() =>
  import("@/pages/transactions/TransactionsPage").then((m) => ({ default: m.TransactionsPage })),
);
const CategoriesPage = lazy(() =>
  import("@/pages/categories/CategoriesPage").then((m) => ({ default: m.CategoriesPage })),
);
const BudgetsPage = lazy(() =>
  import("@/pages/budgets/BudgetsPage").then((m) => ({ default: m.BudgetsPage })),
);
const ReportsPage = lazy(() =>
  import("@/pages/reports/ReportsPage").then((m) => ({ default: m.ReportsPage })),
);
const SavingsGoalsPage = lazy(() =>
  import("@/pages/savings-goals/SavingsGoalsPage").then((m) => ({ default: m.SavingsGoalsPage })),
);
const ProfilePage = lazy(() =>
  import("@/pages/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import("@/pages/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const PaymentMethodsPage = lazy(() =>
  import("@/pages/payment-methods/PaymentMethodsPage").then((m) => ({
    default: m.PaymentMethodsPage,
  })),
);

/**
 * Protected route wrapper — redirects to /login if not authenticated.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-bg-app"
        role="status"
        aria-label="Loading"
        aria-live="polite"
      >
        <div
          className="size-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * Public route wrapper — redirects to /dashboard if already authenticated.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-bg-app"
        role="status"
        aria-label="Loading"
        aria-live="polite"
      >
        <div
          className="size-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/**
 * Listens for the `app:unauthorized` event (dispatched by the API client when
 * token refresh fails), clears the stale auth session, and routes the user
 * to the session-expired page.
 */
function UnauthorizedListener() {
  const navigate = useNavigate();
  const { clearSession } = useAuth();

  useEffect(() => {
    const handler = () => {
      // Reset auth state so the /login PublicRoute doesn't bounce the user
      // back to the app (which would immediately 401 again — an infinite loop).
      clearSession();
      navigate("/unauthorized", { replace: true });
    };
    window.addEventListener("app:unauthorized", handler);
    return () => window.removeEventListener("app:unauthorized", handler);
  }, [clearSession, navigate]);

  return null;
}

/**
 * Root application component with routing configuration.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <UnauthorizedListener />
          <ErrorBoundary>
            <Routes>
              {/* Auth routes — only accessible when NOT authenticated */}
              <Route
                element={
                  <PublicRoute>
                    <AuthLayout />
                  </PublicRoute>
                }
              >
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
              </Route>

              {/* Authenticated routes — only accessible when authenticated */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/expenses" element={<TransactionsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/savings-goals" element={<SavingsGoalsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/payment-methods" element={<PaymentMethodsPage />} />
              </Route>

              {/* Error pages — public so users can land here even when signed out */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="/network-error" element={<NetworkErrorPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/forbidden" element={<ForbiddenPage />} />
              <Route path="/validation-error" element={<ValidationErrorPage />} />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>

          {/* Toast notification system — colors follow the active theme tokens */}
          <Toaster
            position="top-right"
            gap={8}
            toastOptions={{
              className: "glass-heavy",
              style: {
                backgroundColor: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-card)",
                color: "var(--color-text-primary)",
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
