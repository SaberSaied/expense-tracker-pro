/**
 * Payment Methods API service.
 */
import { api } from "./api";

export interface PaymentMethodStats {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  netAmount: number;
  firstUsed: string | null;
  lastUsed: string | null;
}

export interface ApiPaymentMethod {
  id: string;
  type: "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "BANK_TRANSFER" | "DIGITAL_WALLET";
  name: string;
  icon: string;
  color: string;
  lastFour: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { transactions: number };
  stats?: PaymentMethodStats;
}

export interface CreatePaymentMethodInput {
  type: ApiPaymentMethod["type"];
  name: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  lastFour?: string | null;
}

export interface UpdatePaymentMethodInput {
  type?: ApiPaymentMethod["type"];
  name?: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  lastFour?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const paymentMethodsApi = {
  /**
   * GET /api/v1/payment-methods
   * Returns all payment methods for the authenticated user.
   */
  async findAll(): Promise<ApiPaymentMethod[]> {
    const response = await api.get<ApiResponse<{ paymentMethods: ApiPaymentMethod[] }>>("/payment-methods");
    return response.data.paymentMethods;
  },

  /**
   * GET /api/v1/payment-methods/:id
   * Returns a single payment method by ID.
   */
  async findById(id: string): Promise<ApiPaymentMethod> {
    const response = await api.get<ApiResponse<{ paymentMethod: ApiPaymentMethod }>>(`/payment-methods/${id}`);
    return response.data.paymentMethod;
  },

  /**
   * POST /api/v1/payment-methods
   * Creates a new payment method.
   */
  async create(input: CreatePaymentMethodInput): Promise<ApiPaymentMethod> {
    const response = await api.post<ApiResponse<{ paymentMethod: ApiPaymentMethod }>>("/payment-methods", input);
    return response.data.paymentMethod;
  },

  /**
   * PATCH /api/v1/payment-methods/:id
   * Updates an existing payment method.
   */
  async update(id: string, input: UpdatePaymentMethodInput): Promise<ApiPaymentMethod> {
    const response = await api.patch<ApiResponse<{ paymentMethod: ApiPaymentMethod }>>(`/payment-methods/${id}`, input);
    return response.data.paymentMethod;
  },

  /**
   * DELETE /api/v1/payment-methods/:id
   * Deletes a payment method.
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/payment-methods/${id}`);
  },
};
