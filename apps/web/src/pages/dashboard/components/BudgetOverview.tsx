import React from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Budget } from "@/types";

interface BudgetOverviewProps {
  budgets: Budget[];
}

/**
 * Budget progress bars widget showing spending against category limits.
 */
export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgets }) => {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-base font-semibold text-text-primary mb-4">
        Budget Status
      </h3>
      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = Math.round(
            (budget.spentAmount / budget.targetAmount) * 100,
          );
          return (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-text-secondary">
                  {budget.categoryName}
                </span>
                <span className="text-xs text-text-muted tabular-nums">
                  ${budget.spentAmount.toLocaleString()} / $
                  {budget.targetAmount.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={budget.spentAmount}
                max={budget.targetAmount}
                size="sm"
                label={`${budget.categoryName} budget`}
              />
              <p className="text-[11px] text-text-muted mt-1">
                {percentage}% used
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
