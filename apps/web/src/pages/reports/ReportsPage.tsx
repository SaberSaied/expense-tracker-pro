import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Calendar,
  PieChart,
  Hash,
  Download,
  FileText,
  FileSpreadsheet,
  File,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";
import { exportsApi } from "@/services/exports";
import type { ExportFormat } from "@/services/exports";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePrefersReducedMotion } from "@/hooks";
import { clsx } from "clsx";
import { reportsApi } from "@/services/reports";
import { ApiError } from "@/services/api";
import type { ReportSummary, CategorySummaryItem } from "@/services/reports";

const DATE_PRESETS = [
  "This Month",
  "Last Month",
  "Last 3 Months",
  "Year-to-Date",
  "Custom",
] as const;

type DatePreset = (typeof DATE_PRESETS)[number];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function presetRange(preset: DatePreset, now = new Date()): { startDate: string; endDate: string } {
  const end = toISODate(now);
  switch (preset) {
    case "This Month":
      return {
        startDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
        endDate: end,
      };
    case "Last Month": {
      const firstOfLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastOfLast = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: toISODate(firstOfLast), endDate: toISODate(lastOfLast) };
    }
    case "Last 3 Months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { startDate: toISODate(start), endDate: end };
    }
    case "Year-to-Date":
      return { startDate: `${now.getFullYear()}-01-01`, endDate: end };
    case "Custom":
    default:
      return {
        startDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
        endDate: end,
      };
  }
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const EXPORT_FORMATS = [
  { value: "csv", label: "CSV", icon: FileText },
  { value: "pdf", label: "PDF", icon: File },
  { value: "xlsx", label: "Excel", icon: FileSpreadsheet },
] as const;

/**
 * Reports & Analytics page — financial intelligence dashboard backed by the real reports API.
 * Route: /reports
 */
export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activePreset, setActivePreset] = useState<DatePreset>("This Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [exporting, setExporting] = useState(false);

  // Radio group roving-tabindex refs for the export-format picker.
  const exportFormatRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow/Home/End keys move selection & focus between export formats (WCAG 2.1.1).
  const handleExportFormatKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = EXPORT_FORMATS.findIndex((f) => f.value === exportFormat);
    let nextIndex: number;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % EXPORT_FORMATS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + EXPORT_FORMATS.length) % EXPORT_FORMATS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = EXPORT_FORMATS.length - 1;
    } else {
      return;
    }
    const next = EXPORT_FORMATS[nextIndex];
    setExportFormat(next.value);
    exportFormatRefs.current[nextIndex]?.focus();
  };

  // ─── Data state ──────────────────────────────────────────
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [categories, setCategories] = useState<CategorySummaryItem[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [trendData, setTrendData] = useState<{ label: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (rangeOverride?: { startDate: string; endDate: string }) => {
      try {
        // Use explicit custom dates when provided, otherwise derive from the preset
        const range =
          rangeOverride ??
          (activePreset === "Custom" && customStart && customEnd
            ? { startDate: customStart, endDate: customEnd }
            : presetRange(activePreset));
        const { startDate, endDate } = range;
        const year = new Date().getFullYear();

        const [summaryData, categoryReport, trendReport] = await Promise.all([
          reportsApi.getSummary(startDate, endDate),
          reportsApi.getCategorySummary(startDate, endDate),
          reportsApi.getMonthlyTrend(year),
        ]);

        setSummary(summaryData);
        setGrandTotal(categoryReport.grandTotal);
        setCategories(categoryReport.categories);

        const months = trendReport.months ?? [];
        setTrendData(
          months.map((m) => ({
            label: MONTH_LABELS[Number(m.month.slice(5)) - 1] ?? m.month,
            value: m.expense,
          })),
        );
        setError(null);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to load reports";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [activePreset, customStart, customEnd],
  );

  useEffect(() => {
    // Fetch on preset change; for Custom, wait for the Apply button
    if (activePreset === "Custom") return;
    let ignore = false;
    const range = presetRange(activePreset);
    const year = new Date().getFullYear();
    const load = async () => {
      try {
        const [summaryData, categoryReport, trendReport] = await Promise.all([
          reportsApi.getSummary(range.startDate, range.endDate),
          reportsApi.getCategorySummary(range.startDate, range.endDate),
          reportsApi.getMonthlyTrend(year),
        ]);
        if (ignore) return;
        setSummary(summaryData);
        setGrandTotal(categoryReport.grandTotal);
        setCategories(categoryReport.categories);
        const months = trendReport.months ?? [];
        setTrendData(
          months.map((m) => ({
            label: MONTH_LABELS[Number(m.month.slice(5)) - 1] ?? m.month,
            value: m.expense,
          })),
        );
        setError(null);
      } catch (err) {
        if (ignore) return;
        const message = err instanceof ApiError ? err.message : "Failed to load reports";
        setError(message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [activePreset]);

  const handleExportDownload = async () => {
    if (exporting) return;
    const range =
      activePreset === "Custom" && customStart && customEnd
        ? { startDate: customStart, endDate: customEnd }
        : presetRange(activePreset);

    setExporting(true);
    try {
      const filename = await exportsApi.downloadReport({
        format: exportFormat,
        startDate: range.startDate,
        endDate: range.endDate,
      });
      toast.success(`Export downloaded: ${filename}`);
      setShowExportModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed";
      toast.error("Export failed", { description: message });
    } finally {
      setExporting(false);
    }
  };

  const handlePresetClick = (preset: DatePreset) => {
    setActivePreset(preset);
    if (preset === "Custom") {
      const { startDate, endDate } = presetRange("This Month");
      setCustomStart(customStart || startDate);
      setCustomEnd(customEnd || endDate);
      // Custom range fetches when Apply is clicked
    } else if (preset !== activePreset) {
      // Show the loading skeleton while the effect refetches the new range
      setIsLoading(true);
    }
  };

  // ─── Loading state ───────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="size-10 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass rounded-xl p-5 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-4 glass rounded-xl p-5 space-y-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-52 w-full" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4">
            <Skeleton className="h-5 w-44" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-none border-t border-border-card/50" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
        <EmptyState
          icon={AlertCircle}
          title="Failed to Load Reports"
          description={error}
          actionLabel="Try Again"
          onAction={() => {
            setIsLoading(true);
            void fetchData();
          }}
          iconColor="text-error"
        />
      </div>
    );
  }

  // ─── Data state ──────────────────────────────────────────
  // summary is always set here: the loading and error branches return early
  if (!summary) return null;

  const isEmpty = summary.transactionCount === 0;

  const stats = [
    {
      title: "Total Spent",
      value: formatCurrency(summary.expenses),
      icon: DollarSign,
      bg: "bg-warning/15",
      color: "text-warning",
    },
    {
      title: "Net Balance",
      value: formatCurrency(summary.netBalance),
      icon: Wallet,
      bg: summary.netBalance >= 0 ? "bg-success/15" : "bg-error/15",
      color: summary.netBalance >= 0 ? "text-success" : "text-error",
    },
    {
      title: "Savings Rate",
      value: `${summary.savingsRate}%`,
      icon: TrendingUp,
      bg: "bg-secondary/15",
      color: "text-secondary",
    },
    {
      title: "Total Transactions",
      value: `${summary.transactionCount}`,
      icon: Hash,
      bg: "bg-accent/15",
      color: "text-accent",
    },
  ];

  const pieData = categories.map((c) => ({
    label: c.categoryName,
    value: c.total,
    color: c.categoryColor,
  }));

  const hasCategoryData = pieData.length > 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title font-bold text-text-primary">Financial Analytics</h2>
          <p className="text-sm text-text-secondary mt-1">Insights into your spending patterns</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="size-4" />}
          onClick={() => setShowExportModal(true)}
        >
          Export Data
        </Button>
      </div>

      {/* Date Range Presets */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              aria-pressed={activePreset === preset}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                activePreset === preset
                  ? "bg-primary text-text-inverse"
                  : "text-text-secondary hover:text-text-primary hover:bg-overlay/5",
              )}
            >
              {preset}
            </button>
          ))}
        </div>

        {activePreset === "Custom" && (
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border-card/50">
            <Calendar className="size-4 text-text-muted shrink-0" />
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 rounded-lg bg-bg-input border border-border-input text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus transition-all"
              aria-label="Start date"
            />
            <span className="text-text-muted text-sm">—</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 rounded-lg bg-bg-input border border-border-input text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus transition-all"
              aria-label="End date"
            />
            <Button
              size="sm"
              onClick={() => {
                if (customStart && customEnd) {
                  setIsLoading(true);
                  void fetchData({ startDate: customStart, endDate: customEnd });
                } else {
                  toast.error("Please pick both start and end dates");
                }
              }}
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Inline empty state — keeps the preset switcher usable */}
      {isEmpty ? (
        <EmptyState
          icon={PieChart}
          title="No Financial Data in This Range"
          description="Try a different date range, or add income and expense transactions to unlock reports."
          actionLabel="Add a Transaction"
          onAction={() => navigate("/expenses")}
          iconColor="text-accent"
        />
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-reveal">
            {stats.map((stat) => (
              <div key={stat.title} className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-text-secondary">{stat.title}</span>
                  <div
                    className={clsx("size-10 rounded-xl flex items-center justify-center", stat.bg)}
                  >
                    <stat.icon className={clsx("size-5", stat.color)} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-text-primary tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 stagger-reveal">
            {/* Trend Chart */}
            <div className="lg:col-span-8 glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-text-primary">Spending Trend</h3>
                <Badge variant="default">{new Date().getFullYear()}</Badge>
              </div>
              {trendData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                  <TrendingDown className="size-10 text-text-muted/40" />
                  <p className="text-sm text-text-muted">No spending data for this year</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart accessibilityLayer data={trendData}>
                      <defs>
                        <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-chart-grid)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "var(--color-chart-axis)" }}
                        axisLine={{ stroke: "var(--color-chart-grid)" }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "var(--color-chart-axis)" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `$${v}`}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-bg-elevated)",
                          border: "1px solid var(--color-border-card)",
                          borderRadius: "12px",
                          color: "var(--color-text-primary)",
                          fontSize: "13px",
                          padding: "8px 12px",
                        }}
                        formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Spent"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10B981"
                        strokeWidth={2}
                        fill="url(#reportGrad)"
                        animationDuration={500}
                        animationEasing="ease-out"
                        isAnimationActive={!prefersReducedMotion}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Doughnut Chart */}
            <div className="lg:col-span-4 glass rounded-xl p-5">
              <h3 className="text-base font-semibold text-text-primary mb-4">
                Category Allocation
              </h3>
              {!hasCategoryData ? (
                <div className="flex flex-col items-center justify-center h-52 gap-3 text-center">
                  <PieChart className="size-10 text-text-muted/40" />
                  <p className="text-sm text-text-muted">No expenses categorized yet</p>
                </div>
              ) : (
                <>
                  <div className="relative h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie accessibilityLayer>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="label"
                          stroke="none"
                          animationDuration={500}
                          animationEasing="ease-out"
                          isAnimationActive={!prefersReducedMotion}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={`c-${i}`} fill={entry.color ?? "#6366F1"} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-bg-elevated)",
                            border: "1px solid var(--color-border-card)",
                            borderRadius: "12px",
                            color: "var(--color-text-primary)",
                            fontSize: "13px",
                          }}
                          formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, ""]}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-text-muted">Total</span>
                      <span className="text-base font-bold text-text-primary tabular-nums">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {pieData.slice(0, 6).map((e) => (
                      <div key={e.label} className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: e.color }}
                        />
                        <span className="text-xs text-text-secondary truncate">{e.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Performance Table */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-card">
              <h3 className="text-base font-semibold text-text-primary">Category Performance</h3>
            </div>
            {categories.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-text-muted">No category data in this period.</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 border-b border-border-card/50 text-xs font-medium text-text-muted uppercase tracking-wide">
                  <span>Category</span>
                  <span>Total Spent</span>
                  <span>Share %</span>
                  <span>Avg / Txn</span>
                  <span>Transactions</span>
                </div>
                {categories.map((cat) => {
                  const avg = cat.count > 0 ? (cat.total / cat.count).toFixed(2) : "0.00";
                  return (
                    <div
                      key={cat.categoryId}
                      className="grid grid-cols-2 sm:grid-cols-5 gap-x-2 sm:gap-x-4 gap-y-1 items-center px-5 py-3 border-b border-border-card/30 hover:bg-overlay/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.categoryColor }}
                        />
                        <span className="text-sm text-text-primary truncate">
                          {cat.categoryName}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-text-primary tabular-nums">
                        {formatCurrency(cat.total)}
                      </span>
                      <Badge variant="default">{cat.percentage}%</Badge>
                      <span className="text-sm text-text-secondary tabular-nums">${avg}</span>
                      <span className="text-sm text-text-secondary">{cat.count} txns</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Data"
        description="Download your financial data in your preferred format."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-text-secondary"
              id="export-format-label"
            >
              File Format
            </label>
            <div
              className="grid grid-cols-3 gap-3"
              role="radiogroup"
              aria-labelledby="export-format-label"
              onKeyDown={handleExportFormatKeyDown}
            >
              {EXPORT_FORMATS.map((fmt, i) => (
                <button
                  key={fmt.value}
                  type="button"
                  role="radio"
                  aria-checked={exportFormat === fmt.value}
                  tabIndex={exportFormat === fmt.value ? 0 : -1}
                  ref={(el) => {
                    exportFormatRefs.current[i] = el;
                  }}
                  onClick={() => setExportFormat(fmt.value)}
                  className={clsx(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    exportFormat === fmt.value
                      ? "border-primary bg-primary/5"
                      : "border-border-card hover:border-text-muted/30",
                  )}
                >
                  <fmt.icon
                    className={clsx(
                      "size-6",
                      exportFormat === fmt.value ? "text-primary" : "text-text-muted",
                    )}
                  />
                  <span
                    className={clsx(
                      "text-sm font-medium",
                      exportFormat === fmt.value ? "text-primary" : "text-text-secondary",
                    )}
                  >
                    {fmt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button
              leftIcon={<Download className="size-4" />}
              onClick={handleExportDownload}
              isLoading={exporting}
            >
              Download Export
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
