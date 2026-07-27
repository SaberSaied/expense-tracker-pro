import React from "react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Transaction } from "@/types";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const paymentMethodLabels: Record<string, string> = {
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  cash: "Cash",
  bank_transfer: "Bank Transfer",
};

/**
 * Recent transactions ledger widget — displays 5 most recent expenses.
 */
export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
}) => {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-primary">
          Recent Transactions
        </h3>
        <Link
          to="/expenses"
          className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover transition-colors"
        >
          View All
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="space-y-0.5">
        {transactions.slice(0, 5).map((txn) => (
          <div
            key={txn.id}
            className={clsx(
              "flex items-center gap-4 py-3 px-3 -mx-3 rounded-lg",
              "hover:bg-white/3 transition-colors group",
            )}
          >
            {/* Category icon */}
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${txn.categoryColor}20` }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: txn.categoryColor }}
              >
                {txn.categoryName.charAt(0)}
              </span>
            </div>

            {/* Description & meta */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {txn.description}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="default">
                  {txn.categoryName}
                </Badge>
                <span className="text-[11px] text-text-muted">
                  {txn.date}
                </span>
              </div>
            </div>

            {/* Payment method */}
            <span className="text-xs text-text-muted hidden sm:block">
              {paymentMethodLabels[txn.paymentMethod]}
            </span>

            {/* Amount */}
            <span className="text-sm font-semibold text-text-primary tabular-nums whitespace-nowrap">
              -${txn.amount.toFixed(2)}
            </span>

            {/* Actions */}
            <button
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
              aria-label={`Actions for ${txn.description}`}
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
