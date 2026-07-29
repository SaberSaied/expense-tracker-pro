import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { clsx } from "clsx";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { dashboardApi } from "@/services/dashboard";
import type { MonthlyExpensesDataPoint, DateRangePreset } from "@/services/dashboard";
import { DateRangeFilter } from "./DateRangeFilter";
import type { DateRangeFilterValue } from "./DateRangeFilter";
import { Skeleton } from "@/components/ui/Skeleton";

// ─── Custom Tooltip ────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: MonthlyExpensesDataPoint }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const formatCurrency = (v: number) =>
    `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const data = payload[0].payload;
  const avgPerTxn = data.transactionCount > 0
    ? data.total / data.transactionCount
    : 0;

  return (
    <div className="glass-heavy rounded-xl px-4 py-3 shadow-dropdown min-w-[160px]">
      <p className="text-xs font-medium text-text-muted mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-text-secondary">Total</span>
          <span className="text-xs font-bold text-warning tabular-nums">
            {formatCurrency(data.total)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-text-secondary">Transactions</span>
          <span className="text-xs font-semibold text-text-primary tabular-nums">
            {data.transactionCount}
          </span>
        </div>
        <div className="border-t border-border-glass pt-1.5 mt-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-secondary">Avg / Txn</span>
            <span className="text-xs font-semibold text-text-muted tabular-nums">
              {formatCurrency(avgPerTxn)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Component ─────────────────────────────────────────────────

export const MonthlyExpensesChart: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>({ range: "this_year" });
  const [chartData, setChartData] = useState<MonthlyExpensesDataPoint[]>([]);
  const [summary, setSummary] = useState<{
    totalExpenses: number;
    averageMonthly: number;
    monthsWithData: number;
    totalMonths: number;
    highestMonth: MonthlyExpensesDataPoint | null;
    lowestMonth: MonthlyExpensesDataPoint | null;
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
      const response = await dashboardApi.getMonthlyExpenses(params);
      setChartData(response.chartData);
      setSummary(response.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expense data");
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
          <Skeleton width="w-40" height="h-5" />
          <div className="flex gap-1.5">
            {["Today", "Week", "Month", "Year"].map((l) => (
              <Skeleton key={l} width="w-12" height="h-7" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="w-full" height="h-14" />
          ))}
        </div>
        <Skeleton width="w-full" height="h-56" />
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────

  if (error) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            Monthly Expenses
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <DollarSign className="size-10 text-text-muted/40" />
          <p className="text-sm text-text-muted">Failed to load expense data</p>
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

  if (chartData.length === 0 || (summary && summary.totalExpenses === 0)) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            Monthly Expenses
          </h3>
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
        </div>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <DollarSign className="size-10 text-text-muted/40" />
          <p className="text-sm text-text-muted">
            No expenses recorded yet for this period
          </p>
          <p className="text-xs text-text-muted/60">
            Add expense transactions to see your monthly expense trends
          </p>
        </div>
      </div>
    );
  }

  // ─── Data State ───────────────────────────────────────────────

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const trend = summary && summary.monthsWithData >= 2
    ? chartData
        .filter((d) => d.transactionCount > 0)
        .slice(-2)
    : null;
  const trendDirection = trend && trend.length === 2
    ? trend[1].total > trend[0].total ? "up" : "down"
    : "neutral";

  return (
    <div className="glass rounded-xl p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-text-primary">
          Monthly Expenses
        </h3>
        <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 pb-4 border-b border-border-glass">
          <div className="text-center p-2 rounded-lg bg-white/[0.02]">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">
              Total Spent
            </p>
            <p className="text-sm font-bold text-warning tabular-nums">
              {formatCurrency(summary.totalExpenses)}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/[0.02]">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">
              Monthly Avg
            </p>
            <p className="text-sm font-bold text-text-primary tabular-nums">
              {formatCurrency(summary.averageMonthly)}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/[0.02]">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">
              Active Months
            </p>
            <p className="text-sm font-bold text-text-primary tabular-nums">
              {summary.monthsWithData} / {summary.totalMonths}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/[0.02]">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">
              {trendDirection === "up" ? "Trending Up" : trendDirection === "down" ? "Trending Down" : "Trend"}
            </p>
            <div className="flex items-center justify-center gap-1.5">
              {trendDirection === "up" && <TrendingUp className="size-3.5 text-error" />}
              {trendDirection === "down" && <TrendingDown className="size-3.5 text-success" />}
              <p className={clsx(
                "text-sm font-bold tabular-nums",
                trendDirection === "up" ? "text-error" : trendDirection === "down" ? "text-success" : "text-text-muted",
              )}>
                {trendDirection === "up" ? "Rising" : trendDirection === "down" ? "Falling" : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Area Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="monthlyExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.08)", strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="total"
              name="total"
              stroke="#F59E0B"
              strokeWidth={2.5}
              fill="url(#monthlyExpenseGradient)"
              dot={{ r: 3, fill: "#F59E0B", strokeWidth: 2, stroke: "#1E293B" }}
              activeDot={{ r: 5, fill: "#F59E0B", strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Highest/Lowest Month Footer */}
      {summary?.highestMonth && summary?.lowestMonth && summary.monthsWithData > 1 && (
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border-glass">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-error/5 border border-error/10">
            <TrendingUp className="size-4 text-error shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-text-muted">Highest Spending</p>
              <p className="text-xs font-semibold text-text-primary truncate">
                {summary.highestMonth.label}
              </p>
              <p className="text-[11px] text-error tabular-nums">
                {formatCurrency(summary.highestMonth.total)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-success/5 border border-success/10">
            <TrendingDown className="size-4 text-success shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-text-muted">Lowest Spending</p>
              <p className="text-xs font-semibold text-text-primary truncate">
                {summary.lowestMonth.label}
              </p>
              <p className="text-[11px] text-success tabular-nums">
                {formatCurrency(summary.lowestMonth.total)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
