import type { PaymentMethodType } from "@/generated/prisma/client";

export interface CreatePaymentMethodInput {
  type: PaymentMethodType;
  name: string;
  isDefault?: boolean;
  lastFour?: string | null;
}

export interface UpdatePaymentMethodInput {
  type?: PaymentMethodType;
  name?: string;
  isDefault?: boolean;
  lastFour?: string | null;
}
