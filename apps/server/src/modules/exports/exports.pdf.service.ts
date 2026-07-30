import PDFDocument from "pdfkit";
import { reportService } from "../reports/reports.service";
import { reportRepository } from "../reports/reports.repository";

// ─── Color Palette ─────────────────────────────────────────────

const COLORS = {
  primary: "#1E40AF", // Deep blue
  secondary: "#3B82F6", // Blue
  accent: "#10B981", // Green
  danger: "#EF4444", // Red
  warning: "#F59E0B", // Amber
  textPrimary: "#1F2937", // Dark gray
  textSecondary: "#6B7280", // Medium gray
  textMuted: "#9CA3AF", // Light gray
  border: "#E5E7EB", // Light border
  bgLight: "#F9FAFB", // Light background
  bgHeader: "#EFF6FF", // Blue-ish header bg
  white: "#FFFFFF",
};

// ─── Constants ─────────────────────────────────────────────────

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_LEFT = 50;
const MARGIN_RIGHT = 50;
const MARGIN_TOP = 50;
const MARGIN_BOTTOM = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const TABLE_ROW_HEIGHT = 18;
const SECTION_GAP = 20;
const LINE_HEIGHT = 14;

// ─── Helper Functions ──────────────────────────────────────────

/**
 * Format a number as currency string (e.g., "$1,234.56")
 */
function fmtCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Format a date to a readable string (e.g., "Jul 30, 2026")
 */
function fmtDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Truncate text to fit within a given width.
 */
function truncateText(text: string, maxWidth: number, doc: PDFDocument): string {
  // If the first word alone is wider than maxWidth, truncate it character by character
  const ellipsis = "...";
  let truncated = text;

  while (doc.fontSize(9).widthOfString(truncated + ellipsis) > maxWidth && truncated.length > 1) {
    truncated = truncated.slice(0, -1);
  }

  return truncated.length < text.length ? truncated + ellipsis : text;
}

// ─── PDF Generator Class ───────────────────────────────────────

/**
 * Generates professional financial report PDFs using pdfkit.
 *
 * Layout:
 * ┌─────────────────────────────────┐
 * │         REPORT TITLE            │  ← Title block (centered)
 * │   User Info | Date Range        │  ← Metadata row
 * ├─────────────────────────────────┤
 * │  FINANCIAL SUMMARY              │  ← Summary cards (Income | Expenses | Net)
 * │  $5,000.00   $42.50   $4,957.50 │
 * ├─────────────────────────────────┤
 * │  TRANSACTIONS TABLE             │  ← Table with columns
 * │  Date   Type   Amount   Desc... │
 * ├─────────────────────────────────┤
 * │  CATEGORY SUMMARY               │  ← Category breakdown
 * │  Food      $42.50   100%        │
 * ├─────────────────────────────────┤
 * │  Generated: Jul 30, 2026        │  ← Footer
 * └─────────────────────────────────┘
 */
class ReportPdfGenerator {
  private doc: PDFDocument;
  private y: number;

  constructor() {
    this.doc = new PDFDocument({
      size: "LETTER",
      margin: MARGIN_LEFT,
      info: {
        Title: "Financial Report - Expense Tracker Pro",
        Author: "Expense Tracker Pro",
        Subject: "Financial Report",
      },
      compress: false,
    });
    this.y = MARGIN_TOP;
  }

  // ─── Public API ────────────────────────────────────────────

  /**
   * Generate a PDF buffer for a report of the given type.
   */
  async generateReportPdf(
    userId: string,
    query: {
      type: string;
      date?: string;
      year?: number;
      month?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Buffer> {
    const buffers: Buffer[] = [];

    this.doc.on("data", (chunk: Buffer) => buffers.push(chunk));

    // Delegate to the appropriate report generator
    switch (query.type) {
      case "daily":
        await this.generateDailyReport(userId, query.date ?? new Date().toISOString().slice(0, 10));
        break;
      case "weekly":
        await this.generateWeeklyReport(userId, query.date ?? new Date().toISOString().slice(0, 10));
        break;
      case "monthly":
        await this.generateMonthlyReport(
          userId,
          query.year ?? new Date().getFullYear(),
          query.month ?? new Date().getMonth() + 1
        );
        break;
      case "yearly":
        await this.generateYearlyReport(userId, query.year ?? new Date().getFullYear());
        break;
      case "summary":
        await this.generateSummaryReport(userId, query.startDate, query.endDate);
        break;
      case "breakdown":
        await this.generateBreakdownReport(userId, query.startDate, query.endDate);
        break;
      default:
        throw new Error(`Unknown report type: ${query.type}`);
    }

    this.doc.end();

    return new Promise((resolve) => {
      this.doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }

  /**
   * Generate a PDF buffer for transactions.
   */
  async generateTransactionsPdf(
    userId: string,
    filters: Record<string, unknown>
  ): Promise<Buffer> {
    const buffers: Buffer[] = [];
    this.doc.on("data", (chunk: Buffer) => buffers.push(chunk));

    const dbFilters: Record<string, unknown> = {};
    if (filters.startDate) dbFilters.startDate = new Date(filters.startDate as string);
    if (filters.endDate) dbFilters.endDate = new Date(filters.endDate as string);
    if (filters.categoryId) dbFilters.categoryId = filters.categoryId;
    if (filters.paymentMethodId) dbFilters.paymentMethodId = filters.paymentMethodId;
    if (filters.type) dbFilters.type = filters.type;
    if (filters.minAmount !== undefined) dbFilters.minAmount = filters.minAmount;
    if (filters.maxAmount !== undefined) dbFilters.maxAmount = filters.maxAmount;

    const summary = await reportService.getSummary(
      userId,
      filters.startDate as string | undefined,
      filters.endDate as string | undefined
    );
    const transactions = await reportRepository.findCustomTransactions(
      userId,
      dbFilters as any
    );

    // Title
    this.addTitle("Transaction Export");

    // Date range
    const rangeStr =
      filters.startDate || filters.endDate
        ? `${filters.startDate ?? "earliest"} — ${filters.endDate ?? "today"}`
        : "All transactions";
    this.addMetadata("Date Range", rangeStr);

    this.addSectionGap();

    // Summary
    this.addSummaryCards(summary);

    this.addSectionGap();

    // Transactions table
    this.addTransactionTable(transactions);

    this.addFooter();
    this.doc.end();

    return new Promise((resolve) => {
      this.doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }

  // ─── Report Generators ─────────────────────────────────────

  private async generateDailyReport(userId: string, dateStr: string) {
    const report = await reportService.getDailyReport(userId, dateStr);

    this.addTitle("Daily Financial Report");
    this.addMetadata("Date", fmtDate(dateStr));
    this.addSectionGap();

    this.addSummaryCards({
      income: report.income,
      expenses: report.expenses,
      netBalance: report.balance,
      transactionCount: report.transactionCount,
      savingsRate: report.income > 0 ? Math.round((report.balance / report.income) * 10000) / 100 : 0,
    } as any);
    this.addSectionGap();

    this.addTransactionTable(report.transactions);
    this.addSectionGap();

    this.addCategorySummary(report.spendingByCategory);
    this.addFooter();
  }

  private async generateWeeklyReport(userId: string, dateStr: string) {
    const report = await reportService.getWeeklyReport(userId, dateStr);

    this.addTitle("Weekly Financial Report");
    this.addMetadata("Period", report.weekLabel);
    this.addSectionGap();

    this.addSummaryCards({
      income: report.income,
      expenses: report.expenses,
      netBalance: report.balance,
      transactionCount: report.transactionCount,
    } as any);
    this.addSectionGap();

    // Daily breakdown
    this.addSectionTitle("Daily Breakdown");
    this.addMinimalTable(
      ["Date", "Day", "Income", "Expenses", "Transactions"],
      report.dailyBreakdown.map((day: any) => [
        fmtDate(day.date),
        day.dayName,
        fmtCurrency(day.income),
        fmtCurrency(day.expenses),
        String(day.transactionCount),
      ])
    );
    this.addSectionGap();

    this.addTransactionTable(report.transactions);
    this.addSectionGap();

    this.addCategorySummary(report.spendingByCategory);
    this.addFooter();
  }

  private async generateMonthlyReport(userId: string, year: number, month: number) {
    const report = await reportService.getMonthlyReport(userId, year, month);

    this.addTitle("Monthly Financial Report");
    this.addMetadata("Period", report.label);
    this.addSectionGap();

    this.addSummaryCards({
      income: report.income,
      expenses: report.expenses,
      netBalance: report.netSavings,
      transactionCount: report.transactionCount,
    } as any);

    this.addSectionGap();
    this.addCategoryBreakdown(report.categorySummary);

    this.addSectionGap();
    this.addPaymentMethodSummary(report.paymentMethodSummary);

    if (report.budgetPerformance.length > 0) {
      this.addSectionGap();
      this.addBudgetPerformance(report.budgetPerformance);
    }

    this.addFooter();
  }

  private async generateYearlyReport(userId: string, year: number) {
    const report = await reportService.getYearlyReport(userId, year);

    this.addTitle("Yearly Financial Report");
    this.addMetadata("Year", String(report.year));
    this.addSectionGap();

    this.addSummaryCards({
      income: report.income,
      expenses: report.expenses,
      netBalance: report.netSavings,
      transactionCount: report.transactionCount,
    } as any);

    this.addSectionGap();
    this.addSectionTitle("Monthly Comparison");
    this.addMinimalTable(
      ["Month", "Income", "Expenses", "Net"],
      report.monthlyComparison.map((mc: any) => [
        mc.label,
        fmtCurrency(mc.income),
        fmtCurrency(mc.expenses),
        fmtCurrency(mc.net),
      ])
    );

    this.addSectionGap();
    this.addCategoryBreakdown(report.topCategories);

    if (report.budgetPerformance.length > 0) {
      this.addSectionGap();
      this.addBudgetPerformance(report.budgetPerformance);
    }

    this.addFooter();
  }

  private async generateSummaryReport(userId: string, startDate?: string, endDate?: string) {
    const summary = await reportService.getSummary(userId, startDate, endDate);

    this.addTitle("Financial Report Summary");
    if (startDate || endDate) {
      this.addMetadata(
        "Period",
        `${startDate ?? "earliest"} — ${endDate ?? "today"}`
      );
    }
    this.addSectionGap();

    this.addSummaryCards(summary);

    this.addSectionGap();
    this.addDetailedSummary(summary);
    this.addFooter();
  }

  private async generateBreakdownReport(userId: string, startDate?: string, endDate?: string) {
    const breakdown = await reportService.getBreakdown(userId, startDate, endDate);

    this.addTitle("Financial Report Breakdown");
    if (startDate || endDate) {
      this.addMetadata(
        "Period",
        `${startDate ?? "earliest"} — ${endDate ?? "today"}`
      );
    }
    this.addSectionGap();

    // Income vs Expense
    this.addSectionTitle("Income vs Expense");
    this.addMinimalTable(
      ["Metric", "Value"],
      [
        ["Income", fmtCurrency(breakdown.incomeVsExpense.income)],
        ["Expenses", fmtCurrency(breakdown.incomeVsExpense.expenses)],
        ["Net", fmtCurrency(breakdown.incomeVsExpense.net)],
        ["Income Count", String(breakdown.incomeVsExpense.incomeCount)],
        ["Expense Count", String(breakdown.incomeVsExpense.expenseCount)],
        ["Income %", `${breakdown.incomeVsExpense.incomePercentage}%`],
        ["Expense %", `${breakdown.incomeVsExpense.expensePercentage}%`],
      ]
    );

    this.addSectionGap();
    this.addCategoryBreakdown(breakdown.categoryBreakdown);

    this.addSectionGap();
    this.addPaymentMethodSummary(breakdown.paymentMethodBreakdown);

    // Largest transaction
    if (breakdown.largestTransaction) {
      this.addSectionGap();
      this.addSectionTitle("Largest Transaction");
      const lt = breakdown.largestTransaction;
      this.addInfoRow("Amount", fmtCurrency(lt.amount));
      this.addInfoRow("Description", lt.description);
      this.addInfoRow("Category", lt.categoryName);
      this.addInfoRow("Type", lt.type);
      this.addInfoRow("Date", fmtDate(lt.date));
    }

    // Smallest transaction
    if (breakdown.smallestTransaction) {
      this.addSectionGap();
      this.addSectionTitle("Smallest Transaction");
      const st = breakdown.smallestTransaction;
      this.addInfoRow("Amount", fmtCurrency(st.amount));
      this.addInfoRow("Description", st.description);
      this.addInfoRow("Category", st.categoryName);
      this.addInfoRow("Type", st.type);
      this.addInfoRow("Date", fmtDate(st.date));
    }

    this.addFooter();
  }

  // ─── Layout Primitives ─────────────────────────────────────

  /**
   * Check if we need a new page and add one if necessary.
   */
  private checkPage(requiredSpace: number = 60) {
    if (this.y + requiredSpace > PAGE_HEIGHT - MARGIN_BOTTOM) {
      this.addFooter();
      this.doc.addPage();
      this.y = MARGIN_TOP;
    }
  }

  /**
   * Add the report title (centered, large, blue).
   */
  private addTitle(title: string) {
    this.checkPage(80);
    this.doc
      .fontSize(22)
      .fillColor(COLORS.primary)
      .text(title, MARGIN_LEFT, this.y, {
        align: "center",
        width: CONTENT_WIDTH,
      });
    this.y = this.doc.y + 4;

    // Underline
    this.doc
      .moveTo(MARGIN_LEFT + 60, this.y)
      .lineTo(PAGE_WIDTH - MARGIN_LEFT - 60, this.y)
      .strokeColor(COLORS.secondary)
      .lineWidth(1.5)
      .stroke();
    this.y += 12;

    // "Expense Tracker Pro" subtitle
    this.doc
      .fontSize(9)
      .fillColor(COLORS.textMuted)
      .text("Expense Tracker Pro", MARGIN_LEFT, this.y, {
        align: "center",
        width: CONTENT_WIDTH,
      });
    this.y = this.doc.y + 6;
  }

  /**
   * Add a metadata row (e.g., date, period).
   */
  private addMetadata(label: string, value: string) {
    this.checkPage(30);
    this.doc
      .fontSize(10)
      .fillColor(COLORS.textSecondary);
    this.doc.text(label + ": ", MARGIN_LEFT, this.y, { continued: true });
    this.doc
      .fillColor(COLORS.textPrimary)
      .text(value, { continued: false });
    this.y = this.doc.y + 2;
  }

  /**
   * Add section gap (vertical space).
   */
  private addSectionGap() {
    this.y += SECTION_GAP;
  }

  /**
   * Add a section title (e.g., "Financial Summary", "Transactions").
   */
  private addSectionTitle(title: string) {
    this.checkPage(40);
    this.doc
      .fontSize(14)
      .fillColor(COLORS.primary)
      .text(title, MARGIN_LEFT, this.y, {
        width: CONTENT_WIDTH,
      });
    this.y = this.doc.y + 4;

    // Light underline
    this.doc
      .moveTo(MARGIN_LEFT, this.y)
      .lineTo(PAGE_WIDTH - MARGIN_RIGHT, this.y)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();
    this.y += 8;
  }

  /**
   * Add financial summary cards (Income, Expenses, Net Balance, etc.).
   */
  private addSummaryCards(summary: {
    income: number;
    expenses: number;
    netBalance?: number;
    savingsRate?: number;
    transactionCount?: number;
  }) {
    this.checkPage(90);
    this.addSectionTitle("Financial Summary");

    const cardWidth = (CONTENT_WIDTH - 32) / 3;
    const cardHeight = 60;
    const cards = [
      { label: "Total Income", value: fmtCurrency(summary.income), color: COLORS.accent },
      { label: "Total Expenses", value: fmtCurrency(summary.expenses), color: COLORS.danger },
      {
        label: "Net Balance",
        value: fmtCurrency(summary.netBalance ?? summary.income - summary.expenses),
        color: (summary.netBalance ?? summary.income - summary.expenses) >= 0 ? COLORS.accent : COLORS.danger,
      },
    ];

    if (summary.savingsRate !== undefined) {
      cards.push({
        label: "Savings Rate",
        value: `${summary.savingsRate.toFixed(1)}%`,
        color: summary.savingsRate >= 20 ? COLORS.accent : COLORS.warning,
      });
    }

    if (summary.transactionCount !== undefined) {
      cards.push({
        label: "Transactions",
        value: String(summary.transactionCount),
        color: COLORS.secondary,
      });
    }

    const startX = MARGIN_LEFT;

    cards.forEach((card, i) => {
      const x = startX + i * (cardWidth + 16);
      const cardColor = card.color;

      // Card background
      this.doc
        .roundedRect(x, this.y, cardWidth, cardHeight, 6)
        .fillColor(COLORS.white)
        .fill()
        .roundedRect(x, this.y, cardWidth, cardHeight, 6)
        .lineWidth(1)
        .strokeColor(COLORS.border)
        .stroke();

      // Left accent bar
      this.doc
        .rect(x, this.y, 4, cardHeight)
        .fillColor(cardColor)
        .fill();

      // Label
      this.doc
        .fontSize(8)
        .fillColor(COLORS.textSecondary)
        .text(card.label, x + 12, this.y + 8, {
          width: cardWidth - 20,
        });

      // Value
      const valueY = this.y + 24;
      this.doc
        .fontSize(16)
        .fillColor(COLORS.textPrimary)
        .text(card.value, x + 12, valueY, {
          width: cardWidth - 20,
        });
    });

    this.y += cardHeight + 12;
  }

  /**
   * Add a transactions table with columns.
   */
  private addTransactionTable(transactions: any[]) {
    this.checkPage(60);
    this.addSectionTitle("Transactions");

    if (transactions.length === 0) {
      this.doc
        .fontSize(10)
        .fillColor(COLORS.textMuted)
        .text("No transactions found for this period.", MARGIN_LEFT, this.y);
      this.y += 20;
      return;
    }

    const colWidths = [100, 60, 65, 180, 100];
    const headers = ["Date", "Type", "Amount", "Description", "Category"];

    // Table header
    const tableX = MARGIN_LEFT;

    // Header background
    this.doc
      .rect(tableX, this.y, CONTENT_WIDTH, TABLE_ROW_HEIGHT + 4)
      .fillColor(COLORS.bgHeader)
      .fill();

    let hx = tableX + 8;
    headers.forEach((header, i) => {
      this.doc
        .fontSize(9)
        .fillColor(COLORS.primary)
        .text(header, hx, this.y + 4, {
          width: colWidths[i],
          lineBreak: false,
        });
      hx += colWidths[i];
    });

    this.y += TABLE_ROW_HEIGHT + 4;

    // Table rows
    const displayTransactions = transactions.slice(0, 50); // Limit to 50 rows
    let rowIndex = 0;

    for (const tx of displayTransactions) {
      this.checkPage(TABLE_ROW_HEIGHT + 10);

      // Alternating row background
      if (rowIndex % 2 === 1) {
        this.doc
          .rect(tableX, this.y, CONTENT_WIDTH, TABLE_ROW_HEIGHT)
          .fillColor(COLORS.bgLight)
          .fill();
      }

      hx = tableX + 8;
      const values = [
        fmtDate(tx.date),
        tx.type === "INCOME" ? "Income" : tx.type === "EXPENSE" ? "Expense" : tx.type,
        fmtCurrency(tx.amount),
        tx.description || "-",
        tx.categoryName || tx.category?.name || "-",
      ];

      values.forEach((val, i) => {
        const displayVal = i === 3
          ? truncateText(val, colWidths[i] - 10, this.doc)
          : val;

        // Color for amount
        const color =
          i === 2
            ? tx.type === "INCOME"
              ? COLORS.accent
              : tx.type === "EXPENSE"
                ? COLORS.danger
                : COLORS.textPrimary
            : COLORS.textPrimary;

        this.doc
          .fontSize(9)
          .fillColor(color)
          .text(displayVal, hx, this.y + 3, {
            width: colWidths[i],
            lineBreak: false,
          });
        hx += colWidths[i];
      });

      this.y += TABLE_ROW_HEIGHT;
      rowIndex++;
    }

    if (transactions.length > 50) {
      this.doc
        .fontSize(9)
        .fillColor(COLORS.textMuted)
        .text(
          `... and ${transactions.length - 50} more transactions`,
          tableX,
          this.y + 2
        );
      this.y += 16;
    }

    this.y += 4;
  }

  /**
   * Add category summary (compact).
   */
  private addCategorySummary(categories: any[]) {
    this.checkPage(40);
    this.addSectionTitle("Spending by Category");

    if (categories.length === 0) {
      this.doc
        .fontSize(10)
        .fillColor(COLORS.textMuted)
        .text("No spending data available.", MARGIN_LEFT, this.y);
      this.y += 20;
      return;
    }

    this.addMinimalTable(
      ["Category", "Total", "Count", "%"],
      categories.map((cat: any) => [
        cat.categoryName,
        fmtCurrency(cat.total),
        String(cat.count),
        cat.percentage !== undefined ? `${cat.percentage}%` : "-",
      ])
    );
  }

  /**
   * Add category breakdown with percentages (category, total, count, %).
   */
  private addCategoryBreakdown(categories: any[]) {
    this.checkPage(40);
    this.addSectionTitle("Category Breakdown");

    if (categories.length === 0) {
      this.doc
        .fontSize(10)
        .fillColor(COLORS.textMuted)
        .text("No category data available.", MARGIN_LEFT, this.y);
      this.y += 20;
      return;
    }

    this.addMinimalTable(
      ["Category", "Total", "Count", "%"],
      categories.map((cat: any) => [
        cat.categoryName,
        fmtCurrency(cat.total),
        String(cat.count),
        cat.percentage !== undefined ? `${cat.percentage}%` : "-",
      ])
    );
  }

  /**
   * Add payment method summary table.
   */
  private addPaymentMethodSummary(paymentMethods: any[]) {
    this.checkPage(40);
    this.addSectionTitle("Payment Method Summary");

    if (paymentMethods.length === 0) {
      this.doc
        .fontSize(10)
        .fillColor(COLORS.textMuted)
        .text("No payment method data available.", MARGIN_LEFT, this.y);
      this.y += 20;
      return;
    }

    this.addMinimalTable(
      ["Method", "Income", "Expense", "Net", "Transactions"],
      paymentMethods.map((pm: any) => [
        pm.paymentMethodName || pm.method || "Unknown",
        fmtCurrency(pm.totalIncome ?? 0),
        fmtCurrency(pm.totalExpense ?? 0),
        fmtCurrency(pm.netAmount ?? 0),
        String(pm.transactionCount ?? 0),
      ])
    );
  }

  /**
   * Add budget performance table.
   */
  private addBudgetPerformance(budgets: any[]) {
    this.checkPage(40);
    this.addSectionTitle("Budget Performance");

    if (budgets.length === 0) {
      this.doc
        .fontSize(10)
        .fillColor(COLORS.textMuted)
        .text("No budget data available.", MARGIN_LEFT, this.y);
      this.y += 20;
      return;
    }

    this.addMinimalTable(
      ["Category", "Budgeted", "Spent", "Remaining", "% Used", "Status"],
      budgets.map((bp: any) => [
        bp.categoryName,
        fmtCurrency(bp.budgeted),
        fmtCurrency(bp.spent),
        fmtCurrency(bp.remaining),
        `${bp.percentage}%`,
        bp.status === "critical" ? "⚠ Critical" : bp.status === "warning" ? "⚡ Warning" : "✅ On Track",
      ])
    );
  }

  /**
   * Add a detailed summary table (for the summary report).
   */
  private addDetailedSummary(summary: any) {
    this.checkPage(60);
    this.addSectionTitle("Detailed Summary");
    this.addMinimalTable(
      ["Metric", "Value"],
      [
        ["Total Income", fmtCurrency(summary.income)],
        ["Total Expenses", fmtCurrency(summary.expenses)],
        ["Net Balance", fmtCurrency(summary.netBalance)],
        ["Savings Rate", `${summary.savingsRate}%`],
        ["Total Transactions", String(summary.transactionCount)],
        ["Income Transactions", String(summary.incomeCount)],
        ["Expense Transactions", String(summary.expenseCount)],
        ["Average Transaction", fmtCurrency(summary.averageTransactionAmount)],
        ["Average Income", fmtCurrency(summary.averageIncome)],
        ["Average Expense", fmtCurrency(summary.averageExpense)],
      ]
    );
  }

  /**
   * Add a generic minimal table.
   */
  private addMinimalTable(headers: string[], rows: string[][]) {
    if (rows.length === 0) return;

    const colCount = headers.length;
    // Distribute width evenly or based on content
    const availableWidth = CONTENT_WIDTH - 16; // 8px padding on each side
    const avgColWidth = Math.floor(availableWidth / colCount);

    const startX = MARGIN_LEFT;
    const rowHeight = 18;

    // Check if we need a new page
    this.checkPage(rowHeight + 4 + rows.length * rowHeight + 10);

    // Header row
    this.doc
      .rect(startX, this.y, CONTENT_WIDTH, rowHeight + 2)
      .fillColor(COLORS.bgHeader)
      .fill();

    let hx = startX + 8;
    headers.forEach((header) => {
      this.doc
        .fontSize(8)
        .fillColor(COLORS.primary);
      // Bold headers by using font (Helvetica-Bold is available by default in pdfkit)
      this.doc
        .font("Helvetica-Bold")
        .text(header, hx, this.y + 3, {
          width: avgColWidth,
          lineBreak: false,
        });
      hx += avgColWidth;
    });

    this.y += rowHeight + 2;

    // Data rows
    rows.forEach((row, rowIdx) => {
      this.checkPage(rowHeight + 4);

      // Alternating background
      if (rowIdx % 2 === 1) {
        this.doc
          .rect(startX, this.y, CONTENT_WIDTH, rowHeight)
          .fillColor(COLORS.bgLight)
          .fill();
      }

      let rx = startX + 8;
      row.forEach((cell, cellIdx) => {
        const isAmount = /^[\$|\-]/.test(cell);
        const isPercent = cell.endsWith("%");

        this.doc
          .fontSize(8)
          .font(isAmount || isPercent ? "Helvetica" : "Helvetica");

        // Color for amounts
        const color = cell.startsWith("-$") || (cell.startsWith("$") && cellIdx > 0 && row[0].includes("Expense"))
          ? COLORS.danger
          : cell.startsWith("$")
            ? COLORS.accent
            : COLORS.textPrimary;

        const displayVal = truncateText(cell, avgColWidth - 4, this.doc);

        this.doc
          .fillColor(color)
          .text(displayVal, rx, this.y + 3, {
            width: avgColWidth,
            lineBreak: false,
          });
        rx += avgColWidth;
      });

      this.y += rowHeight;
    });

    this.y += 4;
  }

  /**
   * Add a simple info row (label: value).
   */
  private addInfoRow(label: string, value: string) {
    this.checkPage(LINE_HEIGHT + 6);
    this.doc
      .fontSize(10)
      .fillColor(COLORS.textSecondary);
    this.doc.text(`  ${label}: `, MARGIN_LEFT, this.y, { continued: true });
    this.doc
      .fillColor(COLORS.textPrimary)
      .text(value);
    this.y = this.doc.y + 2;
  }

  /**
   * Add footer with generation timestamp.
   */
  private addFooter() {
    const footerY = PAGE_HEIGHT - MARGIN_BOTTOM + 10;

    // Top border of footer area
    this.doc
      .moveTo(MARGIN_LEFT, footerY - 4)
      .lineTo(PAGE_WIDTH - MARGIN_RIGHT, footerY - 4)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();

    this.doc
      .fontSize(7)
      .fillColor(COLORS.textMuted)
      .text(
        `Generated on ${fmtDate(new Date())} by Expense Tracker Pro`,
        MARGIN_LEFT,
        footerY,
        { align: "center", width: CONTENT_WIDTH }
      );
  }
}

// ─── Exports ───────────────────────────────────────────────────

export const pdfExportService = {
  /**
   * Generate a PDF buffer for a report of the given type.
   */
  async generateReportPdf(
    userId: string,
    query: {
      type: string;
      date?: string;
      year?: number;
      month?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Buffer> {
    const generator = new ReportPdfGenerator();
    return generator.generateReportPdf(userId, query);
  },

  /**
   * Generate a PDF buffer for transactions.
   */
  async generateTransactionsPdf(
    userId: string,
    filters: Record<string, unknown>
  ): Promise<Buffer> {
    const generator = new ReportPdfGenerator();
    return generator.generateTransactionsPdf(userId, filters);
  },
};
