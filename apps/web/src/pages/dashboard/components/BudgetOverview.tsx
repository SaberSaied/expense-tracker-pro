import React from "react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { BudgetStatus } from "@/services/dashboard";

interface BudgetOverviewProps {
  budgets: BudgetStatus[];
}

/**
 * Budget progress bars widget showing spending against category limits.
 * Displays active budgets with progress, remaining amounts, and overspent alerts.
 */
export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgets }) => {
  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const activeBudgets = budgets.filter((b) => b.budgeted > 0);
  const overspentBudgets = activeBudgets.filter((b) => b.remaining < 0);
  const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-base font-semibold text-text-primary mb-1">
        Budget Status
      </h3>

      {activeBudgets.length === 0 && (
        <p className="text-sm text-text-muted py-6 text-center">
          No budgets set yet.{' '}
          <Link
            to="/budgets"
            className="text-primary hover:text-primary-hover transition-colors"
          >
            Create your first budget
          </Link>
        </p>
      )}

      {activeBudgets.length > 0 && (
        <>
          {/* Overall summary */}
          <div className="flex items-center justify-between mt-3 mb-4 p-3 rounded-lg bg-overlay/3">
            <div className="space-y-0.5">
              <p className="text-xs text-text-muted">Total Budgeted</p>
              <p className="text-sm font-semibold text-text-primary tabular-nums">
                {formatCurrency(totalBudgeted)}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-xs text-text-muted">Total Spent</p>
              <p className="text-sm font-semibold text-text-primary tabular-nums">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-xs text-text-muted">Remaining</p>
              <p
                className={clsx(
                  "text-sm font-semibold tabular-nums",
                  totalBudgeted - totalSpent >= 0
                    ? "text-success"
                    : "text-error",
                )}
              >
                {formatCurrency(totalBudgeted - totalSpent)}
              </p>
            </div>
          </div>

          {/* Overspent alert banner */}
          {overspentBudgets.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20">
              <p className="text-xs font-medium text-error">
                {overspentBudgets.length === 1
                  ? `1 budget is overspent`
                  : `${overspentBudgets.length} budgets are overspent`}
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {overspentBudgets.map((b) => (
                  <li
                    key={b.categoryId}
                    className="text-[11px] text-text-muted flex items-center gap-1"
                  >
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: b.categoryColor }}
                    />
                    {b.categoryName} —{' '}
                    <span className="text-error font-medium">
                      {formatCurrency(Math.abs(b.remaining))} over
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Individual budget bars */}
          <div className="space-y-4">
            {activeBudgets.map((budget) => (
              <div key={budget.categoryId}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: budget.categoryColor }}
                    />
                    <span className="text-sm text-text-secondary truncate">
                      {budget.categoryName}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted tabular-nums whitespace-nowrap ml-2">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
                  </span>
                </div>
                <ProgressBar
                  value={budget.spent}
                  max={budget.budgeted}
                  size="sm"
                  label={`${budget.categoryName} budget`}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-text-muted">
                    {budget.percentage}% used
                  </span>
                  {budget.remaining >= 0 ? (
                    <span className="text-[11px] text-success">
                      {formatCurrency(budget.remaining)} left
                    </span>
                  ) : (
                    <span className="text-[11px] text-error font-medium">
                      {formatCurrency(Math.abs(budget.remaining))} over
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
