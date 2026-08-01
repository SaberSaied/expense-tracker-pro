import React, { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { toast } from "sonner";
import { Target, Pencil, RefreshCw, CalendarDays, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { budgetsApi } from "@/services/budgets";
import { categoriesApi } from "@/services/categories";
import { ApiError } from "@/services/api";
import type { ApiBudget, BudgetProgressSummary, BudgetPeriod } from "@/services/budgets";
import type { ApiCategory } from "@/services/categories";

const PERIOD_OPTIONS: { value: BudgetPeriod; label: string }[] = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
];

const ALERT_THRESHOLD_OPTIONS = [
  { value: "75", label: "75% — Early Warning" },
  { value: "80", label: "80% — Standard" },
  { value: "90", label: "90% — Late Warning" },
];

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

function deriveStatus(progress: number): "normal" | "warning" | "critical" {
  if (progress >= 100) return "critical";
  if (progress >= 80) return "warning";
  return "normal";
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Budgets page — category-based spending limits with progress indicators.
 * Fetches real budget data with progress summary and full CRUD.
 * Route: /budgets
 */
export const BudgetsPage: React.FC = () => {
  // ─── Data state ──────────────────────────────────────────
  const [summary, setSummary] = useState<BudgetProgressSummary | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Modal state ─────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<ApiBudget | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Form state ──────────────────────────────────────────
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formThreshold, setFormThreshold] = useState("80");
  const [formPeriod, setFormPeriod] = useState<BudgetPeriod>("MONTHLY");
  const [formStartDate, setFormStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });

  const fetchData = useCallback(async () => {
    try {
      const [summaryData, categoryData] = await Promise.all([
        budgetsApi.getProgressSummary(),
        categoriesApi.findAll(),
      ]);
      setSummary(summaryData);
      setCategories(categoryData);
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load budgets";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const [summaryData, categoryData] = await Promise.all([
          budgetsApi.getProgressSummary(),
          categoriesApi.findAll(),
        ]);
        if (ignore) return;
        setSummary(summaryData);
        setCategories(categoryData);
        setError(null);
      } catch (err) {
        if (ignore) return;
        const message = err instanceof ApiError ? err.message : "Failed to load budgets";
        setError(message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // ─── Modal helpers ───────────────────────────────────────
  const openCreateModal = () => {
    setSelectedBudget(null);
    setFormCategoryId("");
    setFormAmount("");
    setFormThreshold("80");
    setFormPeriod("MONTHLY");
    const now = new Date();
    setFormStartDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
    setShowEditModal(true);
  };

  const openEditModal = (budget: ApiBudget) => {
    setSelectedBudget(budget);
    setFormCategoryId(budget.category.id);
    setFormAmount(String(budget.targetAmount));
    setFormThreshold(String(budget.alertThreshold ?? 80));
    setFormPeriod(budget.period);
    setFormStartDate(budget.startDate.slice(0, 10));
    setShowEditModal(true);
  };

  const openDeleteDialog = (budget: ApiBudget) => {
    setSelectedBudget(budget);
    setShowDeleteDialog(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(formAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }
    if (!formCategoryId) {
      toast.error("Please select a category");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        targetAmount: amount,
        alertThreshold: Number(formThreshold),
        period: formPeriod,
        startDate: formStartDate,
      };
      if (selectedBudget) {
        await budgetsApi.update(selectedBudget.id, payload);
        toast.success("Budget updated");
      } else {
        await budgetsApi.create({ ...payload, categoryId: formCategoryId });
        toast.success("Budget created");
      }
      setShowEditModal(false);
      await fetchData();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save budget";
      toast.error("Save failed", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBudget || deleteLoading) return;
    setDeleteLoading(true);
    try {
      await budgetsApi.delete(selectedBudget.id);
      toast.success(`Budget for ${selectedBudget.category.name} deleted`);
      setShowDeleteDialog(false);
      setSelectedBudget(null);
      await fetchData();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete budget";
      toast.error("Delete failed", { description: message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  // ─── Loading state ───────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56 mt-2" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        {/* Overall summary skeleton */}
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-2.5 w-full rounded-full" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-5 w-20 mx-auto mt-1.5" />
              </div>
            ))}
          </div>
        </div>
        {/* Budget cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-reveal">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="size-11 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-2 w-full rounded-full mb-4" />
              <Skeleton className="h-8 w-40" />
            </div>
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
          title="Failed to Load Budgets"
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

  // ─── Empty state ─────────────────────────────────────────
  if (!summary || summary.totalBudgets === 0) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
        <EmptyState
          icon={Target}
          title="No Budgets Configured"
          description="Set category budget limits to track your monthly spending."
          actionLabel="+ Set Category Budget"
          onAction={openCreateModal}
          iconColor="text-accent"
        />
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Set Category Budget"
          description="Define a monthly spending cap for a category."
        >
          <BudgetForm
            categoryOptions={categoryOptions}
            formCategoryId={formCategoryId}
            setFormCategoryId={setFormCategoryId}
            formAmount={formAmount}
            setFormAmount={setFormAmount}
            formThreshold={formThreshold}
            setFormThreshold={setFormThreshold}
            formPeriod={formPeriod}
            setFormPeriod={setFormPeriod}
            formStartDate={formStartDate}
            setFormStartDate={setFormStartDate}
            submitting={submitting}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowEditModal(false)}
            isEdit={false}
          />
        </Modal>
      </div>
    );
  }

  // ─── Data state ──────────────────────────────────────────
  const { overallProgress, totalBudgeted, totalSpent, totalRemaining, activeBudgets } = summary;

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title font-bold text-text-primary">Budgets</h2>
          <p className="text-sm text-text-secondary mt-1">Monthly category spending limits</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              void fetchData();
            }}
            aria-label="Refresh budgets"
            leftIcon={<RefreshCw className="size-4" />}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" leftIcon={<Target className="size-4" />} onClick={openCreateModal}>
            Set Budget
          </Button>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-text-primary">Overall Monthly Budget</h3>
          <Badge
            variant={
              overallProgress >= 90 ? "error" : overallProgress >= 70 ? "warning" : "success"
            }
            dot
          >
            {overallProgress}% Used
          </Badge>
        </div>
        <p className="text-sm text-text-secondary mb-3">
          Spent:{" "}
          <span className="font-semibold text-text-primary tabular-nums">
            {formatCurrency(totalSpent)}
          </span>
          {" / "}
          Limit:{" "}
          <span className="font-semibold text-text-primary tabular-nums">
            {formatCurrency(totalBudgeted)}
          </span>
        </p>
        <ProgressBar value={totalSpent} max={totalBudgeted || 1} size="md" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-border-card/50">
          <div className="text-center">
            <p className="text-[11px] text-text-muted uppercase tracking-wider">Active</p>
            <p className="text-lg font-bold text-text-primary tabular-nums">{activeBudgets}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-text-muted uppercase tracking-wider">Total</p>
            <p className="text-lg font-bold text-text-primary tabular-nums">
              {summary.totalBudgets}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-text-muted uppercase tracking-wider">Remaining</p>
            <p className="text-lg font-bold text-success tabular-nums">
              {formatCurrency(totalRemaining)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-text-muted uppercase tracking-wider">Avg / Budget</p>
            <p className="text-lg font-bold text-text-primary tabular-nums">
              {formatCurrency(summary.totalBudgets > 0 ? totalSpent / summary.totalBudgets : 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-reveal">
        {summary.budgets.map((budget) => {
          const status = deriveStatus(budget.progress);
          return (
            <div
              key={budget.id}
              className="glass rounded-xl p-5 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-150"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="size-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${budget.category.color}20` }}
                >
                  <span className="text-lg font-bold" style={{ color: budget.category.color }}>
                    {budget.category.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary truncate">
                    {budget.category.name}
                  </h3>
                  <Badge variant={statusVariant[status]} dot>
                    {statusLabel[status]}
                  </Badge>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-text-muted flex items-center gap-1 justify-end">
                    <CalendarDays className="size-3" />
                    {budget.period === "MONTHLY"
                      ? new Date(budget.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : budget.period.charAt(0) + budget.period.slice(1).toLowerCase()}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {budget.daysRemaining > 0
                      ? `${budget.daysRemaining} day${budget.daysRemaining !== 1 ? "s" : ""} left`
                      : "Period ended"}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-text-secondary">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.targetAmount)}
                  </span>
                  <span
                    className={clsx(
                      "font-semibold tabular-nums",
                      status === "critical"
                        ? "text-error"
                        : status === "warning"
                          ? "text-warning"
                          : "text-success",
                    )}
                  >
                    {budget.progress}%
                  </span>
                </div>
                <ProgressBar
                  value={budget.spent}
                  max={budget.targetAmount || 1}
                  size="sm"
                  color={
                    status === "critical"
                      ? "bg-error"
                      : status === "warning"
                        ? "bg-warning"
                        : "bg-success"
                  }
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border-card/50">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Pencil className="size-3.5" />}
                  onClick={() => openEditModal(budget)}
                >
                  Edit Limit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error/70 hover:text-error"
                  onClick={() => openDeleteDialog(budget)}
                >
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Budget Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={selectedBudget ? "Edit Budget Limit" : "Set Category Budget"}
        description="Define a spending cap for a category and its period."
      >
        <BudgetForm
          categoryOptions={categoryOptions}
          formCategoryId={formCategoryId}
          setFormCategoryId={setFormCategoryId}
          formAmount={formAmount}
          setFormAmount={setFormAmount}
          formThreshold={formThreshold}
          setFormThreshold={setFormThreshold}
          formPeriod={formPeriod}
          setFormPeriod={setFormPeriod}
          formStartDate={formStartDate}
          setFormStartDate={setFormStartDate}
          submitting={submitting}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowEditModal(false)}
          isEdit={!!selectedBudget}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={`Delete budget for "${selectedBudget?.category.name ?? ""}"?`}
        description="This will permanently remove the budget limit. You can create a new one at any time."
        confirmLabel="Delete Budget"
        isLoading={deleteLoading}
      />
    </div>
  );
};

// ─── Budget Form ────────────────────────────────────────────

interface BudgetFormProps {
  categoryOptions: { value: string; label: string }[];
  formCategoryId: string;
  setFormCategoryId: (v: string) => void;
  formAmount: string;
  setFormAmount: (v: string) => void;
  formThreshold: string;
  setFormThreshold: (v: string) => void;
  formPeriod: BudgetPeriod;
  setFormPeriod: (v: BudgetPeriod) => void;
  formStartDate: string;
  setFormStartDate: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEdit: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  categoryOptions,
  formCategoryId,
  setFormCategoryId,
  formAmount,
  setFormAmount,
  formThreshold,
  setFormThreshold,
  formPeriod,
  setFormPeriod,
  formStartDate,
  setFormStartDate,
  submitting,
  onSubmit,
  onCancel,
  isEdit,
}) => (
  <form className="space-y-4" onSubmit={onSubmit}>
    <Select
      label="Category"
      options={categoryOptions}
      placeholder="Select category"
      value={formCategoryId}
      onChange={(e) => setFormCategoryId(e.target.value)}
      disabled={isEdit}
      required
    />
    <Input
      label="Budget Amount ($)"
      type="number"
      placeholder="1000.00"
      step="0.01"
      min="0"
      value={formAmount}
      onChange={(e) => setFormAmount(e.target.value)}
      required
    />
    <Select
      label="Period"
      options={PERIOD_OPTIONS}
      value={formPeriod}
      onChange={(e) => setFormPeriod(e.target.value as BudgetPeriod)}
    />
    <Input
      label="Start Date"
      type="date"
      value={formStartDate}
      onChange={(e) => setFormStartDate(e.target.value)}
      required
    />
    <Select
      label="Alert Threshold"
      options={ALERT_THRESHOLD_OPTIONS}
      value={formThreshold}
      onChange={(e) => setFormThreshold(e.target.value)}
    />
    <div className="flex justify-end gap-3 pt-2">
      <Button variant="ghost" type="button" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" isLoading={submitting}>
        {isEdit ? "Update Limit" : "Set Budget"}
      </Button>
    </div>
  </form>
);
