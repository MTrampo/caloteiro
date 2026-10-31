import "server-only";

import { internalSupabase } from "@/commons/lib/supabase/internal";
import type { InvoiceInsertPayload } from "@/commons/models/payment";
import type { Subscription } from "@/commons/models/subscription";

export const webhookGetSubscriptionByIdSupabase = async (
  id: string
): Promise<Subscription | null> => {
  const supabase = internalSupabase();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "*, plan:plans!subscriptions_plan_id_fkey(*, config_plan:config_plans(*)), scheduled_plan:plans!subscriptions_scheduled_plan_id_fkey(*, config_plan:config_plans(*))"
    )
    .eq("id", id)
    .maybeSingle();

  return (data as unknown as Subscription) || null;
};

export const webhookGetSubscriptionByPayerEmailSupabase = async (
  payerEmail: string
): Promise<Subscription | null> => {
  const supabase = internalSupabase();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "*, plan:plans!subscriptions_plan_id_fkey(*, config_plan:config_plans(*)), scheduled_plan:plans!subscriptions_scheduled_plan_id_fkey(*, config_plan:config_plans(*))"
    )
    .eq("mp_payer_email", payerEmail)
    .maybeSingle();

  return (data as unknown as Subscription) || null;
};

export const webhookGetSubscriptionByPayerIdSupabase = async (
  payerId: number
): Promise<Subscription | null> => {
  const supabase = internalSupabase();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "*, plan:plans!subscriptions_plan_id_fkey(*, config_plan:config_plans(*)), scheduled_plan:plans!subscriptions_scheduled_plan_id_fkey(*, config_plan:config_plans(*))"
    )
    .eq("mp_payer_id", payerId)
    .maybeSingle();

  return (data as unknown as Subscription) || null;
};

export const webhookSyncSubscriptionSupabase = async (
  payload: Partial<Subscription>,
  id: string
) => {
  const supabase = internalSupabase();
  const { plan: _ignoredPlan, scheduled_plan: _ignoredScheduledPlan, ...subscriptionColumns } = payload;
  void _ignoredScheduledPlan;
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
): Promise<Subscription | null> => {
  const supabase = internalSupabase();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "*, plan:plans!subscriptions_plan_id_fkey(*, config_plan:config_plans(*)), scheduled_plan:plans!subscriptions_scheduled_plan_id_fkey(*, config_plan:config_plans(*))"
    )
    .eq("mp_subscription_id", mpSubscriptionId)
    .maybeSingle();

  return (data as unknown as Subscription) || null;
};

export const webhookUpsertInvoiceSupabase = async (payload: InvoiceInsertPayload) => {
  const supabase = internalSupabase();

  if (payload.mp_invoice_id) {
    const { data: existing } = await supabase
      .from("invoices")
      .select("id, status")
      .eq("mp_invoice_id", payload.mp_invoice_id)
      .maybeSingle();

    if (existing?.id) {
      const { data, error } = await supabase
        .from("invoices")
        .update(payload)
        .eq("id", existing.id)
        .select("id")
        .single();

      return { data, error, previousStatus: existing.status as string | null };
    }
  }

  const { data, error } = await supabase
    .from("invoices")
    .insert(payload)
    .select("id")
    .single();

  return { data, error, previousStatus: null };
};
