import React from "react";
import { clsx } from "clsx";
import {
  Receipt,
  Tags,
  CreditCard,
  Calculator,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import type { QuickStats } from "@/services/dashboard";

interface QuickStatsCardsProps {
  stats: QuickStats;
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

/**
 * Quick statistics grid — displays aggregate counts and extremes at a glance.
 */
export const QuickStatsCards: React.FC<QuickStatsCardsProps> = ({ stats }) => {
  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const items: StatItem[] = [
    {
      label: "Total Transactions",
      value: stats.totalTransactions.toLocaleString(),
      icon: <Receipt className="size-4" />,
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
    },
    {
      label: "Categories",
      value: stats.totalCategories.toLocaleString(),
      icon: <Tags className="size-4" />,
      iconBg: "bg-secondary/15",
      iconColor: "text-secondary",
    },
    {
      label: "Payment Methods",
      value: stats.totalPaymentMethods.toLocaleString(),
      icon: <CreditCard className="size-4" />,
      iconBg: "bg-accent/15",
      iconColor: "text-accent",
    },
    {
      label: "Avg Transaction",
      value: formatCurrency(stats.averageTransactionAmount),
      icon: <Calculator className="size-4" />,
      iconBg: "bg-info/15",
      iconColor: "text-info",
    },
    {
      label: "Largest Expense",
      value: formatCurrency(stats.largestExpense),
      icon: <ArrowDownCircle className="size-4" />,
      iconBg: "bg-warning/15",
      iconColor: "text-warning",
    },
    {
      label: "Largest Income",
      value: formatCurrency(stats.largestIncome),
      icon: <ArrowUpCircle className="size-4" />,
      iconBg: "bg-success/15",
      iconColor: "text-success",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={clsx(
            "glass rounded-xl p-4",
            "hover:shadow-hover hover:-translate-y-0.5 transition-all duration-150",
            "flex flex-col items-center text-center gap-2",
          )}
        >
          <div
            className={clsx(
              "size-9 rounded-lg flex items-center justify-center shrink-0",
              item.iconBg,
            )}
          >
            <span className={item.iconColor}>{item.icon}</span>
          </div>
          <div>
            <p className="text-lg font-bold text-text-primary tabular-nums leading-tight">
              {item.value}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5 whitespace-nowrap">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
