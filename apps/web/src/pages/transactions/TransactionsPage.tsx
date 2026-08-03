import React, { useState, useEffect, useCallback, useRef } from "react";
import { clsx } from "clsx";
import { toast } from "sonner";
import {
  Plus,
  Download,
  Search,
  MoreHorizontal,
  ArrowUpDown,
  Receipt,
  SearchX,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  ExternalLink,
  Calendar,
  DollarSign,
  Tags,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { StatCard } from "@/pages/dashboard/components/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { transactionsApi } from "@/services/transactions";
import { categoriesApi } from "@/services/categories";
import { paymentMethodsApi } from "@/services/payment-methods";
import { ApiError } from "@/services/api";
import type { ApiTransaction } from "@/services/transactions";
import type { ApiCategory } from "@/services/categories";
import type { ApiPaymentMethod } from "@/services/payment-methods";

const TRANSACTION_TYPES = ["EXPENSE", "INCOME", "TRANSFER"] as const;

const ITEMS_PER_PAGE = 8;

/**
 * Transactions page — full ledger with real API data, search, filters, sorting, pagination, and CRUD modals.
 * Route: /expenses
 */
export const TransactionsPage: React.FC = () => {
  // ─── Data state ──────────────────────────────────────────
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<ApiPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<{
    totalIncome: number;
    totalExpense: number;
    totalTransfer: number;
    netAmount: number;
    count: number;
  } | null>(null);

  // ─── Filter state ────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<
    "date" | "amount" | "createdAt" | "updatedAt" | "description"
  >("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ─── Form state ──────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE" | "TRANSFER">("EXPENSE");
  const [formAmount, setFormAmount] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formDescription, setFormDescription] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formPaymentMethodId, setFormPaymentMethodId] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // ─── Edit state ──────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ApiTransaction | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ─── Delete state ────────────────────────────────────────
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Bulk operation state ───────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkUpdateCategory, setBulkUpdateCategory] = useState("");
  const [bulkUpdatePaymentMethod, setBulkUpdatePaymentMethod] = useState("");

  // ─── Bulk helpers ───────────────────────────────────────
  const allSelected = transactions.length > 0 && transactions.every((t) => selectedIds.has(t.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map((t) => t.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0 || bulkActionLoading) return;
    setBulkActionLoading(true);
    try {
      const result = await transactionsApi.bulkDelete(Array.from(selectedIds));
      toast.success(`${result.count} transaction${result.count !== 1 ? "s" : ""} deleted`);
      setShowBulkDeleteDialog(false);
      setSelectedIds(new Set());
      await fetchTransactions();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Bulk delete failed";
      toast.error("Bulk delete failed", { description: message });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0 || bulkActionLoading) return;
    if (!bulkUpdateCategory && !bulkUpdatePaymentMethod) {
      toast.error("Please select a category or payment method to update");
      return;
    }
    setBulkActionLoading(true);
    try {
      const result = await transactionsApi.bulkUpdate(Array.from(selectedIds), {
        categoryId: bulkUpdateCategory || undefined,
        paymentMethodId: bulkUpdatePaymentMethod || undefined,
      });
      toast.success(`${result.count} transaction${result.count !== 1 ? "s" : ""} updated`);
      setShowBulkUpdateModal(false);
      setBulkUpdateCategory("");
      setBulkUpdatePaymentMethod("");
      setSelectedIds(new Set());
      await fetchTransactions();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Bulk update failed";
      toast.error("Bulk update failed", { description: message });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const [uploadingReceiptId, setUploadingReceiptId] = useState<string | null>(null);

  // ─── Row action dropdown ─────────────────────────────────
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dropdownTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Menu keyboard navigation (WCAG 2.1.1 / APG menu pattern):
  // Arrow/Home/End move between items; Enter/Space/Escape already activate/close.
  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const menu = e.currentTarget;
    const items = Array.from(menu.querySelectorAll<HTMLElement>("[role='menuitem']"));
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex =
        currentIndex === -1 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = items.length - 1;
    } else if (e.key === "Tab") {
      // APG menu pattern: Tab closes the menu and focus moves to the next
      // focusable element after the trigger (Shift+Tab goes before it).
      // Exclude the closing menu's own items — they match `button`/`[href]`
      // selectors despite tabIndex={-1}, so focusing them would lose focus
      // to <body> the instant the menu unmounts.
      e.preventDefault();
      setOpenDropdownId(null);
      const trigger = dropdownTriggerRef.current;
      const menu = dropdownRef.current;
      if (trigger) {
        const focusables = Array.from(
          document.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !menu?.contains(el));
        const idx = focusables.indexOf(trigger);
        const target = e.shiftKey ? focusables[idx - 1] : focusables[idx + 1];
        // Fall back to the trigger so focus is never stranded (e.g. when the
        // trigger is the first/last focusable on the page).
        (target ?? trigger).focus();
      }
      return;
    } else {
      return;
    }
    items[nextIndex]?.focus();
  };

  // Close the dropdown and restore focus to its trigger button (WCAG 2.4.3).
  const closeDropdown = () => {
    setOpenDropdownId(null);
    // Defer so the menu unmounts before returning focus to the trigger.
    requestAnimationFrame(() => dropdownTriggerRef.current?.focus());
  };

  // ─── Debounce search ─────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Fetch categories & payment methods ─────────────────
  useEffect(() => {
    categoriesApi
      .findAll()
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"));
    paymentMethodsApi
      .findAll()
      .then(setPaymentMethods)
      .catch(() => toast.error("Failed to load payment methods"));
  }, []);

  // ─── Fetch transactions ──────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const [listResult, summaryResult] = await Promise.all([
        transactionsApi.findAll({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          type: typeFilter || undefined,
          categoryId: categoryFilter || undefined,
          paymentMethodId: paymentMethodFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          minAmount: minAmount ? Number(minAmount) : undefined,
          maxAmount: maxAmount ? Number(maxAmount) : undefined,
          sortBy: sortField,
          sortOrder: sortDir,
          search: debouncedSearch || undefined,
        }),
        transactionsApi.getSummary({
          type: typeFilter || undefined,
          categoryId: categoryFilter || undefined,
          paymentMethodId: paymentMethodFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          minAmount: minAmount ? Number(minAmount) : undefined,
          maxAmount: maxAmount ? Number(maxAmount) : undefined,
          search: debouncedSearch || undefined,
        }),
      ]);
      setTransactions(listResult.transactions);
      setSummary(summaryResult);
      if (listResult.meta) {
        setTotalCount(listResult.meta.total);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load transactions";
      toast.error("Load failed", { description: message });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    typeFilter,
    categoryFilter,
    paymentMethodFilter,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortField,
    sortDir,
    debouncedSearch,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ─── Computed values ─────────────────────────────────────
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const typeOptions = [
    { value: "EXPENSE", label: "Expense" },
    { value: "INCOME", label: "Income" },
    { value: "TRANSFER", label: "Transfer" },
  ];

  const paymentMethodOptions = paymentMethods.map((pm) => ({
    value: pm.id,
    label: pm.lastFour ? `${pm.name} (••••${pm.lastFour})` : pm.name,
  }));

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "amount", label: "Amount" },
    { value: "description", label: "Title" },
    { value: "createdAt", label: "Created Date" },
    { value: "updatedAt", label: "Updated Date" },
  ];

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasFilters =
    searchQuery ||
    categoryFilter ||
    typeFilter ||
    paymentMethodFilter ||
    startDate ||
    endDate ||
    minAmount ||
    maxAmount;

  // ─── Helpers ─────────────────────────────────────────────
  const toggleSort = (field: "date" | "amount" | "description") => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setFormType("EXPENSE");
    setFormAmount("");
    setFormCategoryId("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormDescription("");
    setFormNotes("");
    setFormPaymentMethodId("");
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formAmount || Number(formAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!formCategoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!formDescription.trim()) {
      toast.error("Description is required");
      return;
    }

    setFormSubmitting(true);
    try {
      await transactionsApi.create({
        type: formType,
        amount: Number(formAmount),
        description: formDescription.trim(),
        date: formDate,
        notes: formNotes.trim() || undefined,
        categoryId: formCategoryId,
        paymentMethodId: formPaymentMethodId || null,
      });
      toast.success("Transaction created");
      setShowAddModal(false);
      await fetchTransactions();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to create transaction";
      toast.error("Create failed", { description: message });
    } finally {
      setFormSubmitting(false);
    }
  };

  // ─── Edit handlers ───────────────────────────────────────
  const openEditModal = (txn: ApiTransaction) => {
    setSelectedTransaction(txn);
    setFormType(txn.type);
    setFormAmount(String(txn.amount));
    setFormCategoryId(txn.categoryId);
    setFormDate(txn.date.split("T")[0]);
    setFormDescription(txn.description);
    setFormNotes(txn.notes ?? "");
    setFormPaymentMethodId(txn.paymentMethodId ?? "");
    setOpenDropdownId(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    if (!formAmount || Number(formAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!formCategoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!formDescription.trim()) {
      toast.error("Description is required");
      return;
    }

    setEditSubmitting(true);
    try {
      await transactionsApi.update(selectedTransaction.id, {
        type: formType,
        amount: Number(formAmount),
        description: formDescription.trim(),
        date: formDate,
        notes: formNotes.trim() || undefined,
        categoryId: formCategoryId,
        paymentMethodId: formPaymentMethodId || null,
      });
      toast.success("Transaction updated");
      setShowEditModal(false);
      setSelectedTransaction(null);
      await fetchTransactions();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to update transaction";
      toast.error("Update failed", { description: message });
    } finally {
      setEditSubmitting(false);
    }
  };

  // ─── Delete handlers ─────────────────────────────────────
  const openDeleteDialog = (txn: ApiTransaction) => {
    setSelectedTransaction(txn);
    setOpenDropdownId(null);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedTransaction || deleteLoading) return;

    setDeleteLoading(true);
    try {
      await transactionsApi.delete(selectedTransaction.id);
      toast.success("Transaction deleted");
      setShowDeleteDialog(false);
      setSelectedTransaction(null);
      await fetchTransactions();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete transaction";
      toast.error("Delete failed", { description: message });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Receipt handlers ────────────────────────────────────
  const handleUploadReceipt = async (txnId: string, file: File) => {
    setUploadingReceiptId(txnId);
    try {
      await transactionsApi.uploadReceipt(txnId, file);
      toast.success("Receipt uploaded");
      await fetchTransactions();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to upload receipt";
      toast.error("Upload failed", { description: message });
    } finally {
      setUploadingReceiptId(null);
      setOpenDropdownId(null);
    }
  };

  const handleRemoveReceipt = async (txnId: string) => {
    try {
      await transactionsApi.removeReceipt(txnId);
      toast.success("Receipt removed");
      await fetchTransactions();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to remove receipt";
      toast.error("Remove failed", { description: message });
    }
    setOpenDropdownId(null);
  };

  const triggerReceiptUpload = (txnId: string) => {
    // Create a hidden file input and trigger it
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleUploadReceipt(txnId, file);
    };
    input.click();
  };

  // Focus the first menu item when a row dropdown opens (keyboard users).
  useEffect(() => {
    if (!openDropdownId) return;
    dropdownRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
  }, [openDropdownId]);

  // ─── Close dropdown on outside click / Escape ─────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCategoryFilter("");
    setTypeFilter("");
    setPaymentMethodFilter("");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setCurrentPage(1);
  };

  // ─── Loading state ───────────────────────────────────────
  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-52 mt-2" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-14 rounded-xl" />
        <div className="glass rounded-xl overflow-hidden">
          <Skeleton className="h-10 rounded-none" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-none border-t border-border-card/50" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title font-bold text-text-primary">Transactions</h2>
          <p className="text-sm text-text-secondary mt-1">
            {totalCount} transaction{totalCount !== 1 && "s"} found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<Download className="size-4" />}>
            Export CSV
          </Button>
          <Button size="sm" leftIcon={<Plus className="size-4" />} onClick={openCreateModal}>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Statistics cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Income"
            value={`$${summary.totalIncome.toFixed(2)}`}
            subtext={`${summary.totalIncome > 0 ? "From " : ""}${summary.count} transaction${summary.count !== 1 ? "s" : ""}`}
            icon={TrendingUp}
            trend="up"
            iconBg="bg-success/15"
            iconColor="text-success"
          />
          <StatCard
            title="Total Expenses"
            value={`$${summary.totalExpense.toFixed(2)}`}
            subtext={`${summary.totalExpense > 0 ? "Across " : ""}${summary.count} transaction${summary.count !== 1 ? "s" : ""}`}
            icon={TrendingDown}
            trend="down"
            iconBg="bg-error/15"
            iconColor="text-error"
          />
          <StatCard
            title="Net Balance"
            value={`$${summary.netAmount.toFixed(2)}`}
            subtext={summary.netAmount >= 0 ? "Positive cash flow" : "Negative cash flow"}
            icon={Wallet}
            trend={summary.netAmount >= 0 ? "up" : "down"}
            iconBg={summary.netAmount >= 0 ? "bg-success/15" : "bg-error/15"}
            iconColor={summary.netAmount >= 0 ? "text-success" : "text-error"}
          />
          <StatCard
            title="Transactions"
            value={String(summary.count)}
            subtext={`${summary.totalIncome > 0 || summary.totalExpense > 0 ? "Total entries" : "No entries yet"}`}
            icon={ReceiptText}
            trend="neutral"
            iconBg="bg-primary/15"
            iconColor="text-primary"
          />
        </div>
      )}

      {/* Filter bar */}
      <div className="glass rounded-xl p-4 space-y-3">
        {/* Row 1: Search + Quick filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <input
              type="search"
              placeholder="Search descriptions and notes..."
              aria-label="Search transactions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-input border border-border-input text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus transition-all"
            />
          </div>
          <Select
            aria-label="Filter by type"
            options={typeOptions}
            placeholder="All Types"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            aria-label="Filter by category"
            options={categoryOptions}
            placeholder="All Categories"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            aria-label="Filter by payment method"
            options={paymentMethodOptions}
            placeholder="All Payment Methods"
            value={paymentMethodFilter}
            onChange={(e) => {
              setPaymentMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Row 2: Date range + Amount range + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-text-muted shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 rounded-lg bg-bg-input border border-border-input text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus transition-all"
              aria-label="Start date"
            />
            <span className="text-text-muted text-sm" aria-hidden="true">
              —
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 rounded-lg bg-bg-input border border-border-input text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus transition-all"
              aria-label="End date"
            />
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-text-muted shrink-0" />
            <input
              type="number"
              placeholder="Min"
              aria-label="Minimum amount"
              value={minAmount}
              onChange={(e) => {
                setMinAmount(e.target.value);
                setCurrentPage(1);
              }}
              min="0"
              step="0.01"
              className="w-24 px-3 py-2 rounded-lg bg-bg-input border border-border-input text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus transition-all"
            />
            <span className="text-text-muted text-sm" aria-hidden="true">
              —
            </span>
            <input
              type="number"
              placeholder="Max"
              aria-label="Maximum amount"
              value={maxAmount}
              onChange={(e) => {
                setMaxAmount(e.target.value);
                setCurrentPage(1);
              }}
              min="0"
              step="0.01"
              className="w-24 px-3 py-2 rounded-lg bg-bg-input border border-border-input text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted whitespace-nowrap" id="sort-by-label">
              Sort by
            </span>
            <Select
              aria-labelledby="sort-by-label"
              options={sortOptions}
              placeholder="Sort by"
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value as typeof sortField);
                setCurrentPage(1);
              }}
            />
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-all"
              aria-label={`Sort direction: currently ${sortDir === "asc" ? "ascending" : "descending"}`}
              aria-pressed={sortDir === "asc"}
              title={sortDir === "asc" ? "Ascending" : "Descending"}
            >
              {sortDir === "asc" ? (
                <ArrowUp className="size-4" aria-hidden="true" />
              ) : (
                <ArrowDown className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="glass rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-[fade-in_0.2s_ease-out]">
          <span className="text-sm text-text-primary font-medium">{selectedIds.size} selected</span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Tags className="size-3.5" />}
              onClick={() => {
                setBulkUpdateCategory("");
                setBulkUpdatePaymentMethod("");
                setShowBulkUpdateModal(true);
              }}
            >
              Change Category
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<CreditCard className="size-3.5" />}
              onClick={() => {
                setBulkUpdateCategory("");
                setBulkUpdatePaymentMethod("");
                setShowBulkUpdateModal(true);
              }}
            >
              Change Payment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="size-3.5 text-error" />}
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Data table or empty states */}
      {totalCount === 0 && !loading && !hasFilters ? (
        <EmptyState
          icon={Receipt}
          title="No Transactions Yet"
          description="Start tracking your spending by adding your first transaction."
          actionLabel="+ Add Transaction"
          onAction={openCreateModal}
        />
      ) : transactions.length === 0 && !loading ? (
        <EmptyState
          icon={SearchX}
          title="No Matching Transactions Found"
          description="Try adjusting your search keywords or filter criteria."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[auto_1fr_1.5fr_1fr_0.8fr_auto] gap-4 px-5 py-3 border-b border-border-card text-xs font-medium text-text-muted uppercase tracking-wide">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleSelectAll}
              aria-label="Select all transactions"
            />
            <button
              onClick={() => toggleSort("date")}
              className="flex items-center gap-1 hover:text-text-primary transition-colors"
              aria-label={`Sort by date${sortField === "date" ? `, currently ${sortDir === "asc" ? "ascending" : "descending"}` : ""}`}
            >
              <span>Date</span>
              {sortField === "date" &&
                (sortDir === "asc" ? (
                  <ArrowUp className="size-3" aria-hidden="true" />
                ) : (
                  <ArrowDown className="size-3" aria-hidden="true" />
                ))}
              {sortField !== "date" && <ArrowUpDown className="size-3" aria-hidden="true" />}
            </button>
            <button
              onClick={() => toggleSort("description")}
              className="flex items-center gap-1 hover:text-text-primary transition-colors text-left"
              aria-label={`Sort by description${sortField === "description" ? `, currently ${sortDir === "asc" ? "ascending" : "descending"}` : ""}`}
            >
              <span>Description</span>
              {sortField === "description" &&
                (sortDir === "asc" ? (
                  <ArrowUp className="size-3" aria-hidden="true" />
                ) : (
                  <ArrowDown className="size-3" aria-hidden="true" />
                ))}
              {sortField !== "description" && <ArrowUpDown className="size-3" aria-hidden="true" />}
            </button>
            <div className="flex items-center gap-1">Category</div>
            <button
              onClick={() => toggleSort("amount")}
              className="flex items-center gap-1 hover:text-text-primary transition-colors"
              aria-label={`Sort by amount${sortField === "amount" ? `, currently ${sortDir === "asc" ? "ascending" : "descending"}` : ""}`}
            >
              <span>Amount</span>
              {sortField === "amount" &&
                (sortDir === "asc" ? (
                  <ArrowUp className="size-3" aria-hidden="true" />
                ) : (
                  <ArrowDown className="size-3" aria-hidden="true" />
                ))}
              {sortField !== "amount" && <ArrowUpDown className="size-3" aria-hidden="true" />}
            </button>
            <span className="sr-only">Actions</span>
          </div>

          {/* Table rows */}
          {transactions.map((txn, index) => (
            <div
              key={txn.id}
              className={clsx(
                "list-window relative px-5 py-4 border-b border-border-card/50 transition-colors group",
                selectedIds.has(txn.id) && "bg-primary/[0.03]",
                openDropdownId === txn.id && "bg-overlay/[0.02]",
              )}
            >
              {/* ── Mobile card layout (< md) ── */}
              <div className="flex items-center gap-3 md:hidden">
                <Checkbox
                  checked={selectedIds.has(txn.id)}
                  onChange={() => toggleSelect(txn.id)}
                  aria-label={`Select ${txn.description}`}
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {txn.description}
                    </p>
                    {txn.receiptUrl && (
                      <a
                        href={txn.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-0.5 rounded text-text-muted hover:text-primary transition-colors"
                        title="View receipt"
                      >
                        <ImageIcon className="size-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-muted tabular-nums whitespace-nowrap">
                      {txn.date.split("T")[0]}
                    </span>
                    <span className="size-1 rounded-full bg-text-muted/40" aria-hidden="true" />
                    <div
                      className="size-4 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${txn.category.color}20` }}
                    >
                      <CategoryIcon
                        name={txn.category.icon}
                        size={10}
                        style={{ color: txn.category.color }}
                      />
                    </div>
                    <span className="text-xs text-text-secondary truncate">
                      {txn.category.name}
                    </span>
                  </div>
                  {txn.notes && (
                    <p className="text-xs text-text-muted mt-0.5 truncate">{txn.notes}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={clsx(
                      "text-sm font-semibold tabular-nums",
                      txn.type === "INCOME"
                        ? "text-success"
                        : txn.type === "EXPENSE"
                          ? "text-error"
                          : "text-text-secondary",
                    )}
                  >
                    {txn.type === "INCOME" ? "+" : txn.type === "EXPENSE" ? "-" : ""}$
                    {txn.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => {
                      dropdownTriggerRef.current = e.currentTarget;
                      setOpenDropdownId(openDropdownId === txn.id ? null : txn.id);
                    }}
                    className="p-1.5 -mr-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-all"
                    aria-label={`Actions for ${txn.description}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
              </div>

              {/* ── Desktop table layout (md+) ── */}
              <div className="hidden md:grid md:grid-cols-[auto_1fr_1.5fr_1fr_0.8fr_auto] md:gap-4 md:items-center">
                <Checkbox
                  checked={selectedIds.has(txn.id)}
                  onChange={() => toggleSelect(txn.id)}
                  aria-label={`Select ${txn.description}`}
                />
                <span className="text-sm text-text-secondary tabular-nums whitespace-nowrap">
                  {txn.date.split("T")[0]}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {txn.description}
                    </p>
                    {txn.receiptUrl && (
                      <a
                        href={txn.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-0.5 rounded text-text-muted hover:text-primary transition-colors"
                        title="View receipt"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ImageIcon className="size-3.5" />
                      </a>
                    )}
                  </div>
                  {txn.notes && (
                    <p className="text-xs text-text-muted mt-0.5 truncate">{txn.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="size-5 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${txn.category.color}20` }}
                  >
                    <CategoryIcon
                      name={txn.category.icon}
                      size={12}
                      style={{ color: txn.category.color }}
                    />
                  </div>
                  <Badge variant="default" className="truncate max-w-28">
                    {txn.category.name}
                  </Badge>
                </div>
                <span
                  className={clsx(
                    "text-sm font-semibold tabular-nums",
                    txn.type === "INCOME"
                      ? "text-success"
                      : txn.type === "EXPENSE"
                        ? "text-error"
                        : "text-text-secondary",
                  )}
                >
                  {txn.type === "INCOME" ? "+" : txn.type === "EXPENSE" ? "-" : ""}$
                  {txn.amount.toFixed(2)}
                </span>
                <button
                  onClick={(e) => {
                    dropdownTriggerRef.current = e.currentTarget;
                    setOpenDropdownId(openDropdownId === txn.id ? null : txn.id);
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all"
                  aria-label={`Actions for ${txn.description}`}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>

              {/* ── Shared actions dropdown (anchored to row, flips up on last row to avoid clipping) ── */}
              {openDropdownId === txn.id && (
                <div
                  ref={dropdownRef}
                  role="menu"
                  aria-label={`Actions for ${txn.description}`}
                  onKeyDown={handleDropdownKeyDown}
                  className={clsx(
                    "absolute right-4 z-50 w-44 py-1.5 rounded-xl border border-border-card bg-bg-app shadow-xl shadow-black/20",
                    "animate-[pop-in_0.15s_ease-out]",
                    index === transactions.length - 1
                      ? "bottom-full mb-1 origin-bottom-right"
                      : "top-full mt-1 origin-top-right",
                  )}
                >
                  <button
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => openEditModal(txn)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-text-primary hover:bg-overlay/5 transition-colors"
                  >
                    <Pencil className="size-3.5 text-text-muted" />
                    Edit
                  </button>
                  {txn.receiptUrl ? (
                    <div className="border-t border-border-card/50 mt-1 pt-1">
                      <a
                        href={txn.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        tabIndex={-1}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-text-primary hover:bg-overlay/5 transition-colors"
                      >
                        <ExternalLink className="size-3.5 text-text-muted" />
                        View Receipt
                      </a>
                      <button
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => handleRemoveReceipt(txn.id)}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-warning hover:bg-overlay/5 transition-colors"
                      >
                        <X className="size-3.5" />
                        Remove Receipt
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-border-card/50 mt-1 pt-1">
                      <button
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => triggerReceiptUpload(txn.id)}
                        disabled={uploadingReceiptId === txn.id}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-text-primary hover:bg-overlay/5 transition-colors disabled:opacity-50"
                      >
                        <Upload className="size-3.5 text-text-muted" />
                        {uploadingReceiptId === txn.id ? "Uploading..." : "Upload Receipt"}
                      </button>
                    </div>
                  )}
                  <button
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => openDeleteDialog(txn)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-error hover:bg-overlay/5 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Pagination footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 gap-4">
            <span className="text-sm text-text-muted">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Transaction"
        description="Record a new income, expense, or transfer transaction."
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          {" "}
          <div className="space-y-1.5">
            <span
              className="block text-sm font-medium text-text-secondary"
              id="transaction-type-label-add"
            >
              Type
            </span>
            <div
              className="flex gap-2"
              role="radiogroup"
              aria-labelledby="transaction-type-label-add"
            >
              {TRANSACTION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={formType === t}
                  onClick={() => setFormType(t)}
                  className={clsx(
                    "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
                    formType === t
                      ? "bg-primary/15 text-primary ring-1 ring-primary"
                      : "bg-bg-app text-text-secondary hover:bg-overlay/5",
                  )}
                >
                  {t === "INCOME" ? "Income" : t === "EXPENSE" ? "Expense" : "Transfer"}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            required
          />
          <Select
            label="Category"
            options={categoryOptions}
            placeholder="Select category"
            value={formCategoryId}
            onChange={(e) => setFormCategoryId(e.target.value)}
            required
          />
          <Select
            label="Payment Method (Optional)"
            options={paymentMethodOptions}
            placeholder="Select a payment method"
            value={formPaymentMethodId}
            onChange={(e) => setFormPaymentMethodId(e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            required
          />
          <Input
            label="Description"
            type="text"
            placeholder="e.g. Whole Foods Market"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            required
          />
          <Input
            label="Notes (Optional)"
            type="text"
            placeholder="Additional details..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={formSubmitting}>
              Save Transaction
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTransaction(null);
        }}
        title="Edit Transaction"
        description="Update the details of this transaction."
      >
        <form className="space-y-4" onSubmit={handleEditSubmit}>
          <div className="space-y-1.5">
            <span
              className="block text-sm font-medium text-text-secondary"
              id="transaction-type-label-edit"
            >
              Type
            </span>
            <div
              className="flex gap-2"
              role="radiogroup"
              aria-labelledby="transaction-type-label-edit"
            >
              {TRANSACTION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={formType === t}
                  onClick={() => setFormType(t)}
                  className={clsx(
                    "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
                    formType === t
                      ? "bg-primary/15 text-primary ring-1 ring-primary"
                      : "bg-bg-app text-text-secondary hover:bg-overlay/5",
                  )}
                >
                  {t === "INCOME" ? "Income" : t === "EXPENSE" ? "Expense" : "Transfer"}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            required
          />

          <Select
            label="Category"
            options={categoryOptions}
            placeholder="Select category"
            value={formCategoryId}
            onChange={(e) => setFormCategoryId(e.target.value)}
            required
          />

          <Select
            label="Payment Method (Optional)"
            options={paymentMethodOptions}
            placeholder="Select a payment method"
            value={formPaymentMethodId}
            onChange={(e) => setFormPaymentMethodId(e.target.value)}
          />

          <Input
            label="Date"
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            required
          />

          <Input
            label="Description"
            type="text"
            placeholder="e.g. Whole Foods Market"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            required
          />

          <Input
            label="Notes (Optional)"
            type="text"
            placeholder="Additional details..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={editSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedTransaction(null);
        }}
        onConfirm={handleDelete}
        title={`Delete "${selectedTransaction?.description ?? ""}"?`}
        description="This action cannot be undone. The transaction will be permanently removed."
        confirmLabel="Delete Transaction"
        isLoading={deleteLoading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedIds.size} transaction${selectedIds.size !== 1 ? "s" : ""}?`}
        description="This action cannot be undone. The selected transactions will be permanently removed."
        confirmLabel={`Delete ${selectedIds.size} transaction${selectedIds.size !== 1 ? "s" : ""}`}
        isLoading={bulkActionLoading}
      />

      {/* Bulk Update Modal */}
      <Modal
        isOpen={showBulkUpdateModal}
        onClose={() => {
          setShowBulkUpdateModal(false);
          setBulkUpdateCategory("");
          setBulkUpdatePaymentMethod("");
        }}
        title={`Update ${selectedIds.size} Transaction${selectedIds.size !== 1 ? "s" : ""}`}
        description="Change the category or payment method for all selected transactions."
      >
        <div className="space-y-4">
          <Select
            label="Category (optional)"
            options={categoryOptions}
            placeholder="No change"
            value={bulkUpdateCategory}
            onChange={(e) => setBulkUpdateCategory(e.target.value)}
          />
          <Select
            label="Payment Method (optional)"
            options={paymentMethodOptions}
            placeholder="No change"
            value={bulkUpdatePaymentMethod}
            onChange={(e) => setBulkUpdatePaymentMethod(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowBulkUpdateModal(false);
                setBulkUpdateCategory("");
                setBulkUpdatePaymentMethod("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate} isLoading={bulkActionLoading}>
              Update {selectedIds.size} transaction{selectedIds.size !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
