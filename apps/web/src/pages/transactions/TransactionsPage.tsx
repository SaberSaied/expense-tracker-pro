import React, { useState, useMemo } from "react";
import { clsx } from "clsx";
import {
  Plus,
  Download,
  Search,
  MoreHorizontal,
  ArrowUpDown,
  Receipt,
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { MOCK_TRANSACTIONS, MOCK_CATEGORIES } from "@/data";
import type { Transaction } from "@/types";

const paymentLabels: Record<string, string> = {
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  cash: "Cash",
  bank_transfer: "Bank Transfer",
};

const ITEMS_PER_PAGE = 8;

/**
 * Transactions page — full ledger with search, filters, sorting, pagination, and CRUD modals.
 * Route: /expenses
 */
export const TransactionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    let result = [...MOCK_TRANSACTIONS];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(q));
    }
    if (categoryFilter) {
      result = result.filter((t) => t.categoryId === categoryFilter);
    }
    if (paymentFilter) {
      result = result.filter((t) => t.paymentMethod === paymentFilter);
    }

    result.sort((a, b) => {
      const multiplier = sortDir === "asc" ? 1 : -1;
      if (sortField === "date") return multiplier * a.date.localeCompare(b.date);
      return multiplier * (a.amount - b.amount);
    });

    return result;
  }, [searchQuery, categoryFilter, paymentFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const categoryOptions = MOCK_CATEGORIES.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const paymentOptions = [
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" },
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ];

  const hasFilters = searchQuery || categoryFilter || paymentFilter;

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Transactions</h2>
          <p className="text-sm text-text-secondary mt-1">
            {filtered.length} transaction{filtered.length !== 1 && "s"} found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<Download className="size-4" />}>
            Export CSV
          </Button>
          <Button size="sm" leftIcon={<Plus className="size-4" />} onClick={() => setShowAddModal(true)}>
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <input
              type="search"
              placeholder="Search description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-input border border-border-input text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus transition-all"
            />
          </div>
          <Select
            options={categoryOptions}
            placeholder="All Categories"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={paymentOptions}
            placeholder="All Methods"
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("");
                setPaymentFilter("");
                setCurrentPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Data table or empty states */}
      {MOCK_TRANSACTIONS.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Expenses Recorded Yet"
          description="Start tracking your spending by adding your first expense."
          actionLabel="+ Add First Expense"
          onAction={() => setShowAddModal(true)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No Matching Transactions Found"
          description="Try adjusting your search keywords or filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setCategoryFilter("");
            setPaymentFilter("");
          }}
        />
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1fr_0.8fr_auto] gap-4 px-5 py-3 border-b border-border-card text-xs font-medium text-text-muted uppercase tracking-wide">
            <button onClick={() => toggleSort("date")} className="flex items-center gap-1 hover:text-text-primary transition-colors">
              Date <ArrowUpDown className="size-3" />
            </button>
            <span>Description</span>
            <span>Category</span>
            <span>Payment</span>
            <button onClick={() => toggleSort("amount")} className="flex items-center gap-1 hover:text-text-primary transition-colors">
              Amount <ArrowUpDown className="size-3" />
            </button>
            <span className="sr-only">Actions</span>
          </div>

          {/* Table rows */}
          {paginated.map((txn: Transaction) => (
            <div
              key={txn.id}
              className={clsx(
                "grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_1fr_0.8fr_auto] gap-2 md:gap-4 items-center",
                "px-5 py-4 border-b border-border-card/50 hover:bg-white/[0.02] transition-colors group",
              )}
            >
              <span className="text-sm text-text-secondary tabular-nums">{txn.date}</span>
              <div>
                <p className="text-sm font-medium text-text-primary">{txn.description}</p>
                {txn.notes && <p className="text-xs text-text-muted mt-0.5">{txn.notes}</p>}
              </div>
              <div>
                <Badge variant="default">{txn.categoryName}</Badge>
              </div>
              <span className="text-sm text-text-secondary">{paymentLabels[txn.paymentMethod]}</span>
              <span className="text-sm font-semibold text-text-primary tabular-nums">
                -${txn.amount.toFixed(2)}
              </span>
              <button
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                aria-label={`Actions for ${txn.description}`}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>
          ))}

          {/* Pagination footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 gap-4">
            <span className="text-sm text-text-muted">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
              {filtered.length}
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
        title="Add Expense"
        description="Record a new expense transaction."
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
          <Input label="Amount ($)" type="number" placeholder="0.00" step="0.01" min="0.01" required />
          <Select label="Category" options={categoryOptions} placeholder="Select category" required />
          <Input label="Date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
          <Input label="Description" type="text" placeholder="e.g. Whole Foods Market" required />
          <Select
            label="Payment Method"
            options={paymentOptions}
            placeholder="Select method"
            required
          />
          <Input label="Notes (Optional)" type="text" placeholder="Additional details..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
