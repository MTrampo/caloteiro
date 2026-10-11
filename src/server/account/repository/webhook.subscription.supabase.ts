import "server-only";

import { internalSupabase } from "@/commons/lib/supabase/internal";
import type { InvoiceInsertPayload } from "@/commons/models/payment";
import type { Subscription } from "@/commons/models/subscription";

export const webhookGetSubscriptionByIdSupabase = async (id: string) => {
  const supabase = internalSupabase();
  const { data } = await supabase
    .from("subscriptions")
    .select()
    .eq("id", id)
    .single();

  return data;
};

export const webhookGetSubscriptionByPayerEmailSupabase = async (payerEmail: string) => {
  const supabase = internalSupabase();
  const { data } = await supabase
    .from("subscriptions")
    .select()
    .eq("mp_payer_email", payerEmail)
    .single();

  return data;
};

export const webhookGetSubscriptionByPayerIdSupabase = async (payerId: number) => {
  const supabase = internalSupabase();
  const { data } = await supabase
    .from("subscriptions")
    .select()
    .eq("mp_payer_id", payerId)
    .single();

  return data;
};

export const webhookSyncSubscriptionSupabase = async (
  payload: Partial<Subscription>,
  id: string
) => {
  const supabase = internalSupabase();
  const { plan: _ignoredPlan, ...subscriptionColumns } = payload;
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      ...subscriptionColumns,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    console.error("[WEBHOOK:syncSubscription] Erro:", error);
  }
  return data;
};

export const webhookGetSubscriptionByMpSubscriptionIdSupabase = async (
  mpSubscriptionId: string
) => {
  const supabase = internalSupabase();
  const { data } = await supabase
    .from("subscriptions")
    .select()
    .eq("mp_subscription_id", mpSubscriptionId)
    .single();

  return data;
};

export const webhookUpsertInvoiceSupabase = async (payload: InvoiceInsertPayload) => {
  const supabase = internalSupabase();
  const { data, error } = await supabase
    .from("invoices")
    .upsert(payload, { onConflict: "mp_invoice_id" })
    .select("id")
    .single();

  return { data, error };
};
