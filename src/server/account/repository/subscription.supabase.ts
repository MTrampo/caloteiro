import "server-only";

import { serverSupabase } from "@/commons/lib/supabase/server";
import { internalSupabase } from "@/commons/lib/supabase/internal";
import type {
  Subscription,
  Plan,
  UserPermissions,
} from "@/commons/models/subscription";
import type { SubscriptionCancellation } from "@/commons/models/payment";

async function getClient() {
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return internalSupabase();
    }
  } catch {}
  return await serverSupabase();
}

/**
 * Busca a assinatura do usuário vinculada diretamente ao user_id (1:1)
 * trazendo também os dados do plano e suas configurações (features/limites)
 */
export const getSubscriptionByUserIdSupabase = async (
  userId: string
): Promise<Subscription | null> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plan:plans(*, config_plan:config_plans(*))")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as unknown as Subscription;
};

/**
 * Busca a assinatura pelo ID do Mercado Pago (usado no webhook)
 */
export const getSubscriptionByMpSubscriptionIdSupabase = async (
  mpSubscriptionId: string
): Promise<Subscription | null> => {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plan:plans(*, config_plan:config_plans(*))")
    .eq("mp_subscription_id", mpSubscriptionId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as unknown as Subscription;
};

/**
 * Cria ou atualiza a assinatura do usuário (upsert por user_id)
 */
export const upsertSubscriptionSupabase = async (
  payload: Partial<Subscription> & { user_id: string; base_value?: number }
) => {
  const supabase = await getClient();
  const { plan: _plan, ...cleanPayload } = payload;
  void _plan;

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        base_value: cleanPayload.base_value ?? 0,
        ...cleanPayload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  return { data, error };
};

/**
 * Atualiza campos específicos da assinatura pelo ID
 */
export const updateSubscriptionByIdSupabase = async (
  subscriptionId: string,
  payload: Partial<Subscription>
) => {
  const supabase = await getClient();
  const { plan: _plan, ...subscriptionColumns } = payload;
  void _plan;

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      ...subscriptionColumns,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId)
    .select()
    .single();

  return { data, error };
};

/**
 * Lista os planos comerciais ativos com suas configurações
 */
export const getActivePlansSupabase = async (): Promise<Plan[]> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("plans")
    .select("*, config_plan:config_plans(*)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as unknown as Plan[];
};

/**
 * Retorna as permissões e feature flags do usuário no servidor
 */
export const getUserPermissionsByUserIdSupabase = async (
  userId: string
): Promise<UserPermissions> => {
  const fallbackPermissions: UserPermissions = {
    maxDebtors: 2,
    canCustomTemplates: false,
    canExportReports: false,
    canAccessFinancial: false,
    canDebtorPortal: false,
    canRiskScore: false,
    canAttachReceipts: false,
    isFreePlan: true,
    isSubscriptionActive: false,
  };

  try {
    const subscription = await getSubscriptionByUserIdSupabase(userId);

    if (!subscription) {
      return fallbackPermissions;
    }

    const isActive =
      subscription.mp_status === "authorized" ||
      (subscription.mp_status === "cancelled" &&
        Boolean(subscription.current_period_end) &&
        new Date(subscription.current_period_end!).getTime() > Date.now());

    const isFree =
      subscription.plan?.slug === "tubarao-lixa" ||
      Number(subscription.plan?.price) === 0;

    const config = subscription.plan?.config_plan;

    return {
      maxDebtors: config?.max_debtors !== undefined ? config.max_debtors : 2,
      canCustomTemplates: config ? Boolean(config.custom_templates) : false,
      canExportReports: false,
      canAccessFinancial: isActive && (config ? Boolean(config.can_access_financial) : false),
      canDebtorPortal: isActive && (config ? Boolean(config.can_debtor_portal) : false),
      canRiskScore: isActive && (config ? Boolean(config.can_risk_score) : false),
      canAttachReceipts: isActive && (config ? Boolean(config.can_attach_receipts) : false),
      isFreePlan: isFree,
      isSubscriptionActive: isActive,
    };
  } catch (err) {
    console.error("[getUserPermissionsByUserIdSupabase] Erro ao buscar permissões:", err);
    return fallbackPermissions;
  }
};

/**
 * Registra motivo de cancelamento em subscription_cancellations
 */
export const insertCancellationReasonSupabase = async (
  payload: Omit<SubscriptionCancellation, "id" | "created_at">
) => {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("subscription_cancellations")
    .insert(payload)
    .select("id")
    .single();

  return { data, error };
};

/**
 * Busca um plano específico pelo ID
 */
export const getPlanByIdSupabase = async (planId: string): Promise<Plan | null> => {
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("plans")
    .select("*, config_plan:config_plans(*)")
    .eq("id", planId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as unknown as Plan;
};

/**
 * Busca um plano comercial pelo nome (usado para mapear retorno do Mercado Pago)
 */
export const getPlanByNameSupabase = async (planName: string): Promise<Plan | null> => {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*, config_plan:config_plans(*)")
    .ilike("name", planName.trim())
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as unknown as Plan;
};

/**
 * Verifica se o usuário já possui histórico de assinatura ou plano ativo (para elegibilidade de trial)
 * Regra: se o usuário já possui ou teve qualquer plano (inclusive o gratuito), NÃO é elegível a trial.
 */
export const hasActiveSubscriptionHistorySupabase = async (userId: string): Promise<boolean> => {
  const supabase = await getClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id, plan_id, mp_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (sub) {
    return true;
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "approved")
    .limit(1);

  return Boolean(invoices && invoices.length > 0);
};

/**
 * Busca histórico de faturas e pagamentos da assinatura do usuário
 */
export const getInvoicesByUserIdSupabase = async (userId: string) => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[getInvoicesByUserIdSupabase] Erro ao buscar faturas:", error);
    return [];
  }

  return data;
};