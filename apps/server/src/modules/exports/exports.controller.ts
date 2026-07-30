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

/** Parse columns from query param (comma-separated string or pre-parsed array). */
function parseColumns(val: unknown): string[] | undefined {
  if (!val) return undefined;
  if (Array.isArray(val)) return val.map((c) => String(c).trim().toLowerCase());
  return String(val).split(",").map((c) => c.trim().toLowerCase());
}

// ─── File Naming ────────────────────────────────────────────────

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const TYPE_LABELS: Record<string, string> = {
  EXPENSE: "expenses",
  INCOME: "income",
  TRANSFER: "transfers",
};

/** Today's date as YYYY-MM-DD string (cached once per request). */
const todayStr = () => new Date().toISOString().slice(0, 10);

/**
 * Build a descriptive export filename.
 *
 * Examples:
 *   transactions-2026-08-01.csv
 *   expenses-2026-08-01.csv
 *   monthly-report-july-2026.pdf
 *   daily-report-2026-08-01.csv
 */
function buildExportFilename(
  context: {
    type: "transactions" | "report";
    reportType?: string;
    transactionType?: string;
    format: string;
    date?: string;
    year?: number;
    month?: number;
    startDate?: string;
    endDate?: string;
  }
): string {
  const ext = context.format === "pdf" ? "pdf" : "csv";

  if (context.type === "transactions") {
    // Transaction exports
    const prefix = context.transactionType
      ? (TYPE_LABELS[context.transactionType] ?? "transactions")
      : "transactions";

    if (context.startDate && context.endDate) {
      return `${prefix}-${context.startDate}-to-${context.endDate}.${ext}`;
    }
    return `${prefix}-${context.date ?? todayStr()}.${ext}`;
  }

  // Report exports
  const rt = context.reportType ?? "summary";

  switch (rt) {
    case "daily":
      return `daily-report-${context.date ?? todayStr()}.${ext}`;

    case "weekly":
      return `weekly-report-${context.date ?? todayStr()}.${ext}`;

    case "monthly": {
      const month = context.month ?? new Date().getMonth() + 1;
      const year = context.year ?? new Date().getFullYear();
      const monthName = MONTH_NAMES[month - 1] ?? "unknown";
      return `monthly-report-${monthName}-${year}.${ext}`;
    }

    case "yearly":
      return `yearly-report-${context.year ?? new Date().getFullYear()}.${ext}`;

    case "summary": {
      const range = context.startDate && context.endDate
        ? `${context.startDate}-to-${context.endDate}`
        : todayStr();
      return `summary-report-${range}.${ext}`;
    }

    case "breakdown": {
      const range = context.startDate && context.endDate
        ? `${context.startDate}-to-${context.endDate}`
        : todayStr();
      return `breakdown-report-${range}.${ext}`;
    }

    default:
      return `report-${rt}-${todayStr()}.${ext}`;
  }
}

export const exportController = {
  /**
   * GET /exports/transactions — Download transactions as CSV or PDF.
   * Supports filters + options: columns, sortBy, sortOrder, orientation (PDF).
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
        sortBy,
        sortOrder,
        columns: columnsRaw,
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
        sortBy: sortBy as "date" | "amount" | "description" | "type" | undefined,
        sortOrder: sortOrder as "asc" | "desc" | undefined,
        columns: parseColumns(columnsRaw) as any,
      };

      if (format === "pdf") {
        const pdfBuffer = await pdfExportService.generateTransactionsPdf(req.user.id, filters as any, req.user.email);
        const filename = buildExportFilename({
          type: "transactions",
          transactionType: type,
          format: "pdf",
          startDate,
          endDate,
          date: todayStr(),
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", pdfBuffer.length);
        res.end(pdfBuffer);
      } else {
        const csv = await exportService.generateTransactionsCsv(req.user.id, filters);
        const filename = buildExportFilename({
          type: "transactions",
          transactionType: type,
          format: "csv",
          startDate,
          endDate,
          date: todayStr(),
        });

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
      const { type, year, month, date, startDate, endDate, budgetId, savingsGoalId, orientation, sortBy, sortOrder, columns: columnsRaw } = req.query as Record<string, string | undefined>;

      const query = {
        type: type ?? "summary",
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined,
        date,
        startDate,
        endDate,
        budgetId,
        savingsGoalId,
        orientation: orientation as "portrait" | "landscape" | undefined,
        sortBy: sortBy as "date" | "amount" | "description" | "type" | undefined,
        sortOrder: sortOrder as "asc" | "desc" | undefined,
        columns: parseColumns(columnsRaw) as any,
      };

      if (format === "pdf") {
        const pdfBuffer = await pdfExportService.generateReportPdf(req.user.id, query, req.user.email);
        const filename = buildExportFilename({
          type: "report",
          reportType: type ?? "summary",
          format: "pdf",
          date,
          year: year ? Number(year) : undefined,
          month: month ? Number(month) : undefined,
          startDate,
          endDate,
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", pdfBuffer.length);
        res.end(pdfBuffer);
      } else {
        const csv = await exportService.generateReportCsv(req.user.id, query);
        const filename = buildExportFilename({
          type: "report",
          reportType: type ?? "summary",
          format: "csv",
          date,
          year: year ? Number(year) : undefined,
          month: month ? Number(month) : undefined,
          startDate,
          endDate,
        });

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(csv);
      }
    } catch (err) {
      next(err);
    }
  },
};
