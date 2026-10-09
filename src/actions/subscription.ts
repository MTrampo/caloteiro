"use server";

import { serverSupabase } from "@/commons/lib/supabase/server";
import {
  getActivePlansApi,
  cancelSubscriptionApi,
} from "@/server/account/service/subscription.api";
import {
  getSubscriptionByUserIdSupabase,
  upsertSubscriptionSupabase,
} from "@/server/account/repository/subscription.supabase";
import { createPreApprovalSubscriptionApi } from "@/server/payment/service/payment.api";
import { HttpStatusEnum } from "@/commons/enums/http";
import type { Plan } from "@/commons/models/subscription";

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Retorna os planos comerciais disponíveis
 */
export async function getActivePlansAction(): Promise<ActionResponse<Plan[]>> {
  try {
    const res = await getActivePlansApi();
    if (res.status !== HttpStatusEnum.Ok || !res.data) {
      return {
        success: false,
        error: res.message || "Erro ao carregar planos.",
      };
    }
    return {
      success: true,
      data: res.data,
    };
  } catch (err) {
    console.error("[getActivePlansAction] Erro:", err);
    return {
      success: false,
      error: "Falha na comunicação com o servidor.",
    };
  }
}

/**
 * Cria a sessão de checkout de assinatura no Mercado Pago
 */
export async function createCheckoutSubscriptionAction(
  planId: string
): Promise<ActionResponse<{ initPoint: string }>> {
  try {
    const supabase = await serverSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return {
        success: false,
        error: "Acesso negado. Usuário não autenticado.",
      };
    }

    // 1. Busca dados do plano selecionado
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*, config_plan:config_plans(*)")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return {
        success: false,
        error: "Plano selecionado inválido ou indisponível.",
      };
    }

    // 2. Busca ou inicializa registro de subscription no banco (1:1 com user_id)
    let subscription = await getSubscriptionByUserIdSupabase(user.id);

    if (!subscription) {
      const { data: created, error: createError } = await upsertSubscriptionSupabase({
        user_id: user.id,
        plan_id: plan.id,
        base_value: plan.price,
        mp_status: "pending",
      });

      if (createError || !created) {
        return {
          success: false,
          error: "Erro ao inicializar assinatura local.",
        };
      }
      subscription = created as any;
    }

    // 3. Invoca o serviço de checkout do Mercado Pago
    const mpResponse = await createPreApprovalSubscriptionApi(
      user.email,
      subscription!.id,
      Number(plan.price),
      plan.name,
      true // 7 dias grátis
    );

    if (mpResponse.status !== HttpStatusEnum.Ok || !mpResponse.data?.initPoint) {
      return {
        success: false,
        error:
          mpResponse.message ||
          "Não foi possível iniciar o checkout no Mercado Pago no momento.",
      };
    }

    return {
      success: true,
      data: {
        initPoint: mpResponse.data.initPoint,
      },
    };
  } catch (err) {
    console.error("[createCheckoutSubscriptionAction] Erro inesperado:", err);
    return {
      success: false,
      error: "Falha ao gerar checkout com o provedor de pagamento.",
    };
  }
}

/**
 * Cancela a assinatura ativa do credor
 */
export async function cancelSubscriptionAction(
  reason: string,
  reasonDetails?: string
): Promise<ActionResponse<null>> {
  try {
    const supabase = await serverSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Acesso negado. Usuário não autenticado.",
      };
    }

    const res = await cancelSubscriptionApi(user.id, reason, reasonDetails);

    if (res.status !== HttpStatusEnum.Ok) {
      return {
        success: false,
        error: res.message || "Não foi possível registrar o cancelamento.",
      };
    }

    return {
      success: true,
      data: null,
    };
  } catch (err) {
    console.error("[cancelSubscriptionAction] Erro inesperado:", err);
    return {
      success: false,
      error: "Falha ao processar o cancelamento.",
    };
  }
}

