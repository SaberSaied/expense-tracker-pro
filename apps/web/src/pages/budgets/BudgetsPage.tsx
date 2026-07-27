import React, { useState } from "react";
import { clsx } from "clsx";
import { Target, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_BUDGETS, MOCK_CATEGORIES } from "@/data";
import type { Budget } from "@/types";

const statusVariant: Record<string, "success" | "warning" | "error"> = {
  normal: "success",
  warning: "warning",
  critical: "error",
};

const statusLabel: Record<string, string> = {
  normal: "Normal",
  warning: "Amber Alert",
  critical: "Critical Limit",
};

/**
 * Budgets page — category-based spending limits with progress indicators.
 * Route: /budgets
 */
export const BudgetsPage: React.FC = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const totalSpent = MOCK_BUDGETS.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalLimit = MOCK_BUDGETS.reduce((sum, b) => sum + b.targetAmount, 0);
  const overallPercentage = Math.round((totalSpent / totalLimit) * 100);

  const categoryOptions = MOCK_CATEGORIES.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Budgets</h2>
          <p className="text-sm text-text-secondary mt-1">
            Monthly category spending limits
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">July 2026</span>
          <Button size="sm" leftIcon={<Target className="size-4" />} onClick={() => { setSelectedBudget(null); setShowEditModal(true); }}>
            Set Budget
          </Button>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-text-primary">
            Overall Monthly Budget
          </h3>
          <Badge variant={overallPercentage >= 90 ? "error" : overallPercentage >= 70 ? "warning" : "success"} dot>
            {overallPercentage}% Used
          </Badge>
        </div>
        <p className="text-sm text-text-secondary mb-3">
          Spent: <span className="font-semibold text-text-primary tabular-nums">${totalSpent.toLocaleString()}</span>
          {" / "}
          Limit: <span className="font-semibold text-text-primary tabular-nums">${totalLimit.toLocaleString()}</span>
        </p>
        <ProgressBar value={totalSpent} max={totalLimit} size="md" />
      </div>

      {/* Budget Cards */}
      {MOCK_BUDGETS.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Budgets Configured"
          description="Set category budget limits to track your monthly spending."
          actionLabel="+ Set Category Budget"
          onAction={() => setShowEditModal(true)}
          iconColor="text-accent"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_BUDGETS.map((budget) => {
            const pct = Math.round((budget.spentAmount / budget.targetAmount) * 100);
            return (
              <div key={budget.id} className="glass rounded-xl p-5 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-150">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="size-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${budget.categoryColor}20` }}
                  >
                    <span className="text-lg font-bold" style={{ color: budget.categoryColor }}>
                      {budget.categoryName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {budget.categoryName}
                    </h3>
                    <Badge variant={statusVariant[budget.status]} dot>
                      {statusLabel[budget.status]}
                    </Badge>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-text-secondary">
                      ${budget.spentAmount.toLocaleString()} / ${budget.targetAmount.toLocaleString()}
                    </span>
                    <span className={clsx(
                      "font-semibold tabular-nums",
                      pct >= 90 ? "text-error" : pct >= 70 ? "text-warning" : "text-success",
                    )}>
                      {pct}%
                    </span>
                  </div>
                  <ProgressBar value={budget.spentAmount} max={budget.targetAmount} size="sm" />
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border-card/50">
                  <Button variant="ghost" size="sm" leftIcon={<Eye className="size-3.5" />}>
                    View Txns
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Pencil className="size-3.5" />}
                    onClick={() => { setSelectedBudget(budget); setShowEditModal(true); }}
                  >
                    Edit Limit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Budget Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={selectedBudget ? "Edit Budget Limit" : "Set Category Budget"}
        description="Define a monthly spending cap for a category."
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowEditModal(false); }}>
          <Select
            label="Category"
            options={categoryOptions}
            placeholder="Select category"
            defaultValue={selectedBudget?.categoryId}
            required
          />
          <Input
            label="Monthly Limit ($)"
            type="number"
            placeholder="1000.00"
            step="0.01"
            min="1"
            defaultValue={selectedBudget?.targetAmount.toString()}
            required
          />
          <Select
            label="Alert Threshold"
            options={[
              { value: "75", label: "75% — Early Warning" },
              { value: "80", label: "80% — Standard" },
              { value: "90", label: "90% — Late Warning" },
            ]}
            defaultValue={selectedBudget?.alertThreshold.toString() ?? "80"}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedBudget ? "Update Limit" : "Set Budget"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
