import { reportRepository } from "./reports.repository";
import { reportMapper } from "./reports.mapper";
import { computePeriodEnd } from "../budgets/budgets.repository";

export const reportService = {
  async getCategorySummary(userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const transactions = await reportRepository.findTransactionsInRange(userId, start, end);

    const { categories, grandTotal } = reportMapper.groupTransactionsByCategory(transactions);

    return {
      startDate,
      endDate,
      grandTotal,
      categoryCount: categories.length,
      categories,
    };
  },

  async getMonthlyTrend(userId: string, year: number) {
    const transactions = await reportRepository.findTransactionsByYear(userId, year);

    const months = reportMapper.buildMonthlyMap(transactions, year);

    return {
      year,
      months,
    };
  },

  async getWeeklyReport(userId: string, dateStr: string) {
    const date = new Date(dateStr);

    // Calculate Monday of the week containing the given date
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Go back to Monday
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + mondayOffset);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59, 999);

    const startDateStr = monday.toISOString().slice(0, 10);
    const endDateStr = sunday.toISOString().slice(0, 10);

    const transactions = await reportRepository.findTransactionsInRange(
      userId,
      monday,
      sunday
    );

    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Build day-by-day breakdown
    const dayMap = new Map<
      string,
      { date: string; dayName: string; income: number; expenses: number; transactionCount: number }
    >();

    // Initialize all 7 days
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, {
        date: key,
        dayName: DAY_NAMES[d.getDay()],
        income: 0,
        expenses: 0,
        transactionCount: 0,
      });
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = new Map<
      string,
      { categoryId: string; categoryName: string; categoryColor: string; categoryIcon: string; total: number; count: number }
    >();

    const mappedTransactions = transactions.map((tx) => {
      if (tx.type === "INCOME") totalIncome += tx.amount;
      else if (tx.type === "EXPENSE") totalExpenses += tx.amount;

      // Day-by-day aggregation
      const txDateStr = new Date(tx.date).toISOString().slice(0, 10);
      const dayEntry = dayMap.get(txDateStr);
      if (dayEntry) {
        if (tx.type === "INCOME") dayEntry.income += tx.amount;
        else if (tx.type === "EXPENSE") dayEntry.expenses += tx.amount;
        dayEntry.transactionCount += 1;
      }

      // Category breakdown
      const catKey = tx.categoryId;
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          categoryColor: tx.category.color,
          categoryIcon: tx.category.icon,
          total: 0,
          count: 0,
        });
      }
      const catEntry = categoryMap.get(catKey)!;
      catEntry.total += tx.amount;
      catEntry.count += 1;

      return {
        id: tx.id,
        amount: tx.amount,
        description: tx.description,
        type: tx.type,
        date: tx.date,
        categoryId: tx.categoryId,
        categoryName: tx.category.name,
        categoryColor: tx.category.color,
        categoryIcon: tx.category.icon,
      };
    });

    const dailyBreakdown = Array.from(dayMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const spendingByCategory = Array.from(categoryMap.values()).sort(
      (a, b) => b.total - a.total
    );

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      weekLabel: `${startDateStr} - ${endDateStr}`,
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      dailyBreakdown,
      transactions: mappedTransactions,
      spendingByCategory,
    };
  },

  async getMonthlyReport(userId: string, year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch transactions, budgets, and payment methods in parallel
    const [transactions, budgets, paymentMethods] = await Promise.all([
      reportRepository.findTransactionsInMonth(userId, startOfMonth, endOfMonth),
      reportRepository.findBudgetsForUser(userId),
      reportRepository.findPaymentMethodsForUser(userId),
    ]);

    const MONTH_NAMES = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const label = `${MONTH_NAMES[month - 1]} ${year}`;
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;

    // ─── Income, Expenses, Net Savings ───
    let totalIncome = 0;
    let totalExpenses = 0;

    // ─── Category Summary ───
    const categoryMap = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        categoryColor: string;
        categoryIcon: string;
        total: number;
        count: number;
      }
    >();

    // ─── Payment Method Summary ───
    const pmMap = new Map<
      string,
      {
        paymentMethodId: string;
        paymentMethodName: string;
        paymentMethodType: string;
        paymentMethodIcon: string;
        paymentMethodColor: string;
        totalExpense: number;
        totalIncome: number;
        transactionCount: number;
      }
    >();

    // Build lookup map for payment method names
    const pmLookup = new Map(paymentMethods.map((pm) => [pm.id, pm]));

    for (const tx of transactions) {
      if (tx.type === "INCOME") totalIncome += tx.amount;
      else if (tx.type === "EXPENSE") totalExpenses += tx.amount;

      // Category aggregation
      const catKey = tx.categoryId;
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          categoryColor: tx.category.color,
          categoryIcon: tx.category.icon,
          total: 0,
          count: 0,
        });
      }
      const catEntry = categoryMap.get(catKey)!;
      catEntry.total += tx.amount;
      catEntry.count += 1;

      // Payment method aggregation
      if (tx.paymentMethodId) {
        const pmKey = tx.paymentMethodId;
        if (!pmMap.has(pmKey)) {
          const pm = pmLookup.get(pmKey);
          pmMap.set(pmKey, {
            paymentMethodId: pmKey,
            paymentMethodName: pm?.name ?? "Unknown",
            paymentMethodType: pm?.type ?? "OTHER",
            paymentMethodIcon: pm?.icon ?? "CreditCard",
            paymentMethodColor: pm?.color ?? "#6366F1",
            totalExpense: 0,
            totalIncome: 0,
            transactionCount: 0,
          });
        }
        const pmEntry = pmMap.get(pmKey)!;
        if (tx.type === "EXPENSE") pmEntry.totalExpense += tx.amount;
        else if (tx.type === "INCOME") pmEntry.totalIncome += tx.amount;
        pmEntry.transactionCount += 1;
      }
    }

    // ─── Category Summary with percentages ───
    const categorySummary = Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        percentage:
          totalExpenses > 0
            ? Math.round((cat.total / totalExpenses) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // ─── Payment Method Summary ───
    const paymentMethodSummary = Array.from(pmMap.values())
      .map((pm) => ({
        ...pm,
        netAmount: pm.totalIncome - pm.totalExpense,
      }))
      .sort((a, b) => b.transactionCount - a.transactionCount);

    // ─── Budget Performance ───
    // Filter budgets whose period overlaps with the requested month
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const scopedBudgets = budgets.filter((budget) => {
      const periodEnd = computePeriodEnd(budget.startDate, budget.period);
      // Budget overlaps with month if: budget.startDate <= monthEnd AND periodEnd >= monthStart
      return budget.startDate <= monthEnd && periodEnd >= monthStart;
    });

    // Get spending by category for this month using the already-fetched data
    const spendingByCategory = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type === "EXPENSE") {
        spendingByCategory.set(
          tx.categoryId,
          (spendingByCategory.get(tx.categoryId) ?? 0) + tx.amount
        );
      }
    }

    const budgetPerformance = scopedBudgets.map((budget) => {
      const spent = spendingByCategory.get(budget.categoryId) ?? 0;
      const percentage = budget.targetAmount > 0
        ? Math.round((spent / budget.targetAmount) * 100)
        : 0;

      let status: "on_track" | "warning" | "critical" = "on_track";
      if (percentage >= 100) {
        status = "critical";
      } else if (percentage >= budget.alertThreshold) {
        status = "warning";
      }

      return {
        budgetId: budget.id,
        categoryId: budget.categoryId,
        categoryName: budget.category.name,
        budgeted: budget.targetAmount,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round((budget.targetAmount - spent) * 100) / 100,
        percentage,
        status,
      };
    });

    return {
      month: monthStr,
      label,
      income: totalIncome,
      expenses: totalExpenses,
      netSavings: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      budgetPerformance,
      categorySummary,
      paymentMethodSummary,
    };
  },

  async getYearlyReport(userId: string, year: number) {
    const MONTH_NAMES = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    // Fetch transactions and budgets in parallel
    const [transactions, budgets] = await Promise.all([
      reportRepository.findTransactionsInYearWithDetails(userId, year),
      reportRepository.findBudgetsForUser(userId),
    ]);

    // ─── Monthly comparison ───
    const monthData = new Map<
      string,
      { month: string; label: string; income: number; expenses: number }
    >();

    for (let i = 0; i < 12; i++) {
      const key = `${year}-${String(i + 1).padStart(2, "0")}`;
      monthData.set(key, {
        month: key,
        label: `${MONTH_NAMES[i]} ${year}`,
        income: 0,
        expenses: 0,
      });
    }

    let totalIncome = 0;
    let totalExpenses = 0;

    // ─── Top categories ───
    const categoryMap = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        categoryColor: string;
        categoryIcon: string;
        total: number;
        count: number;
      }
    >();

    for (const tx of transactions) {
      if (tx.type === "INCOME") {
        totalIncome += tx.amount;
      } else if (tx.type === "EXPENSE") {
        totalExpenses += tx.amount;
      }

      // Monthly aggregation
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const mEntry = monthData.get(key);
      if (mEntry) {
        if (tx.type === "INCOME") mEntry.income += tx.amount;
        else if (tx.type === "EXPENSE") mEntry.expenses += tx.amount;
      }

      // Category aggregation (all types)
      const catKey = tx.categoryId;
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          categoryColor: tx.category.color,
          categoryIcon: tx.category.icon,
          total: 0,
          count: 0,
        });
      }
      const cEntry = categoryMap.get(catKey)!;
      cEntry.total += tx.amount;
      cEntry.count += 1;
    }

    // Monthly comparison (sorted chronologically)
    const monthlyComparison = Array.from(monthData.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({
        ...m,
        net: m.income - m.expenses,
      }));

    // Top spending categories (sorted by total descending, limited to top 10)
    const topCategories = Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        percentage:
          totalExpenses > 0
            ? Math.round((cat.total / totalExpenses) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // ─── Budget performance ───
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

    const scopedBudgets = budgets.filter((budget) => {
      const periodEnd = computePeriodEnd(budget.startDate, budget.period);
      return budget.startDate <= yearEnd && periodEnd >= yearStart;
    });

    // Total expense spending by category for the year
    const yearlyExpensesByCategory = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type === "EXPENSE") {
        yearlyExpensesByCategory.set(
          tx.categoryId,
          (yearlyExpensesByCategory.get(tx.categoryId) ?? 0) + tx.amount
        );
      }
    }

    const budgetPerformance = scopedBudgets.map((budget) => {
      const spent = yearlyExpensesByCategory.get(budget.categoryId) ?? 0;
      const percentage = budget.targetAmount > 0
        ? Math.round((spent / budget.targetAmount) * 100)
        : 0;

      let status: "on_track" | "warning" | "critical" = "on_track";
      if (percentage >= 100) {
        status = "critical";
      } else if (percentage >= budget.alertThreshold) {
        status = "warning";
      }

      return {
        budgetId: budget.id,
        categoryId: budget.categoryId,
        categoryName: budget.category.name,
        budgeted: budget.targetAmount,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round((budget.targetAmount - spent) * 100) / 100,
        percentage,
        status,
      };
    });

    return {
      year,
      income: totalIncome,
      expenses: totalExpenses,
      netSavings: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      monthlyComparison,
      topCategories,
      budgetPerformance,
    };
  },

  async getCustomReport(
    userId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      categoryId?: string;
      paymentMethodId?: string;
      type?: "INCOME" | "EXPENSE" | "TRANSFER";
      minAmount?: number;
      maxAmount?: number;
    }
  ) {
    const dbFilters: {
      startDate?: Date;
      endDate?: Date;
      categoryId?: string;
      paymentMethodId?: string;
      type?: string;
      minAmount?: number;
      maxAmount?: number;
    } = {};

    if (filters.startDate) dbFilters.startDate = new Date(filters.startDate);
    if (filters.endDate) dbFilters.endDate = new Date(filters.endDate);
    if (filters.categoryId) dbFilters.categoryId = filters.categoryId;
    if (filters.paymentMethodId) dbFilters.paymentMethodId = filters.paymentMethodId;
    if (filters.type) dbFilters.type = filters.type;
    if (filters.minAmount !== undefined) dbFilters.minAmount = filters.minAmount;
    if (filters.maxAmount !== undefined) dbFilters.maxAmount = filters.maxAmount;

    const transactions = await reportRepository.findCustomTransactions(userId, dbFilters);

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        categoryColor: string;
        categoryIcon: string;
        total: number;
        count: number;
      }
    >();

    const mappedTransactions = transactions.map((tx) => {
      if (tx.type === "INCOME") totalIncome += tx.amount;
      else if (tx.type === "EXPENSE") totalExpenses += tx.amount;

      const catKey = tx.categoryId;
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          categoryColor: tx.category.color,
          categoryIcon: tx.category.icon,
          total: 0,
          count: 0,
        });
      }
      const cEntry = categoryMap.get(catKey)!;
      cEntry.total += tx.amount;
      cEntry.count += 1;

      return {
        id: tx.id,
        amount: tx.amount,
        description: tx.description,
        type: tx.type,
        date: tx.date,
        categoryId: tx.categoryId,
        categoryName: tx.category.name,
        categoryColor: tx.category.color,
        categoryIcon: tx.category.icon,
      };
    });

    const spendingByCategory = Array.from(categoryMap.values())
      .sort((a, b) => b.total - a.total);

    return {
      filters,
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      transactions: mappedTransactions,
      spendingByCategory,
    };
  },

  async getDailyReport(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    const transactions = await reportRepository.findTransactionsByDate(userId, date);

    let income = 0;
    let expenses = 0;
    const categoryMap = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        categoryColor: string;
        categoryIcon: string;
        total: number;
        count: number;
      }
    >();

    const dailyTransactions = transactions.map((tx) => {
      if (tx.type === "INCOME") income += tx.amount;
      else if (tx.type === "EXPENSE") expenses += tx.amount;

      // Track per-category breakdown
      const key = tx.categoryId;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          categoryColor: tx.category.color,
          categoryIcon: tx.category.icon,
          total: 0,
          count: 0,
        });
      }
      const entry = categoryMap.get(key)!;
      entry.total += tx.amount;
      entry.count += 1;

      return {
        id: tx.id,
        amount: tx.amount,
        description: tx.description,
        type: tx.type,
        date: tx.date,
        categoryId: tx.categoryId,
        categoryName: tx.category.name,
        categoryColor: tx.category.color,
        categoryIcon: tx.category.icon,
      };
    });

    const spendingByCategory = Array.from(categoryMap.values()).sort(
      (a, b) => b.total - a.total
    );

    return {
      date: dateStr,
      income,
      expenses,
      balance: income - expenses,
      transactionCount: transactions.length,
      transactions: dailyTransactions,
      spendingByCategory,
    };
  },
};
