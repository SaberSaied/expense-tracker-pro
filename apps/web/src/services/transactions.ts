/**
 * Transactions API service.
 * All CRUD operations for managing user income/expense transactions.
 */
import { api, tokenStorage, ApiError, API_BASE_URL } from "./api";

// ─── Types ────────────────────────────────────────────────────

/** Transaction as returned from the API (includes category + payment method relations). */
export interface ApiTransaction {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  description: string;
  date: string;
  notes: string | null;
  receiptUrl: string | null;
  categoryId: string;
  paymentMethodId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  paymentMethod: {
    id: string;
    type: string;
    name: string;
    lastFour: string | null;
  } | null;
}

export interface CreateTransactionInput {
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  description: string;
  date: string;
  notes?: string;
  categoryId: string;
  paymentMethodId?: string | null;
}

export interface UpdateTransactionInput {
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  amount?: number;
  description?: string;
  date?: string;
  notes?: string;
  categoryId?: string;
  paymentMethodId?: string | null;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: string;
  categoryId?: string;
  paymentMethodId?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  netAmount: number;
  count: number;
}

// ─── API Response Wrappers ────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface PaginatedTransactions {
  transactions: ApiTransaction[];
}

// ─── API Functions ────────────────────────────────────────────

export const transactionsApi = {
  /**
   * GET /api/v1/transactions
   * Returns paginated transactions with optional filters.
   */
  async findAll(filters: TransactionFilters = {}): Promise<{
    transactions: ApiTransaction[];
    meta?: ApiResponse<PaginatedTransactions>["meta"];
  }> {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.type) params.set("type", filters.type);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.paymentMethodId) params.set("paymentMethodId", filters.paymentMethodId);
    if (filters.minAmount !== undefined) params.set("minAmount", String(filters.minAmount));
    if (filters.maxAmount !== undefined) params.set("maxAmount", String(filters.maxAmount));
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters.search) params.set("search", filters.search);

    const query = params.toString();
    const endpoint = query ? `/transactions?${query}` : "/transactions";
    const response = await api.get<ApiResponse<PaginatedTransactions>>(endpoint);
    return { transactions: response.data.transactions, meta: response.meta };
  },

  /**
   * GET /api/v1/transactions/:id
   * Returns a single transaction by ID.
   */
  async findById(id: string): Promise<ApiTransaction> {
    const response = await api.get<ApiResponse<{ transaction: ApiTransaction }>>(
      `/transactions/${id}`,
    );
    return response.data.transaction;
  },

  /**
   * POST /api/v1/transactions
   * Creates a new transaction.
   */
  async create(input: CreateTransactionInput): Promise<ApiTransaction> {
    const response = await api.post<ApiResponse<{ transaction: ApiTransaction }>>(
      "/transactions",
      input,
    );
    return response.data.transaction;
  },

  /**
   * PATCH /api/v1/transactions/:id
   * Updates an existing transaction.
   */
  async update(id: string, input: UpdateTransactionInput): Promise<ApiTransaction> {
    const response = await api.patch<ApiResponse<{ transaction: ApiTransaction }>>(
      `/transactions/${id}`,
      input,
    );
    return response.data.transaction;
  },

  /**
   * POST /api/v1/transactions/:id/receipt
   * Uploads a receipt image for a transaction.
   */
  async uploadReceipt(
    id: string,
    file: File,
  ): Promise<{ transaction: ApiTransaction; receiptUrl: string }> {
    const formData = new FormData();
    formData.append("receipt", file);

    const token = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/transactions/${id}/receipt`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(
        data.statusCode ?? response.status,
        data.error ?? "Upload Failed",
        data.message ?? "Failed to upload receipt",
        data.details,
      );
    }

    const data = await response.json();
    return { transaction: data.data.transaction, receiptUrl: data.data.receiptUrl };
  },

  /**
   * DELETE /api/v1/transactions/:id/receipt
   * Removes a receipt image from a transaction.
   */
  async removeReceipt(id: string): Promise<ApiTransaction> {
    const response = await api.delete<{ success: boolean; data: { transaction: ApiTransaction } }>(
      `/transactions/${id}/receipt`,
    );
    return response.data.transaction;
  },

  /**
   * DELETE /api/v1/transactions/:id
   * Deletes a transaction.
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  /**
   * POST /api/v1/transactions/bulk/delete
   * Deletes multiple transactions by ID.
   */
  async bulkDelete(ids: string[]): Promise<{ count: number }> {
    const response = await api.post<ApiResponse<{ count: number }>>("/transactions/bulk/delete", {
      ids,
    });
    return response.data;
  },

  /**
   * POST /api/v1/transactions/bulk/update
   * Updates category and/or payment method for multiple transactions.
   */
  async bulkUpdate(
    ids: string[],
    data: { categoryId?: string; paymentMethodId?: string | null },
  ): Promise<{ count: number }> {
    const response = await api.post<ApiResponse<{ count: number }>>("/transactions/bulk/update", {
      ids,
      ...data,
    });
    return response.data;
  },

  /**
   * GET /api/v1/transactions/summary
   * Returns spending summary for a date range with optional filters.
   */
  async getSummary(
    filters: {
      startDate?: string;
      endDate?: string;
      type?: string;
      categoryId?: string;
      paymentMethodId?: string;
      minAmount?: number;
      maxAmount?: number;
      search?: string;
    } = {},
  ): Promise<TransactionSummary> {
    const params = new URLSearchParams();
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.type) params.set("type", filters.type);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.paymentMethodId) params.set("paymentMethodId", filters.paymentMethodId);
    if (filters.minAmount !== undefined) params.set("minAmount", String(filters.minAmount));
    if (filters.maxAmount !== undefined) params.set("maxAmount", String(filters.maxAmount));
    if (filters.search) params.set("search", filters.search);

    const query = params.toString();
    const endpoint = query ? `/transactions/summary?${query}` : "/transactions/summary";
    const response = await api.get<ApiResponse<{ summary: TransactionSummary }>>(endpoint);
    return response.data.summary;
  },
};
