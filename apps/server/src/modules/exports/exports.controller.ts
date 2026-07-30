import type { Response, NextFunction } from "express";
import { exportService } from "./exports.service";
import type { AuthenticatedRequest } from "@/common/types";

export const exportController = {
  /**
   * GET /exports/transactions — Download transactions as CSV.
   * Supports same filters as the custom report query.
   */
  async exportTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const {
        startDate,
        endDate,
        categoryId,
        paymentMethodId,
        type,
        minAmount,
        maxAmount,
      } = req.query as Record<string, string | undefined>;

      const csv = await exportService.generateTransactionsCsv(req.user.id, {
        startDate,
        endDate,
        categoryId,
        paymentMethodId,
        type: type as "INCOME" | "EXPENSE" | "TRANSFER" | undefined,
        minAmount: minAmount ? Number(minAmount) : undefined,
        maxAmount: maxAmount ? Number(maxAmount) : undefined,
      });

      const filename = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /exports/reports — Download a report as CSV.
   * Query param "type" determines the report variant.
   */
  async exportReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { type, year, month, date, startDate, endDate } = req.query as Record<string, string | undefined>;

      const csv = await exportService.generateReportCsv(req.user.id, {
        type: type ?? "summary",
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined,
        date,
        startDate,
        endDate,
      });

      const now = new Date().toISOString().slice(0, 10);
      const filename = `report-${type ?? "summary"}-${now}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  },
};
