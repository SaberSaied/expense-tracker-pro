export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface CategorySummaryQuery {
  startDate?: string;
  endDate?: string;
}

export interface MonthlyTrendQuery {
  year?: number;
}

export interface CategorySummaryItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  count: number;
  percentage: number;
  transactions: Array<{
    amount: number;
    date: Date;
    description: string;
  }>;
}

export interface CategorySummary {
  startDate: string;
  endDate: string;
  grandTotal: number;
  categoryCount: number;
  categories: CategorySummaryItem[];
}

export interface MonthlyTrendMonth {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyTrend {
  year: number;
  months: MonthlyTrendMonth[];
}
