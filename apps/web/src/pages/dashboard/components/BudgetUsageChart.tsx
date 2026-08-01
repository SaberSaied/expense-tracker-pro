import React, { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { dashboardApi } from "@/services/dashboard";
import type { BudgetUsageData, BudgetUsageSummary } from "@/services/dashboard";
import { Skeleton } from "@/components/ui/Skeleton";

// ─── Month Navigation ─────────────────────────────────────────

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Color helpers ─────────────────────────────────────────────

function getStatusColor(status: "on_track" | "warning" | "critical"): string {
  switch (status) {
    case "on_track": return "text-success";
    case "warning": return "text-warning";
    case "critical": return "text-error";
  }
}

function getStatusBg(status: "on_track" | "warning" | "critical"): string {
  switch (status) {
    case "on_track": return "bg-success";
    case "warning": return "bg-warning";
    case "critical": return "bg-error";
  }
}

function getStatusBgLight(status: "on_track" | "warning" | "critical"): string {
  switch (status) {
    case "on_track": return "bg-success/10";
    case "warning": return "bg-warning/10";
    case "critical": return "bg-error/10";
  }
}

function getStatusBorder(status: "on_track" | "warning" | "critical"): string {
  switch (status) {
    case "on_track": return "border-success/20";
    case "warning": return "border-warning/20";
    case "critical": return "border-error/20";
  }
}

// ─── Component ─────────────────────────────────────────────────

export const BudgetUsageChart = React.memo(function BudgetUsageChart() {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));
  const [budgets, setBudgets] = useState<BudgetUsageData[]>([]);
  const [summary, setSummary] = useState<BudgetUsageSummary | null>(null);
  const [periodLabel, setPeriodLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (month: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getBudgetUsage({ month });
      setBudgets(response.budgets);
      setSummary(response.summary);
      setPeriodLabel(response.period.label);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load budget data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentMonth);
  }, [currentMonth, fetchData]);

  const goToPrevMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setCurrentMonth(getMonthKey(d));
  };

  const goToNextMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    const nextKey = getMonthKey(d);
    const nowKey = getMonthKey(new Date());
    if (nextKey > nowKey) return; // Don't allow future months
    setCurrentMonth(nextKey);
  };

  // ─── Loading State ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton width="w-36" height="h-5" />
          <div className="flex items-center gap-2">
            <Skeleton width="w-20" height="h-7" />
          </div>
        </div>
        <Skeleton width="w-full" height="h-20" />
        <div className="space-y-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width="w-full" height="h-16" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────

  if (error) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            Budget Usage
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <Wallet className="size-10 text-text-muted/40" />
          <p className="text-sm text-text-muted">Failed to load budget data</p>
          <button
            onClick={() => fetchData(currentMonth)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover transition-colors"
          >
            <RefreshCw className="size-3.5" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ─── Empty State ───────────────────────────────────────────────

  if (budgets.length === 0) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            Budget Usage
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <Wallet className="size-10 text-text-muted/40" />
          <p className="text-sm text-text-muted">No budgets set for {periodLabel}</p>
          <p className="text-xs text-text-muted">
            Create budgets to track your spending limits
          </p>
        </div>
      </div>
    );
  }

  // ─── Data State ───────────────────────────────────────────────

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sortedBudgets = [...budgets].sort((a, b) => b.percentage - a.percentage);

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="glass rounded-xl p-5">
      {/* Header with month picker */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-primary">
          Budget Usage
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-all"
            aria-label="Previous month"
          >
            <TrendingDown className="size-3.5 rotate-90" />
          </button>
          <span className="text-xs font-medium text-text-secondary min-w-[80px] text-center select-none">
            {periodLabel}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-all"
            disabled={currentMonth >= getMonthKey(new Date())}
            aria-label="Next month"
          >
            <TrendingUp className="size-3.5 rotate-90" />
          </button>
        </div>
      </div>

      {/* Overall Summary */}
      {summary && (
        <div className="mb-5 pb-4 border-b border-border-glass">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Overall</span>
              {summary.overallPercentage >= 100 ? (
                <AlertTriangle className="size-3.5 text-error" />
              ) : summary.overallPercentage >= 80 ? (
                <AlertTriangle className="size-3.5 text-warning" />
              ) : (
                <CheckCircle2 className="size-3.5 text-success" />
              )}
            </div>
            <span className={clsx(
              "text-xs font-semibold tabular-nums",
              summary.overallPercentage >= 100 ? "text-error" :
              summary.overallPercentage >= 80 ? "text-warning" :
              "text-success",
            )}>
              {summary.overallPercentage}% used
            </span>
          </div>

          {/* Overall progress bar */}
          <div className="h-3 rounded-full bg-overlay/5 overflow-hidden mb-3">
            <div
              className={clsx(
                "h-full rounded-full transition-all duration-500",
                summary.overallPercentage >= 100 ? "bg-error" :
                summary.overallPercentage >= 80 ? "bg-warning" :
                "bg-success",
              )}
              style={{ width: `${Math.min(summary.overallPercentage, 100)}%` }}
            />
          </div>

          {/* Summary stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Budgeted</p>
              <p className="text-xs font-bold text-text-primary tabular-nums">
                {formatCurrency(summary.totalBudgeted)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Spent</p>
              <p className="text-xs font-bold text-warning tabular-nums">
                {formatCurrency(summary.totalSpent)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Remaining</p>
              <p className={clsx(
                "text-xs font-bold tabular-nums",
                summary.totalRemaining >= 0 ? "text-success" : "text-error",
              )}>
                {summary.totalRemaining >= 0 ? formatCurrency(summary.totalRemaining) : `-${formatCurrency(Math.abs(summary.totalRemaining))}`}
              </p>
            </div>
          </div>

          {/* Status chips */}
          {(summary.criticalCount > 0 || summary.warningCount > 0 || summary.onTrackCount > 0) && (
            <div className="flex items-center justify-center gap-3 mt-3">
              {summary.onTrackCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-success">
                  <CheckCircle2 className="size-3" />
                  {summary.onTrackCount} on track
                </span>
              )}
              {summary.warningCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-warning">
                  <AlertTriangle className="size-3" />
                  {summary.warningCount} warning
                </span>
              )}
              {summary.criticalCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-error">
                  <AlertTriangle className="size-3" />
                  {summary.criticalCount} critical
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Individual budget cards */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {sortedBudgets.map((budget) => (
          <div
            key={budget.budgetId}
            className={clsx(
              "p-3 rounded-xl border transition-all",
              getStatusBgLight(budget.status),
              getStatusBorder(budget.status),
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: budget.categoryColor }}
                />
                <span className="text-sm font-medium text-text-primary truncate">
                  {budget.categoryName}
                </span>
              </div>
              <span className={clsx(
                "text-xs font-semibold tabular-nums",
                getStatusColor(budget.status),
              )}>
                {budget.percentage}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-overlay/5 overflow-hidden mb-2.5">
              <div
                className={clsx(
                  "h-full rounded-full transition-all duration-500",
                  getStatusBg(budget.status),
                )}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-[10px] text-text-muted">Limit</p>
                <p className="text-[11px] font-semibold text-text-primary tabular-nums">
                  {formatCurrency(budget.budgeted)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Spent</p>
                <p className="text-[11px] font-semibold text-warning tabular-nums">
                  {formatCurrency(budget.spent)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Left</p>
                <p className={clsx(
                  "text-[11px] font-semibold tabular-nums",
                  budget.remaining >= 0 ? "text-success" : "text-error",
                )}>
                  {budget.remaining >= 0
                    ? formatCurrency(budget.remaining)
                    : `-${formatCurrency(Math.abs(budget.remaining))}`}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Txns</p>
                <p className="text-[11px] font-semibold text-text-secondary tabular-nums">
                  {budget.transactionCount}
                </p>
              </div>
            </div>

            {/* Overspent alert */}
            {budget.remaining < 0 && (
              <div className="mt-2 pt-2 border-t border-error/10 flex items-center gap-1.5">
                <AlertTriangle className="size-3 text-error shrink-0" />
                <span className="text-[11px] text-error font-medium">
                  Overspent by {formatCurrency(Math.abs(budget.remaining))}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
