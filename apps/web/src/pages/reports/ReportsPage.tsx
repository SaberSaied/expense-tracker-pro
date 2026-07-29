import React, { useState } from "react";
import {
  DollarSign,
  Calendar,
  PieChart,
  Hash,
  Download,
  FileText,
  FileJson,
  File,
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
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { clsx } from "clsx";
import {
  MOCK_SUMMARY,
  MOCK_CATEGORY_CHART,
  MOCK_SPENDING_TREND,
} from "@/data";

const DATE_PRESETS = [
  "This Month",
  "Last Month",
  "Last 3 Months",
  "Year-to-Date",
  "Custom",
];

/**
 * Reports & Analytics page — financial intelligence dashboard.
 * Route: /reports
 */
export const ReportsPage: React.FC = () => {
  const [activePreset, setActivePreset] = useState("This Month");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");

  const summary = MOCK_SUMMARY;

  const stats = [
    { title: "Total Spent", value: `$${summary.totalSpent.toLocaleString()}`, icon: DollarSign, bg: "bg-warning/15", color: "text-warning" },
    { title: "Daily Average", value: `$${summary.dailyAverage.toFixed(2)}`, icon: Calendar, bg: "bg-success/15", color: "text-success" },
    { title: "Top Category", value: summary.topCategory, icon: PieChart, bg: "bg-secondary/15", color: "text-secondary" },
    { title: "Total Transactions", value: `${summary.totalTransactions}`, icon: Hash, bg: "bg-accent/15", color: "text-accent" },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Financial Analytics
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Insights into your spending patterns
          </p>
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
              onClick={() => setActivePreset(preset)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                activePreset === preset
                  ? "bg-primary text-text-inverse"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5",
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">{stat.title}</span>
              <div className={clsx("size-10 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={clsx("size-5", stat.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-8 glass rounded-xl p-5">
          <h3 className="text-base font-semibold text-text-primary mb-4">
            Spending Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_SPENDING_TREND}>
                <defs>
                  <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}`} width={50} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(217,33%,17%)", border: "1px solid hsl(215,25%,27%)", borderRadius: "12px", color: "hsl(210,40%,98%)", fontSize: "13px", padding: "8px 12px" }} formatter={(value: any) => [`$${Number(value ?? 0).toFixed(2)}`, "Spent"]} />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#reportGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="lg:col-span-4 glass rounded-xl p-5">
          <h3 className="text-base font-semibold text-text-primary mb-4">
            Category Allocation
          </h3>
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={MOCK_CATEGORY_CHART} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="label" stroke="none">
                  {MOCK_CATEGORY_CHART.map((entry, i) => (
                    <Cell key={`c-${i}`} fill={entry.color ?? "#6366F1"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(217,33%,17%)", border: "1px solid hsl(215,25%,27%)", borderRadius: "12px", color: "hsl(210,40%,98%)", fontSize: "13px" }} formatter={(value: any) => [`$${Number(value ?? 0).toFixed(2)}`, ""]} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {MOCK_CATEGORY_CHART.slice(0, 6).map((e) => (
              <div key={e.label} className="flex items-center gap-2">
                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                <span className="text-xs text-text-secondary truncate">{e.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-card">
          <h3 className="text-base font-semibold text-text-primary">
            Category Performance
          </h3>
        </div>
        <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 border-b border-border-card/50 text-xs font-medium text-text-muted uppercase tracking-wide">
          <span>Category</span>
          <span>Total Spent</span>
          <span>Share %</span>
          <span>Avg / Txn</span>
          <span>Transactions</span>
        </div>
        {MOCK_CATEGORY_CHART.map((cat) => {
          const share = ((cat.value / summary.totalSpent) * 100).toFixed(1);
          const txnCount = Math.max(1, Math.round(cat.value / (30 + Math.random() * 100)));
          const avg = (cat.value / txnCount).toFixed(2);
          return (
            <div key={cat.label} className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 items-center px-5 py-3 border-b border-border-card/30 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-text-primary">{cat.label}</span>
              </div>
              <span className="text-sm font-semibold text-text-primary tabular-nums">
                ${cat.value.toLocaleString()}
              </span>
              <Badge variant="default">{share}%</Badge>
              <span className="text-sm text-text-secondary tabular-nums">${avg}</span>
              <span className="text-sm text-text-secondary">{txnCount} txns</span>
            </div>
          );
        })}
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Data"
        description="Download your financial data in your preferred format."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              File Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "csv", label: "CSV", icon: FileText },
                { value: "pdf", label: "PDF", icon: File },
                { value: "json", label: "JSON", icon: FileJson },
              ].map((fmt) => (
                <button
                  key={fmt.value}
                  type="button"
                  onClick={() => setExportFormat(fmt.value)}
                  className={clsx(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    exportFormat === fmt.value
                      ? "border-primary bg-primary/5"
                      : "border-border-card hover:border-text-muted/30",
                  )}
                >
                  <fmt.icon className={clsx("size-6", exportFormat === fmt.value ? "text-primary" : "text-text-muted")} />
                  <span className={clsx("text-sm font-medium", exportFormat === fmt.value ? "text-primary" : "text-text-secondary")}>{fmt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button leftIcon={<Download className="size-4" />}>
              Download Export
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
