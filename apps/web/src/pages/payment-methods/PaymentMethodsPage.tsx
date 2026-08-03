import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import { toast } from "sonner";
import { Plus, CreditCard, Pencil, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { paymentMethodsApi } from "@/services/payment-methods";
import { ApiError } from "@/services/api";
import type { ApiPaymentMethod } from "@/services/payment-methods";

const PAYMENT_TYPE_OPTIONS = [
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "DIGITAL_WALLET", label: "Digital Wallet" },
];

const COLOR_PALETTE = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#F43F5E",
  "#6366F1",
  "#14B8A6",
  "#D946EF",
  "#EAB308",
  "#06B6D4",
  "#A855F7",
  "#F97316",
  "#22C55E",
  "#64748B",
  "#94A3B8",
];

const ICON_OPTIONS = [
  { value: "CreditCard", label: "Credit Card" },
  { value: "Wallet", label: "Wallet" },
  { value: "Building2", label: "Bank" },
  { value: "Landmark", label: "Landmark" },
  { value: "Smartphone", label: "Phone" },
  { value: "Banknote", label: "Cash" },
  { value: "CircleDollarSign", label: "Dollar" },
  { value: "PiggyBank", label: "Savings" },
  { value: "Shield", label: "Shield" },
  { value: "Zap", label: "Lightning" },
  { value: "Vault", label: "Vault" },
  { value: "BadgeCheck", label: "Verified" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string | null): string {
  if (!iso) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

/**
 * Payment Methods page — manage saved payment methods.
 * Route: /payment-methods
 */
export const PaymentMethodsPage: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<ApiPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<ApiPaymentMethod | null>(null);

  const [formType, setFormType] = useState<ApiPaymentMethod["type"]>("CREDIT_CARD");
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("CreditCard");
  const [formColor, setFormColor] = useState(COLOR_PALETTE[0]);
  const [formLastFour, setFormLastFour] = useState("");
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodsApi.findAll();
      setPaymentMethods(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load payment methods";
      toast.error("Load failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const openCreateModal = () => {
    setSelectedPaymentMethod(null);
    setFormType("CREDIT_CARD");
    setFormName("");
    setFormIcon("CreditCard");
    setFormColor(COLOR_PALETTE[0]);
    setFormLastFour("");
    setFormIsDefault(false);
    setShowModal(true);
  };

  const openEditModal = (pm: ApiPaymentMethod) => {
    setSelectedPaymentMethod(pm);
    setFormType(pm.type);
    setFormName(pm.name);
    setFormIcon(pm.icon);
    setFormColor(pm.color);
    setFormLastFour(pm.lastFour ?? "");
    setFormIsDefault(pm.isDefault);
    setShowModal(true);
  };

  // Opens the transaction-statistics details modal for a payment method.
  // Shared by the card click and keyboard activation handlers.
  const openDetails = async (pm: ApiPaymentMethod) => {
    setDetailsLoading(true);
    setShowDetailsModal(true);
    try {
      const details = await paymentMethodsApi.findById(pm.id);
      setSelectedPaymentMethod(details);
    } catch {
      setSelectedPaymentMethod(pm);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast.error("Payment method name is required");
      return;
    }

    setFormSubmitting(true);
    try {
      if (selectedPaymentMethod) {
        await paymentMethodsApi.update(selectedPaymentMethod.id, {
          type: formType,
          name: formName.trim(),
          icon: formIcon,
          color: formColor,
          lastFour: formLastFour || null,
          isDefault: formIsDefault,
        });
        toast.success("Payment method updated");
      } else {
        await paymentMethodsApi.create({
          type: formType,
          name: formName.trim(),
          icon: formIcon,
          color: formColor,
          lastFour: formLastFour || null,
          isDefault: formIsDefault,
        });
        toast.success("Payment method created");
      }
      setShowModal(false);
      await fetchPaymentMethods();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save payment method";
      toast.error("Save failed", { description: message });
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDeleteDialog = (pm: ApiPaymentMethod) => {
    setSelectedPaymentMethod(pm);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedPaymentMethod || deleteLoading) return;

    setDeleteLoading(true);
    try {
      await paymentMethodsApi.delete(selectedPaymentMethod.id);
      toast.success(`Payment method "${selectedPaymentMethod.name}" deleted`);
      setShowDeleteDialog(false);
      setSelectedPaymentMethod(null);
      await fetchPaymentMethods();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete payment method";
      toast.error("Delete failed", { description: message });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-60 mt-2" />
          </div>
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-reveal">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="size-11 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title font-bold text-text-primary">Payment Methods</h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage your saved credit cards, bank accounts, and payment options
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="size-4" />} onClick={openCreateModal}>
          Add Payment Method
        </Button>
      </div>

      {/* Payment Methods Grid */}
      {paymentMethods.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Payment Methods Yet"
          description="Add your credit cards, bank accounts, or digital wallets for faster transaction entry."
          actionLabel="+ Add Payment Method"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-reveal">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="glass rounded-xl p-5 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-150 group cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`View details for ${pm.name}`}
              onClick={() => void openDetails(pm)}
              onKeyDown={(e) => {
                // Only activate when the card itself (not a nested button like
                // Edit/Delete) has focus — prevents opening two modals at once.
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void openDetails(pm);
                }
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="size-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${pm.color}20` }}
                >
                  <CategoryIcon name={pm.icon} size={22} style={{ color: pm.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary truncate flex items-center gap-2">
                    {pm.name}
                    {pm.isDefault && (
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {PAYMENT_TYPE_OPTIONS.find((o) => o.value === pm.type)?.label ?? pm.type}
                    {pm.lastFour && ` ••••${pm.lastFour}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border-card/50">
                <span className="text-xs text-text-muted">
                  {pm._count?.transactions ?? 0} transaction
                  {(pm._count?.transactions ?? 0) !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Pencil className="size-3.5" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(pm);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error/70 hover:text-error"
                    leftIcon={<Trash2 className="size-3.5" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(pm);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedPaymentMethod ? "Edit Payment Method" : "Add Payment Method"}
        description="Add your credit card, bank account, or digital wallet details."
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <Select
            label="Type"
            options={PAYMENT_TYPE_OPTIONS}
            placeholder="Select type"
            value={formType}
            onChange={(e) => setFormType(e.target.value as ApiPaymentMethod["type"])}
            required
          />

          <Input
            label="Name"
            type="text"
            placeholder="e.g. Chase Sapphire, Personal Checking"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          {/* Color Picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Color</label>
            <div className="flex items-center gap-3">
              <div
                className="size-9 rounded-lg shrink-0 border border-border-card"
                style={{ backgroundColor: formColor }}
                aria-hidden="true"
              />
              <input
                type="text"
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                placeholder="#3B82F6"
                aria-label="Color (hex code)"
                pattern="^#[0-9a-fA-F]{6}$"
                maxLength={7}
                className={clsx(
                  "flex-1 rounded-lg border bg-bg-app px-3 py-2 text-sm font-mono tabular-nums",
                  "text-text-primary placeholder:text-text-muted/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all",
                  /^#[0-9a-fA-F]{6}$/.test(formColor)
                    ? "border-border-card"
                    : "border-error/50 ring-1 ring-error/30",
                )}
              />
            </div>
            <p className="text-xs text-text-muted mt-2 mb-2">Suggested palette</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((color) => {
                const isSelected = formColor.toUpperCase() === color.toUpperCase();
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormColor(color)}
                    className={clsx(
                      "size-8 rounded-full transition-all",
                      isSelected
                        ? "ring-2 ring-offset-2 ring-offset-bg-app ring-primary scale-110"
                        : "hover:scale-110",
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={"Select color " + color}
                    aria-pressed={isSelected}
                  />
                );
              })}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Icon</label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {ICON_OPTIONS.map((opt) => {
                const isSelected = formIcon === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormIcon(opt.value)}
                    className={clsx(
                      "flex flex-col items-center gap-1 rounded-xl p-2.5 transition-all",
                      isSelected
                        ? "bg-primary/15 ring-2 ring-primary ring-offset-1 ring-offset-bg-app scale-105"
                        : "hover:bg-overlay/5 hover:scale-105",
                    )}
                    title={opt.label}
                    aria-label={"Select icon: " + opt.label}
                    aria-pressed={isSelected}
                  >
                    <CategoryIcon
                      name={opt.value}
                      size={22}
                      className={isSelected ? "text-primary" : "text-text-secondary"}
                    />
                    {isSelected && <Check className="size-3 text-primary" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Last 4 Digits (optional)"
            type="text"
            placeholder="1234"
            maxLength={4}
            pattern="[0-9]{0,4}"
            value={formLastFour}
            onChange={(e) => setFormLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />

          <Checkbox
            label="Set as default payment method"
            checked={formIsDefault}
            onChange={(e) => setFormIsDefault(e.target.checked)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={formSubmitting}>
              {selectedPaymentMethod ? "Save Changes" : "Add Payment Method"}
            </Button>
          </div>
        </form>
      </Modal>
      {/* Transaction Statistics Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedPaymentMethod(null);
        }}
        title={selectedPaymentMethod?.name ?? "Payment Method Details"}
        description="Transaction history and usage statistics for this payment method."
      >
        {detailsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : selectedPaymentMethod?.stats ? (
          <div className="space-y-5">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-success/10 rounded-xl p-4">
                <p className="text-xs text-success font-medium mb-1">Total Income</p>
                <p className="text-lg font-bold text-success">
                  {formatCurrency(selectedPaymentMethod.stats.totalIncome)}
                </p>
              </div>
              <div className="bg-error/10 rounded-xl p-4">
                <p className="text-xs text-error font-medium mb-1">Total Expenses</p>
                <p className="text-lg font-bold text-error">
                  {formatCurrency(selectedPaymentMethod.stats.totalExpense)}
                </p>
              </div>
            </div>

            {/* Net Amount */}
            <div
              className={`rounded-xl p-4 ${selectedPaymentMethod.stats.netAmount >= 0 ? "bg-primary/5" : "bg-error/5"}`}
            >
              <p className="text-xs text-text-secondary font-medium mb-1">Net Balance Impact</p>
              <p
                className={`text-lg font-bold ${selectedPaymentMethod.stats.netAmount >= 0 ? "text-primary" : "text-error"}`}
              >
                {formatCurrency(Math.abs(selectedPaymentMethod.stats.netAmount))}
                <span className="text-sm ml-1">
                  {selectedPaymentMethod.stats.netAmount >= 0 ? "(inflow)" : "(outflow)"}
                </span>
              </p>
            </div>

            {/* Transaction Count & Transfer Total */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-text-primary/[0.04] rounded-xl p-4">
                <p className="text-xs text-text-secondary font-medium mb-1">Transactions</p>
                <p className="text-lg font-bold text-text-primary">
                  {selectedPaymentMethod.stats.totalTransactions}
                </p>
              </div>
              {selectedPaymentMethod.stats.totalTransfer > 0 && (
                <div className="bg-text-primary/[0.04] rounded-xl p-4">
                  <p className="text-xs text-text-secondary font-medium mb-1">Transfers</p>
                  <p className="text-lg font-bold text-text-primary">
                    {formatCurrency(selectedPaymentMethod.stats.totalTransfer)}
                  </p>
                </div>
              )}
            </div>

            {/* First / Last Used */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-text-muted mb-0.5">First used</p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDate(selectedPaymentMethod.stats.firstUsed)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-0.5">Last used</p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDate(selectedPaymentMethod.stats.lastUsed)}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border-card/50">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPaymentMethod(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-text-secondary text-sm">No transaction statistics available.</p>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={`Delete "${selectedPaymentMethod?.name ?? ""}"?`}
        description="This will permanently remove this payment method. If it has linked transactions, you'll need to reassign them first."
        confirmLabel="Delete Payment Method"
        isLoading={deleteLoading}
      />
    </div>
  );
};
