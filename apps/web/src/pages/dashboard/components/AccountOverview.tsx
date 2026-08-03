import React from "react";
import { clsx } from "clsx";
import { CreditCard, TrendingUp, TrendingDown, Star } from "lucide-react";
import type { PaymentMethodSpending, MostUsedPaymentMethod } from "@/services/dashboard";

interface AccountOverviewProps {
  methods: PaymentMethodSpending[];
  mostUsed: MostUsedPaymentMethod | null;
}

/**
 * Account Overview widget — displays spending breakdown by payment method,
 * net activity per method, and highlights the most-used payment method.
 */
export const AccountOverview = React.memo(function AccountOverview({
  methods,
  mostUsed,
}: AccountOverviewProps) {
  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalExpenseAll = methods.reduce((sum, m) => sum + m.totalExpense, 0);
  const totalIncomeAll = methods.reduce((sum, m) => sum + m.totalIncome, 0);

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-base font-semibold text-text-primary mb-4">Account Overview</h3>

      {methods.length === 0 && (
        <p className="text-sm text-text-muted py-6 text-center">
          No transactions with payment methods yet. Add a payment method to see your account
          overview.
        </p>
      )}

      {methods.length > 0 && (
        <>
          {/* Most-used payment method highlight card */}
          {mostUsed && (
            <div className="mb-4 p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl flex items-center justify-center bg-accent/15 shrink-0">
                  <Star className="size-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted mb-0.5">Most Used</p>
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {mostUsed.paymentMethodName}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {mostUsed.transactionCount} transaction
                    {mostUsed.transactionCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment method list */}
          <div className="space-y-3">
            {methods.map((method) => {
              const expensePercentage =
                totalExpenseAll > 0 ? Math.round((method.totalExpense / totalExpenseAll) * 100) : 0;
              const isMostUsed = mostUsed?.paymentMethodId === method.paymentMethodId;

              return (
                <div
                  key={method.paymentMethodId}
                  className={clsx(
                    "p-3 rounded-lg transition-colors",
                    isMostUsed ? "bg-accent/5" : "bg-overlay/3",
                  )}
                >
                  {/* Header: icon + name + net */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="size-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${method.paymentMethodColor}20` }}
                    >
                      <CreditCard className="size-4" style={{ color: method.paymentMethodColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {method.paymentMethodName}
                        {isMostUsed && (
                          <Star className="size-3 text-accent inline ml-1.5 -mt-0.5" />
                        )}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {method.transactionCount} transaction
                        {method.transactionCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={clsx(
                          "text-sm font-semibold tabular-nums",
                          method.netAmount >= 0 ? "text-success" : "text-error",
                        )}
                      >
                        {method.netAmount >= 0 ? "+" : ""}
                        {formatCurrency(method.netAmount)}
                      </p>
                      <p className="text-[11px] text-text-muted">net</p>
                    </div>
                  </div>

                  {/* Expense bar */}
                  <div className="flex items-center gap-2">
                    <TrendingDown className="size-3 text-warning shrink-0" />
                    <span className="text-xs text-text-muted tabular-nums w-16 shrink-0">
                      {formatCurrency(method.totalExpense)}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-overlay/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${expensePercentage}%`,
                          backgroundColor: method.paymentMethodColor,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-text-muted tabular-nums w-10 text-right shrink-0">
                      {expensePercentage}%
                    </span>
                  </div>

                  {/* Income bar */}
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="size-3 text-success shrink-0" />
                    <span className="text-xs text-text-muted tabular-nums w-16 shrink-0">
                      {formatCurrency(method.totalIncome)}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-overlay/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-success"
                        style={{
                          width: `${
                            totalIncomeAll > 0
                              ? Math.min(100, (method.totalIncome / totalIncomeAll) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-text-muted tabular-nums w-10 text-right shrink-0">
                      {totalIncomeAll > 0
                        ? Math.round((method.totalIncome / totalIncomeAll) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
});
