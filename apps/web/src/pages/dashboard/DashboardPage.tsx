import React from "react";
import { DollarSign, Calendar, PieChart, Target } from "lucide-react";
import { StatCard } from "./components/StatCard";
import { CategoryChart } from "./components/CategoryChart";
import { SpendingTrend } from "./components/SpendingTrend";
import { BudgetOverview } from "./components/BudgetOverview";
import { RecentTransactions } from "./components/RecentTransactions";
import {
  MOCK_SUMMARY,
  MOCK_CATEGORY_CHART,
  MOCK_SPENDING_TREND,
  MOCK_BUDGETS,
  MOCK_TRANSACTIONS,
} from "@/data";

/**
 * Primary Dashboard page — financial overview with KPIs, charts, budgets, and recent transactions.
 * Route: /dashboard
 */
export const DashboardPage: React.FC = () => {
  const summary = MOCK_SUMMARY;

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Monthly Spent"
          value={`$${summary.totalSpent.toLocaleString()}`}
          subtext={`+${summary.trendPercentage}% vs last month`}
          icon={DollarSign}
          trend="up"
          iconBg="bg-warning/15"
          iconColor="text-warning"
        />
        <StatCard
          title="Daily Average"
          value={`$${summary.dailyAverage.toFixed(2)}`}
          subtext="-1.8% vs last month"
          icon={Calendar}
          trend="down"
          iconBg="bg-success/15"
          iconColor="text-success"
        />
        <StatCard
          title="Top Category"
          value={summary.topCategory}
          subtext={`${summary.topCategoryPercentage}% of total`}
          icon={PieChart}
          trend="neutral"
          iconBg="bg-secondary/15"
          iconColor="text-secondary"
        />
        <StatCard
          title="Remaining Budget"
          value={`$${summary.remainingBudget.toLocaleString()}`}
          subtext={`${summary.budgetUsedPercentage}% of $4,500 used`}
          icon={Target}
          trend="neutral"
          iconBg="bg-accent/15"
          iconColor="text-accent"
        />
      </div>

      {/* Charts & Budget Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SpendingTrend data={MOCK_SPENDING_TREND} />
        </div>
        <div className="lg:col-span-4">
          <CategoryChart data={MOCK_CATEGORY_CHART} totalSpent={summary.totalSpent} />
        </div>
      </div>

      {/* Budget Overview & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <BudgetOverview budgets={MOCK_BUDGETS} />
        </div>
        <div className="lg:col-span-8">
          <RecentTransactions transactions={MOCK_TRANSACTIONS} />
        </div>
      </div>
    </div>
  );
};
