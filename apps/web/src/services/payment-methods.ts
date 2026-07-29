/**
 * Payment Methods API service.
 */
import { api } from "./api";

export interface ApiPaymentMethod {
  id: string;
  type: "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "BANK_TRANSFER" | "DIGITAL_WALLET" | "OTHER";
  name: string;
  lastFour: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
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
};
