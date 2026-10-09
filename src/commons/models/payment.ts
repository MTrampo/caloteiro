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
