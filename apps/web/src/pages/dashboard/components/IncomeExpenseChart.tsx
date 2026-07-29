import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { clsx } from "clsx";
import { RefreshCw, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { dashboardApi } from "@/services/dashboard";
import type { IncomeExpenseChartDataPoint, DateRangePreset } from "@/services/dashboard";
import { DateRangeFilter } from "./DateRangeFilter";
import type { DateRangeFilterValue } from "./DateRangeFilter";
import { Skeleton } from "@/components/ui/Skeleton";

// ─── Custom Tooltip ────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const formatCurrency = (v: number) =>
    `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const incomePayload = payload.find((p) => p.name === "income");
  const expensePayload = payload.find((p) => p.name === "expense");
  const netValue = (incomePayload?.value ?? 0) - (expensePayload?.value ?? 0);

  return (
    <div className="glass-heavy rounded-xl px-4 py-3 shadow-dropdown min-w-[180px]">
      <p className="text-xs font-medium text-text-muted mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-3.5 text-success" />
            <span className="text-xs text-text-secondary">Income</span>
          </div>
          <span className="text-xs font-semibold text-success tabular-nums">
            {formatCurrency(incomePayload?.value ?? 0)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="size-3.5 text-warning" />
            <span className="text-xs text-text-secondary">Expenses</span>
          </div>
          <span className="text-xs font-semibold text-warning tabular-nums">
            {formatCurrency(expensePayload?.value ?? 0)}
          </span>
        </div>
        <div className="border-t border-border-glass pt-1.5 mt-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-secondary">Net</span>
            <span
              className={clsx(
                "text-xs font-bold tabular-nums",
                netValue >= 0 ? "text-success" : "text-error",
              )}
            >
              {netValue >= 0 ? "+" : ""}
              {formatCurrency(netValue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Custom Legend ─────────────────────────────────────────────

const CustomLegend: React.FC = () => (
  <div className="flex items-center justify-center gap-6 pt-2">
    <div className="flex items-center gap-2">
      <div className="size-3 rounded-sm bg-success" />
      <span className="text-xs text-text-secondary">Income</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="size-3 rounded-sm bg-warning" />
      <span className="text-xs text-text-secondary">Expenses</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="size-0.5" />
      <div className="size-3 rounded-full bg-accent" />
      <span className="text-xs text-text-secondary">Net</span>
    </div>
  </div>
);

// ─── Component ─────────────────────────────────────────────────

export const IncomeExpenseChart: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>({ range: "this_year" });
  const [chartData, setChartData] = useState<IncomeExpenseChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async (filter: DateRangeFilterValue) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { months?: number; range?: DateRangePreset; startDate?: string; endDate?: string; period: string } = {
        period: "monthly",
      };
      if (filter.range === "custom" && filter.startDate && filter.endDate) {
        params.range = "custom";
        params.startDate = filter.startDate;
        params.endDate = filter.endDate;
      } else {
        params.range = filter.range;
      }
      const response = await dashboardApi.getIncomeExpenseChart(params);
      setChartData(response.chartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chart data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData(dateFilter);
  }, [dateFilter, fetchChartData]);

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
            Income vs Expenses
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <BarChart3 className="size-10 text-text-muted/40" />
          <p className="text-sm text-text-muted">Failed to load chart data</p>
          <button
            onClick={() => fetchChartData(dateFilter)}
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

  if (chartData.length === 0) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            Income vs Expenses
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <BarChart3 className="size-10 text-text-muted/40" />
          <p className="text-sm text-text-muted">
            No transaction data yet for this period
          </p>
          <p className="text-xs text-text-muted/60">
            Add transactions to see your income vs expenses chart
          </p>
        </div>
      </div>
    );
  }

  // ─── Computed Summary Stats ────────────────────────────────────

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalIncome = chartData.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = chartData.reduce((sum, d) => sum + d.expense, 0);
  const totalNet = totalIncome - totalExpense;
  const bestMonth = [...chartData].sort((a, b) => b.net - a.net)[0];
  const worstMonth = [...chartData].sort((a, b) => a.net - b.net)[0];

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="glass rounded-xl p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-text-primary">
          Income vs Expenses
        </h3>
        <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-5 pb-4 border-b border-border-glass">
        <div className="text-center">
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
            Total Income
          </p>
          <p className="text-lg font-bold text-success tabular-nums">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
            Total Expenses
          </p>
          <p className="text-lg font-bold text-warning tabular-nums">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
            Net {totalNet >= 0 ? "Surplus" : "Deficit"}
          </p>
          <p
            className={clsx(
              "text-lg font-bold tabular-nums",
              totalNet >= 0 ? "text-success" : "text-error",
            )}
          >
            {totalNet >= 0 ? "+" : ""}
            {formatCurrency(totalNet)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
            barGap={2}
            barCategoryGap="20%"
          >
            <defs>
              <linearGradient id="incomeBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#16A34A" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="expenseBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#D97706" stopOpacity={0.7} />
              </linearGradient>
              <filter id="barShadow">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity={0.15} />
              </filter>
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend content={<CustomLegend />} />
            <Bar
              dataKey="income"
              name="income"
              fill="url(#incomeBarGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              filter="url(#barShadow)"
            />
            <Bar
              dataKey="expense"
              name="expense"
              fill="url(#expenseBarGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              filter="url(#barShadow)"
            />
            <Line
              type="monotone"
              dataKey="net"
              name="net"
              stroke="#06B6D4"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#06B6D4", strokeWidth: 2, stroke: "#06B6D4" }}
              activeDot={{ r: 5, fill: "#06B6D4", strokeWidth: 2, stroke: "#fff" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Best/Worst Month Footer */}
      {bestMonth && worstMonth && (
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border-glass">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-success/5 border border-success/10">
            <TrendingUp className="size-4 text-success shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-text-muted">Best Month</p>
              <p className="text-xs font-semibold text-text-primary truncate">
                {bestMonth.label}
              </p>
              <p className="text-[11px] text-success tabular-nums">
                +{formatCurrency(bestMonth.net)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-error/5 border border-error/10">
            <TrendingDown className="size-4 text-error shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-text-muted">Worst Month</p>
              <p className="text-xs font-semibold text-text-primary truncate">
                {worstMonth.label}
              </p>
              <p className="text-[11px] text-error tabular-nums">
                {formatCurrency(worstMonth.net)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
