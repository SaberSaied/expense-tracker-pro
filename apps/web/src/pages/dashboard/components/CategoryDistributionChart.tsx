import React, { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as BarTooltip,
} from "recharts";
import {
  PieChart as PieChartIcon,
  TrendingUp,
  Layers,
  RefreshCw,
} from "lucide-react";
import { dashboardApi } from "@/services/dashboard";
import type { CategoryDistribution, CategoryDistributionSummary, DateRangePreset } from "@/services/dashboard";
import { DateRangeFilter } from "./DateRangeFilter";
import type { DateRangeFilterValue } from "./DateRangeFilter";
import { Skeleton } from "@/components/ui/Skeleton";

// ─── Custom Doughnut Tooltip ────────────────────────────────────

interface DoughnutTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color?: string } }>;
  label?: React.ReactNode;
}

const DoughnutTooltip: React.FC<DoughnutTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const formatCurrency = (v: number) =>
    `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="glass-heavy rounded-xl px-4 py-3 shadow-dropdown">
      <p className="text-xs font-medium text-text-muted mb-1.5">{label}</p>
      <p className="text-sm font-bold text-text-primary tabular-nums">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

// ─── Component ─────────────────────────────────────────────────

export const CategoryDistributionChart: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>({ range: "this_year" });
  const [distribution, setDistribution] = useState<CategoryDistribution[]>([]);
  const [summary, setSummary] = useState<CategoryDistributionSummary | null>(null);
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
      const response = await dashboardApi.getCategoryDistribution(params);
      setDistribution(response.distribution);
      setSummary(response.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load category data");
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Skeleton width="w-full" height="h-56" circle={false} />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width="w-full" height="h-8" />
            ))}
          </div>
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
            Category Distribution
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <PieChartIcon className="size-10 text-text-muted/40" />
          <p className="text-sm text-text-muted">Failed to load category data</p>
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

  if (distribution.length === 0) {
    return (
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            Category Distribution
          </h3>
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <Layers className="size-10 text-text-muted/40" />
          <p className="text-sm text-text-muted">No expenses categorized yet</p>
          <p className="text-xs text-text-muted/60">
            Add expense transactions with categories to see your distribution
          </p>
        </div>
      </div>
    );
  }

  // ─── Data State ───────────────────────────────────────────────

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Prepare doughnut data
  const doughnutData = distribution.map((d) => ({
    label: d.categoryName,
    value: d.totalSpent,
    color: d.categoryColor,
  }));

  // Top 6 categories for doughnut, rest grouped into "Other"
  const MAX_DOUGHNUT_SLICES = 6;
  let pieData = doughnutData;
  if (doughnutData.length > MAX_DOUGHNUT_SLICES) {
    const topSlices = doughnutData.slice(0, MAX_DOUGHNUT_SLICES);
    const otherTotal = doughnutData
      .slice(MAX_DOUGHNUT_SLICES)
      .reduce((sum, d) => sum + d.value, 0);
    pieData = [
      ...topSlices,
      {
        label: `Other (${doughnutData.length - MAX_DOUGHNUT_SLICES} more)`,
        value: otherTotal,
        color: "#64748B",
      },
    ];
  }

  return (
    <div className="glass rounded-xl p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-text-primary">
          Category Distribution
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
            <p className="text-sm font-bold text-text-primary tabular-nums">
              {formatCurrency(summary.totalSpent)}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/[0.02]">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">
              Categories
            </p>
            <p className="text-sm font-bold text-text-primary tabular-nums">
              {summary.categoryCount}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/[0.02]">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">
              Transactions
            </p>
            <p className="text-sm font-bold text-text-primary tabular-nums">
              {summary.transactionCount}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/[0.02]">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">
              Avg / Category
            </p>
            <p className="text-sm font-bold text-text-primary tabular-nums">
              {formatCurrency(summary.averagePerCategory)}
            </p>
          </div>
        </div>
      )}

      {/* Doughnut + Horizontal Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {/* Doughnut Chart */}
        <div className="sm:col-span-2">
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="label"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color ?? "#6366F1"} />
                  ))}
                </Pie>
                <RechartsTooltip content={<DoughnutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-text-muted">Total</span>
              <span className="text-base font-bold text-text-primary tabular-nums">
                ${summary?.totalSpent.toLocaleString() ?? 0}
              </span>
            </div>
          </div>
          {/* Doughnut legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center">
            {pieData.slice(0, MAX_DOUGHNUT_SLICES).map((entry) => (
              <div key={entry.label} className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[11px] text-text-secondary truncate max-w-[80px]">
                  {entry.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="sm:col-span-3">
          {distribution.length > 0 && (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distribution}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="categoryName"
                    tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <BarTooltip
                    contentStyle={{
                      backgroundColor: "hsl(217, 33%, 17%)",
                      border: "1px solid hsl(215, 25%, 27%)",
                      borderRadius: "12px",
                      color: "hsl(210, 40%, 98%)",
                      fontSize: "13px",
                      padding: "8px 12px",
                    }}
                    formatter={(value: any) => [`$${Number(value ?? 0).toFixed(2)}`, "Spent"]}
                    labelFormatter={(label: any) => String(label ?? "")}
                  />
                  <Bar
                    dataKey="totalSpent"
                    name="totalSpent"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={16}
                  >
                    {distribution.map((entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={entry.categoryColor}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="mt-5 pt-4 border-t border-border-glass">
        <div className="grid grid-cols-12 gap-2 px-1 py-2 text-[11px] text-text-muted uppercase tracking-wider font-medium">
          <span className="col-span-4">Category</span>
          <span className="col-span-2 text-right">Spent</span>
          <span className="col-span-2 text-right">%</span>
          <span className="col-span-2 text-right">Txns</span>
          <span className="col-span-2 text-right">Avg</span>
        </div>
        <div className="space-y-1 mt-1">
          {distribution.map((cat) => (
            <div
              key={cat.categoryId}
              className="grid grid-cols-12 gap-2 items-center px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <div className="col-span-4 flex items-center gap-2 min-w-0">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.categoryColor }}
                />
                <span className="text-xs text-text-primary truncate">
                  {cat.categoryName}
                </span>
              </div>
              <span className="col-span-2 text-xs font-semibold text-text-primary tabular-nums text-right">
                {formatCurrency(cat.totalSpent)}
              </span>
              <span className="col-span-2 text-xs text-text-secondary tabular-nums text-right">
                {cat.percentage}%
              </span>
              <span className="col-span-2 text-xs text-text-secondary tabular-nums text-right">
                {cat.transactionCount}
              </span>
              <span className="col-span-2 text-xs text-text-muted tabular-nums text-right">
                {formatCurrency(cat.averageTransaction)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Category Highlight */}
      {summary?.topCategory && distribution.length > 1 && (
        <div className="mt-4 pt-4 border-t border-border-glass">
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl flex items-center justify-center bg-primary/10">
                <TrendingUp className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Top Spending Category</p>
                <p className="text-sm font-semibold text-text-primary">
                  {summary.topCategory.categoryName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary tabular-nums">
                {formatCurrency(summary.topCategory.totalSpent)}
              </p>
              <p className="text-xs text-text-muted">{summary.topCategory.percentage}% of total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
