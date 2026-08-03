import React from "react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { ApiTransaction } from "@/services/transactions";

interface RecentTransactionsProps {
  transactions: ApiTransaction[];
}

/**
 * Recent transactions ledger widget — displays the latest transactions fetched from the API.
 * Backend already sorts by newest and limits to 5 results.
 */
export const RecentTransactions = React.memo(function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-primary">Recent Transactions</h3>
        <Link
          to="/expenses"
          className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover transition-colors"
        >
          View All
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="space-y-0.5">
        {transactions.length === 0 && (
          <p className="text-sm text-text-muted py-6 text-center">
            No transactions yet. Start tracking your finances!
          </p>
        )}

        {transactions.map((txn) => {
          const isIncome = txn.type === "INCOME";
          const amountColor = isIncome ? "text-success" : "text-text-primary";
          const amountSign = isIncome ? "+" : "-";

          return (
            <div
              key={txn.id}
              className={clsx(
                "flex items-center gap-4 py-3 px-3 -mx-3 rounded-lg",
                "hover:bg-overlay/3 transition-colors group",
              )}
            >
              {/* Category icon */}
              <div
                className="size-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${txn.category.color}20` }}
              >
                <span className="text-sm font-bold" style={{ color: txn.category.color }}>
                  {txn.category.name.charAt(0)}
                </span>
              </div>

              {/* Description & meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{txn.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="default">{txn.category.name}</Badge>
                  <span className="text-[11px] text-text-muted">{formatDate(txn.date)}</span>
                </div>
              </div>

              {/* Payment method */}
              {txn.paymentMethod && (
                <span className="text-xs text-text-muted hidden sm:block">
                  {txn.paymentMethod.name}
                </span>
              )}

              {/* Amount */}
              <span
                className={clsx(
                  "text-sm font-semibold tabular-nums whitespace-nowrap",
                  amountColor,
                )}
              >
                {amountSign}${txn.amount.toFixed(2)}
              </span>

              {/* Actions */}
              <button
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                aria-label={`Actions for ${txn.description}`}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});
