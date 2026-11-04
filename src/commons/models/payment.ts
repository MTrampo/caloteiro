import type { Json } from "@/commons/types/database.types";

export interface Invoice {
  id: string;
  user_id: string;
  subscription_id?: string | null;
  mp_invoice_id: string;
  mp_subscription_id?: string | null;
  amount: number;
  currency?: string | null;
  status: string; // 'approved', 'rejected', etc.
  paid_at?: string | null;
  raw_payload?: Json | null;
  created_at?: string | null;
}

export interface SubscriptionCancellation {
  id: string;
  user_id: string;
  subscription_id?: string | null;
  mp_subscription_id?: string | null;
  reason: string;
  reason_details?: string | null;
  created_at?: string | null;
}

export type InvoiceInsertPayload = Omit<Invoice, "id" | "created_at">;
export type InvoiceUpdatePayload = Partial<Omit<Invoice, "id" | "created_at">>;

/**
 * Configuração de degustação/trial na recorrência do Mercado Pago
 */
export interface MercadopagoAutoRecurringFreeTrial {
  frequency: number;
  frequency_type: "days" | "months";
}

/**
 * Objeto de configuração da recorrência mensal/periódica do Mercado Pago
 */
export interface MercadopagoAutoRecurring {
  frequency: number;
  frequency_type: "days" | "months";
  transaction_amount: number;
  currency_id: "BRL";
  free_trial?: MercadopagoAutoRecurringFreeTrial;
}

/**
 * Payload estruturado para criação de preapproval no Mercado Pago
 */
export interface CreatePreApprovalPayload {
  payerEmail: string;
  subscriptionId: string;
  planPrice: number;
  planName: string;
  includeTrial?: boolean;
}

/**
 * Retorno estruturado do checkout do Mercado Pago
 */
export interface PreApprovalCheckoutResult {
  initPoint: string | null;
  preapprovalId: string;
}
