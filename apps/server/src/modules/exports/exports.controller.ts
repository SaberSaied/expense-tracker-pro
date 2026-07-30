import type { Response, NextFunction } from "express";
import { exportService } from "./exports.service";
import { pdfExportService } from "./exports.pdf.service";
import type { AuthenticatedRequest } from "@/common/types";

/**
 * Determine the export format from the query string.
 * Defaults to "csv" if not provided.
 */
function getFormat(req: AuthenticatedRequest): "csv" | "pdf" {
  const format = req.query.format as string | undefined;
  if (format === "pdf") return "pdf";
  return "csv";
}

export const exportController = {
  /**
   * GET /exports/transactions — Download transactions as CSV or PDF.
   * Supports same filters as the custom report query.
   * Query param: format=csv|pdf (default: csv)
   */
  async exportTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const format = getFormat(req);
      const {
        startDate,
        endDate,
        categoryId,
        paymentMethodId,
        budgetId,
        savingsGoalId,
        type,
        minAmount,
        maxAmount,
      } = req.query as Record<string, string | undefined>;

      const filters = {
        startDate,
        endDate,
        categoryId,
        paymentMethodId,
        budgetId,
        savingsGoalId,
        type: type as "INCOME" | "EXPENSE" | "TRANSFER" | undefined,
        minAmount: minAmount ? Number(minAmount) : undefined,
        maxAmount: maxAmount ? Number(maxAmount) : undefined,
      };

      const now = new Date().toISOString().slice(0, 10);

      if (format === "pdf") {
        const pdfBuffer = await pdfExportService.generateTransactionsPdf(req.user.id, filters as any, req.user.email);
        const filename = `transactions-${now}.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", pdfBuffer.length);
        res.end(pdfBuffer);
      } else {
        const csv = await exportService.generateTransactionsCsv(req.user.id, filters);
        const filename = `transactions-${now}.csv`;

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(csv);
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /exports/reports — Download a report as CSV or PDF.
   * Query params: type (required), format=csv|pdf (default: csv)
   */
  async exportReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const format = getFormat(req);
      const { type, year, month, date, startDate, endDate, budgetId, savingsGoalId } = req.query as Record<string, string | undefined>;

      const query = {
        type: type ?? "summary",
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined,
        date,
        startDate,
        endDate,
        budgetId,
        savingsGoalId,
      };

      const now = new Date().toISOString().slice(0, 10);

      if (format === "pdf") {
        const pdfBuffer = await pdfExportService.generateReportPdf(req.user.id, query, req.user.email);
        const filename = `report-${type ?? "summary"}-${now}.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", pdfBuffer.length);
        res.end(pdfBuffer);
      } else {
        const csv = await exportService.generateReportCsv(req.user.id, query);
        const filename = `report-${type ?? "summary"}-${now}.csv`;

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(csv);
      }
    } catch (err) {
      next(err);
    }
  },
};
