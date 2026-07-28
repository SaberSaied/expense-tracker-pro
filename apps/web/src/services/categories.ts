/**
 * Categories API service.
 * All CRUD operations for managing user transaction categories.
 */
import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────

/** Category as returned from the API (Prisma model fields + computed stats). */
export interface ApiCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  /** Number of transactions assigned to this category. */
  transactionCount?: number;
  /** Total amount spent across all transactions in this category. */
  totalSpent?: number;
}

export interface CreateCategoryInput {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
}

// ─── API Response Wrappers ────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── API Functions ────────────────────────────────────────────

export const categoriesApi = {
  /**
   * GET /api/v1/categories
   * Returns all categories for the authenticated user.
   * Supports optional search query for case-insensitive partial name matching.
   */
  async findAll(query?: string): Promise<ApiCategory[]> {
    const endpoint = query ? `/categories?q=${encodeURIComponent(query)}` : "/categories";
    const response = await api.get<ApiResponse<{ categories: ApiCategory[] }>>(endpoint);
    return response.data.categories;
  },

  /**
   * GET /api/v1/categories/:id
   * Returns a single category by ID.
   */
  async findById(id: string): Promise<ApiCategory> {
    const response = await api.get<ApiResponse<{ category: ApiCategory }>>(`/categories/${id}`);
    return response.data.category;
  },

  /**
   * POST /api/v1/categories
   * Creates a new custom category.
   */
  async create(input: CreateCategoryInput): Promise<ApiCategory> {
    const response = await api.post<ApiResponse<{ category: ApiCategory }>>("/categories", input);
    return response.data.category;
  },

  /**
   * PATCH /api/v1/categories/:id
   * Updates an existing category.
   */
  async update(id: string, input: UpdateCategoryInput): Promise<ApiCategory> {
    const response = await api.patch<ApiResponse<{ category: ApiCategory }>>(
      `/categories/${id}`,
      input
    );
    return response.data.category;
  },

  /**
   * DELETE /api/v1/categories/:id
   * Deletes a custom category (system categories cannot be deleted).
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
