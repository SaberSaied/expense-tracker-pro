export type SearchEntity =
  "transactions" | "categories" | "payment-methods" | "budgets" | "savings-goals";

export const SEARCHABLE_ENTITIES: readonly SearchEntity[] = [
  "transactions",
  "categories",
  "payment-methods",
  "budgets",
  "savings-goals",
] as const;

export type CategoryFilterType = "income" | "expense";

export type DatePreset =
  "today" | "yesterday" | "this_week" | "last_week" | "this_month" | "last_month" | "this_year";

export interface DateRange {
  start: Date;
  end: Date;
}

export type SortByField = "date" | "amount" | "title" | "category" | "created_at" | "updated_at";

export const SORTABLE_FIELDS: readonly SortByField[] = [
  "date",
  "amount",
  "title",
  "category",
  "created_at",
  "updated_at",
] as const;

export type SortOrder = "asc" | "desc";

export interface GlobalSearchQuery {
  q: string;
  entities?: SearchEntity[];
  limit?: number;
  categoryIds?: string[];
  categoryType?: CategoryFilterType;
  datePreset?: DatePreset;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  exactAmount?: number;
  sortBy?: SortByField;
  sortOrder?: SortOrder;
}

export interface SearchResultItem {
  entity: SearchEntity;
  id: string;
  title: string;
  subtitle?: string;
  type?: string;
  amount?: number;
  date?: string;
  status?: string;
  matchField?: string;
  matchPreview?: string;
}

export interface GlobalSearchResult {
  query: string;
  totalCount: number;
  results: SearchResultItem[];
  countsByEntity: Record<string, number>;
}

// ─── Search Suggestions Types ────────────────────────────────

export type SuggestionEntity =
  "recent-search" | "category" | "payment-method" | "transaction-title";

export interface SuggestionItem {
  entity: SuggestionEntity;
  id: string;
  label: string;
  subtitle?: string;
  icon?: string;
  color?: string;
}

export interface SuggestionGroup {
  entity: SuggestionEntity;
  label: string;
  items: SuggestionItem[];
}

export interface SuggestionsResult {
  query: string;
  suggestions: SuggestionGroup[];
}
