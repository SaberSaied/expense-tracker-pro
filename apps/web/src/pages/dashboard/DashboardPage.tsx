import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Calculator,
} from "lucide-react";
import { StatCard } from "./components/StatCard";
import { QuickStatsCards } from "./components/QuickStatsCards";
import { IncomeExpenseChart } from "./components/IncomeExpenseChart";
import { CategoryDistributionChart } from "./components/CategoryDistributionChart";
import { MonthlyExpensesChart } from "./components/MonthlyExpensesChart";
import { BudgetUsageChart } from "./components/BudgetUsageChart";
import { CashFlowChart } from "./components/CashFlowChart";
import { AccountOverview } from "./components/AccountOverview";
import { RecentTransactions } from "./components/RecentTransactions";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { dashboardApi } from "@/services/dashboard";
import type { DashboardOverview } from "@/services/dashboard";

/**
 * Primary Dashboard page — financial overview with KPIs, charts, budgets, and recent transactions.
 * Route: /dashboard
 */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable callback so the effect below and the refresh/retry buttons share
  // one identity — avoids re-running the fetch when unrelated state changes.
  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getOverview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // ─── Loading State ────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
        {/* Skeleton stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-reveal">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        {/* Skeleton quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 space-y-3">
              <div className="flex justify-center">
                <Skeleton width="w-9" height="h-9" circle />
              </div>
              <div className="text-center space-y-1.5">
                <Skeleton width="w-16" height="h-5" />
                <Skeleton width="w-20" height="h-3" />
              </div>
            </div>
          ))}
        </div>
        {/* Skeleton monthly overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-reveal">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        {/* Skeleton charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 stagger-reveal">
          <div className="lg:col-span-8">
            <div className="glass rounded-xl p-5 space-y-4">
              <Skeleton width="w-32" height="h-5" />
              <Skeleton width="w-full" height="h-64" />
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="glass rounded-xl p-5 space-y-4">
              <Skeleton width="w-36" height="h-5" />
              <Skeleton width="w-full" height="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────

  if (error) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
        <EmptyState
          icon={AlertCircle}
          title="Failed to Load Dashboard"
          description={error}
          actionLabel="Try Again"
          onAction={fetchOverview}
          iconColor="text-error"
        />
      </div>
    );
  }

  // ─── Empty State (no data yet) ────────────────────────────────

  if (!overview || (overview.totalIncome === 0 && overview.totalExpense === 0)) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
        <EmptyState
          icon={Wallet}
          title="Welcome! Start Tracking Your Finances"
          description="Add your first income or expense transaction to see your financial dashboard come to life."
          actionLabel="+ Add Your First Transaction"
          onAction={() => navigate("/expenses")}
          iconColor="text-primary"
        />
      </div>
    );
  }

  // ─── Data State ───────────────────────────────────────────────

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const netSavingsTrend = overview.netSavings >= 0 ? "up" : "down";
  const balanceTrend = overview.totalBalance >= 0 ? "up" : "down";

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title font-bold text-text-primary">Financial Overview</h2>
          <p className="text-sm text-text-secondary mt-1">
            Your all-time financial health at a glance
          </p>
        </div>
        <button
          onClick={fetchOverview}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-all"
          aria-label="Refresh dashboard data"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-reveal">
        <StatCard
          title="Total Income"
          value={formatCurrency(overview.totalIncome)}
          subtext="All-time earnings"
          icon={TrendingUp}
          trend="up"
          iconBg="bg-success/15"
          iconColor="text-success"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(overview.totalExpense)}
          subtext="All-time spending"
          icon={TrendingDown}
          trend="neutral"
          iconBg="bg-warning/15"
          iconColor="text-warning"
        />
        <StatCard
          title="Net Savings"
          value={formatCurrency(overview.netSavings)}
          subtext={
            overview.netSavings >= 0
              ? `You've saved ${formatCurrency(overview.netSavings)} overall`
              : `${formatCurrency(Math.abs(overview.netSavings))} overspent`
          }
          icon={PiggyBank}
          trend={netSavingsTrend}
          iconBg={netSavingsTrend === "up" ? "bg-success/15" : "bg-error/15"}
          iconColor={netSavingsTrend === "up" ? "text-success" : "text-error"}
        />
        <StatCard
          title="Total Balance"
          value={formatCurrency(overview.totalBalance)}
          subtext={
            overview.totalBalance >= 0
              ? "Positive financial standing"
              : "Negative financial standing"
          }
          icon={DollarSign}
          trend={balanceTrend}
          iconBg="bg-accent/15"
          iconColor="text-accent"
        />
      </div>

      {/* Quick Statistics */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-primary">
            Quick Statistics
          </h2>
        </div>
        <QuickStatsCards stats={overview.quickStats} />
      </section>

      {/* Monthly Overview */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-primary">
            Monthly Overview —{' '}
            <span className="text-text-muted font-normal">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-reveal">
          <StatCard
            title="Monthly Income"
            value={formatCurrency(overview.monthlyIncome)}
            subtext="Earned this month"
            icon={TrendingUp}
            trend="up"
            iconBg="bg-success/15"
            iconColor="text-success"
          />
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(overview.monthlyExpense)}
            subtext="Spent this month"
            icon={TrendingDown}
            trend="neutral"
            iconBg="bg-warning/15"
            iconColor="text-warning"
          />
          <StatCard
            title="Monthly Balance"
            value={formatCurrency(overview.monthlyNet)}
            subtext={
              overview.monthlyNet >= 0
                ? `$${overview.monthlyNet.toLocaleString("en-US", { minimumFractionDigits: 2 })} surplus`
                : `$${Math.abs(overview.monthlyNet).toLocaleString("en-US", { minimumFractionDigits: 2 })} deficit`
            }
            icon={Calculator}
            trend={overview.monthlyNet >= 0 ? "up" : "down"}
            iconBg={overview.monthlyNet >= 0 ? "bg-success/15" : "bg-error/15"}
            iconColor={overview.monthlyNet >= 0 ? "text-success" : "text-error"}
          />
          <StatCard
            title="Savings Rate"
            value={
              overview.monthlyIncome > 0
                ? `${Math.round((overview.monthlyNet / overview.monthlyIncome) * 100)}%`
                : "—"
            }
            subtext={
              overview.monthlyIncome > 0
                ? `of income saved this month`
                : "No income recorded"
            }
            icon={PiggyBank}
            trend={overview.monthlyNet >= 0 ? "up" : "down"}
            iconBg={overview.monthlyNet >= 0 ? "bg-success/15" : "bg-error/15"}
            iconColor={overview.monthlyNet >= 0 ? "text-success" : "text-error"}
          />
        </div>
      </section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 stagger-reveal">
        <div className="lg:col-span-7">
          <IncomeExpenseChart />
        </div>
        <div className="lg:col-span-5">
          <CategoryDistributionChart />
        </div>
      </div>

      {/* Monthly Expenses & Budget Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 stagger-reveal">
        <div className="lg:col-span-8">
          <MonthlyExpensesChart />
        </div>
        <div className="lg:col-span-4">
          <BudgetUsageChart />
        </div>
      </div>

      {/* Cash Flow Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 stagger-reveal">
        <div className="lg:col-span-12">
          <CashFlowChart />
        </div>
      </div>

      {/* Account Overview & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 stagger-reveal">
        <div className="lg:col-span-6">
          <AccountOverview
            methods={overview.spendingByPaymentMethod}
            mostUsed={overview.mostUsedPaymentMethod}
          />
        </div>
        <div className="lg:col-span-6">
          <RecentTransactions transactions={overview.recentTransactions} />
        </div>
      </div>
    </div>
  );
};
