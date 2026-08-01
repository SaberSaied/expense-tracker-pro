import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { clsx } from "clsx";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { dashboardApi } from "@/services/dashboard";
import type { CashFlowDataPoint, DateRangePreset } from "@/services/dashboard";
import { DateRangeFilter } from "./DateRangeFilter";
import type { DateRangeFilterValue } from "./DateRangeFilter";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePrefersReducedMotion } from "@/hooks";

// ─── Custom Tooltip ────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string; color: string }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const formatCurrency = (v: number) =>
    `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const income = payload.find((p) => p.name === "income")?.value ?? 0;
  const expense = payload.find((p) => p.name === "expense")?.value ?? 0;
  const balance = payload.find((p) => p.name === "balance")?.value ?? 0;
  const netChange = income - expense;

  return (
    <div className="glass-heavy rounded-xl px-4 py-3 shadow-dropdown min-w-[190px]">
      <p className="text-xs font-medium text-text-muted mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-3.5 text-success" />
            <span className="text-xs text-text-secondary">Income</span>
          </div>
          <span className="text-xs font-semibold text-success tabular-nums">
            {formatCurrency(income)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="size-3.5 text-warning" />
            <span className="text-xs text-text-secondary">Expenses</span>
          </div>
          <span className="text-xs font-semibold text-warning tabular-nums">
            {formatCurrency(expense)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border-glass pt-1.5 mt-1.5">
          <div className="flex items-center gap-2">
            <Wallet className="size-3.5 text-accent" />
            <span className="text-xs text-text-secondary">Balance</span>
          </div>
          <span
            className={clsx(
              "text-xs font-bold tabular-nums",
              balance >= 0 ? "text-success" : "text-error",
            )}
          >
            {formatCurrency(balance)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-text-secondary">Net Change</span>
          <span
            className={clsx(
              "text-xs font-medium tabular-nums",
              netChange >= 0 ? "text-success" : "text-error",
            )}
          >
            {netChange >= 0 ? "+" : ""}
            {formatCurrency(netChange)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Custom Legend ─────────────────────────────────────────────

const CustomLegend: React.FC = () => (
  <div className="flex items-center justify-center gap-5 pt-2">
    <div className="flex items-center gap-1.5">
      <div className="size-2.5 rounded-sm bg-success" />
      <span className="text-[11px] text-text-secondary">Income</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="size-2.5 rounded-sm bg-warning" />
      <span className="text-[11px] text-text-secondary">Expenses</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="size-2.5 rounded-full bg-accent" />
      <span className="text-[11px] text-text-secondary">Balance</span>
    </div>
  </div>
);

// ─── Component ─────────────────────────────────────────────────

export const CashFlowChart = React.memo(function CashFlowChart() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>({ range: "this_year" });
  const [chartData, setChartData] = useState<CashFlowDataPoint[]>([]);
  const [summary, setSummary] = useState<{
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    finalBalance: number;
    bestMonth: CashFlowDataPoint | null;
    totalMonths: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (filter: DateRangeFilterValue) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { months?: number; range?: DateRangePreset; startDate?: string; endDate?: string } = {};
      if (filter.range === "custom" && filter.startDate && filter.endDate) {
        params.range = "custom";
        params.startDate = filter.startDate;
        params.endDate = filter.endDate;
      } else {
        params.range = filter.range;
      }
      const response = await dashboardApi.getCashFlow(params);
      setChartData(response.chartData);
      setSummary(response.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cash flow data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(dateFilter);
  }, [dateFilter, fetchData]);

  // ─── Loading State ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton width="w-36" height="h-5" />
          <Skeleton width="w-48" height="h-7" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="w-full" height="h-14" />
          ))}
        </div>
        <Skeleton width="w-full" height="h-64" />
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────

  if (error) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            Cash Flow
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <DollarSign className="size-10 text-text-muted/40" />
          <p className="text-sm text-text-muted">Failed to load cash flow data</p>
          <button
            onClick={() => fetchData(dateFilter)}
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

  if (chartData.length === 0 || (summary && summary.totalIncome === 0 && summary.totalExpense === 0)) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            Cash Flow
          </h3>
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
        </div>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <DollarSign className="size-10 text-text-muted/40" />
          <p className="text-sm text-text-muted">
            No transactions recorded yet
          </p>
          <p className="text-xs text-text-muted">
            Add income and expense transactions to see your cash flow
          </p>
        </div>
      </div>
    );
  }

  // ─── Data State ───────────────────────────────────────────────

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="glass rounded-xl p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-text-primary">
          Cash Flow
        </h3>
        <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 pb-4 border-b border-border-glass">
          <div className="text-center p-2 rounded-lg bg-overlay/[0.02]">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">
              Total Income
            </p>
            <p className="text-sm font-bold text-success tabular-nums">
              {formatCurrency(summary.totalIncome)}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-overlay/[0.02]">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">
              Total Expenses
            </p>
            <p className="text-sm font-bold text-warning tabular-nums">
              {formatCurrency(summary.totalExpense)}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-overlay/[0.02]">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">
              Net Cash Flow
            </p>
            <p
              className={clsx(
                "text-sm font-bold tabular-nums",
                summary.netCashFlow >= 0 ? "text-success" : "text-error",
              )}
            >
              {summary.netCashFlow >= 0 ? "+" : ""}
              {formatCurrency(summary.netCashFlow)}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-overlay/[0.02]">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">
              Final Balance
            </p>
            <p
              className={clsx(
                "text-sm font-bold tabular-nums",
                summary.finalBalance >= 0 ? "text-success" : "text-error",
              )}
            >
              {formatCurrency(summary.finalBalance)}
            </p>
          </div>
        </div>
      )}

      {/* Area Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="cashFlowIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cashFlowExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--color-chart-axis)" }}
              axisLine={{ stroke: "var(--color-chart-grid)" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-chart-axis)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "var(--color-chart-grid)" }}
            />
            <Legend content={<CustomLegend />} />
            <Area
              type="monotone"
              dataKey="income"
              name="income"
              stroke="#22C55E"
              strokeWidth={2}
              fill="url(#cashFlowIncomeGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#22C55E", strokeWidth: 2, stroke: "#fff" }}
              animationDuration={500}
              animationEasing="ease-out"
              isAnimationActive={!prefersReducedMotion}
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="expense"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#cashFlowExpenseGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#F59E0B", strokeWidth: 2, stroke: "#fff" }}
              animationDuration={500}
              animationEasing="ease-out"
              isAnimationActive={!prefersReducedMotion}
            />
            {/* Running balance line - rendered as a Recharts Area with fill=none for the line effect */}
            <Area
              type="monotone"
              dataKey="balance"
              name="balance"
              stroke="#06B6D4"
              strokeWidth={2.5}
              fill="none"
              dot={{ r: 2.5, fill: "#06B6D4", strokeWidth: 1.5, stroke: "var(--color-bg-card)" }}
              activeDot={{ r: 5, fill: "#06B6D4", strokeWidth: 2, stroke: "#fff" }}
              animationDuration={500}
              animationEasing="ease-out"
              isAnimationActive={!prefersReducedMotion}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Best Month Footer */}
      {summary?.bestMonth && (
        <div className="mt-4 pt-4 border-t border-border-glass">
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl flex items-center justify-center bg-accent/10">
                <TrendingUp className="size-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Best Cash Flow Month</p>
                <p className="text-sm font-semibold text-text-primary">
                  {summary.bestMonth.label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-accent tabular-nums">
                +{formatCurrency(summary.bestMonth.net)}
              </p>
              <p className="text-xs text-text-muted">
                Income: {formatCurrency(summary.bestMonth.income)} | Expenses: {formatCurrency(summary.bestMonth.expense)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
