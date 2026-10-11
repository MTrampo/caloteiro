import "server-only";

import {
  getActivePlansSupabase,
  getSubscriptionByUserIdSupabase,
  getUserPermissionsByUserIdSupabase,
  insertCancellationReasonSupabase,
  updateSubscriptionByIdSupabase,
  upsertSubscriptionSupabase,
  getPlanByIdSupabase,
  hasActiveSubscriptionHistorySupabase,
} from "../repository/subscription.supabase";
import { createPreApprovalSubscriptionApi } from "@/server/payment/service/payment.api";
import { ApiResponse } from "@/commons/lib/http/responses";
import { setCookieSubscription } from "@/commons/lib/auth/subscription";
import type { ResponseProps } from "@/commons/models/api";
import type {
  UserPermissions,
  CreateCheckoutSessionPayload,
  CheckoutSessionResult,
  CancelSubscriptionPayload,
} from "@/commons/models/subscription";

/**
 * Retorna as permissões e limites ativos do credor no servidor
 */
export const getUserPermissionsApi = async (
  userId: string
): Promise<UserPermissions> => {
  return await getUserPermissionsByUserIdSupabase(userId);
};

/**
 * Retorna catálogo de planos ativos
 */
export const getActivePlansApi = async () => {
  const plans = await getActivePlansSupabase();
  return ApiResponse.Ok({
    message: "Planos obtidos com sucesso.",
    data: plans,
  });
};

/**
 * Registra o cancelamento de assinatura do credor
 */
export const cancelSubscriptionApi = async (
  payload: CancelSubscriptionPayload
) => {
  const { userId, reason, reasonDetails } = payload;
  const subscription = await getSubscriptionByUserIdSupabase(userId);

  if (!subscription) {
    return ApiResponse.NotFound({
      message: "Nenhuma assinatura ativa encontrada para este usuário.",
    });
  }

  // 1. Grava o feedback do cancelamento
  await insertCancellationReasonSupabase({
    user_id: userId,
    subscription_id: subscription.id,
    mp_subscription_id: subscription.mp_subscription_id,
    reason,
    reason_details: reasonDetails || null,
  });

  // 2. Atualiza o status local para cancelled (o webhook do MP também confirmará)
  await updateSubscriptionByIdSupabase(subscription.id, {
    mp_status: "cancelled",
  });

  return ApiResponse.Ok({
    message: "Cancelamento registrado. Acesso mantido até o final do período vigente.",
    data: null,
  });
};

/**
 * Cria a sessão de checkout de assinatura no Mercado Pago
 */
export const createCheckoutSessionApi = async (
  payload: CreateCheckoutSessionPayload
): Promise<ResponseProps<CheckoutSessionResult>> => {
  const { userId, userEmail, planId } = payload;

  // 1. Busca dados do plano selecionado
  const plan = await getPlanByIdSupabase(planId);
  if (!plan) {
    return ApiResponse.NotFound({
      message: "Plano selecionado inválido ou indisponível.",
    });
  }

  if (Number(plan.price) === 0 || plan.slug === "tubarao-lixa") {
    console.info(
      `🦈 [SUBSCRIPTION] Ativação direta de plano gratuito | userId: ${userId} | plan: ${plan.name}`
    );

    const existingSub = await getSubscriptionByUserIdSupabase(userId);
    let activeSubId: string;
    if (!existingSub) {
      const { data: created, error: createError } = await upsertSubscriptionSupabase({
        user_id: userId,
        plan_id: plan.id,
        base_value: 0,
        mp_status: "authorized",
        mp_payer_email: userEmail,
      });

      if (createError || !created) {
        return ApiResponse.InternalError({
          message: "Erro ao ativar plano gratuito no sistema.",
          error: createError?.message,
        });
      }
      activeSubId = created.id;
    } else {
      await updateSubscriptionByIdSupabase(existingSub.id, {
        plan_id: plan.id,
        base_value: 0,
        mp_status: "authorized",
        mp_payer_email: userEmail,
      });
      activeSubId = existingSub.id;
    }

    // Grava o cookie seguro de assinatura para liberação imediata no proxy.ts
    await setCookieSubscription({
      subscriptionId: activeSubId,
      status: "authorized",
      currentPeriodEnd: null,
      userId: userId,
      planSlug: plan.slug,
    });

    return ApiResponse.Ok({
      message: "Plano gratuito ativado com sucesso!",
      data: {
        initPoint: null,
        isFree: true,
      },
    });
  }

  // 2. Busca ou inicializa registro de subscription no banco (1:1 com user_id)
  let subscription = await getSubscriptionByUserIdSupabase(userId);

  if (!subscription) {
    const { data: created, error: createError } = await upsertSubscriptionSupabase({
      user_id: userId,
      plan_id: plan.id,
      base_value: plan.price,
      mp_status: "pending",
      mp_payer_email: userEmail,
    });

    if (createError || !created) {
      return ApiResponse.InternalError({
        message: "Erro ao inicializar assinatura local.",
        error: createError?.message,
      });
    }
    subscription = created as unknown as typeof subscription;
  } else {
    // Se a assinatura já existia, atualiza plano e valor base
    await updateSubscriptionByIdSupabase(subscription.id, {
      plan_id: plan.id,
      base_value: plan.price,
      mp_payer_email: userEmail,
    });
  }

  if (!subscription) {
    return ApiResponse.InternalError({
      message: "Falha ao obter assinatura local para o checkout.",
    });
  }

  // 3. Em ambiente de desenvolvimento Sandbox, usamos o e-mail do comprador de testes
  const isDev = process.env.NODE_ENV === "development" || process.env.ENVIRONMENT === "development";
  const targetPayerEmail =
    isDev && process.env.MP_EMAIL_COMPRADOR_TEST
      ? process.env.MP_EMAIL_COMPRADOR_TEST
      : userEmail;

  // 4. Verificar elegibilidade ao período de degustação (trial de 30 dias)
  const hasHistory = await hasActiveSubscriptionHistorySupabase(userId);
  const includeTrial = !hasHistory;

  console.info(
    `💳 [CHECKOUT] Iniciando checkout de assinatura | userId: ${userId} | payerEmail: ${targetPayerEmail} (isDev: ${isDev}) | trial30Dias: ${includeTrial}`
  );

  // 5. Invoca o serviço de preapproval do Mercado Pago enviando external_reference = subscription.id
  const mpResponse = await createPreApprovalSubscriptionApi({
    payerEmail: targetPayerEmail,
    subscriptionId: subscription.id,
    planPrice: Number(plan.price),
    planName: plan.name,
    includeTrial,
  });

  if (mpResponse.status !== 200 || !mpResponse.data?.initPoint) {
    return ApiResponse.InternalError({
      message: mpResponse.message || "Erro ao gerar sessão de checkout no Mercado Pago",
      error: mpResponse.error,
    });
  }

  // 6. Persistir o ID da assinatura do Mercado Pago localmente para sincronização
  if (mpResponse.data.preapprovalId) {
    await updateSubscriptionByIdSupabase(subscription.id, {
      mp_subscription_id: mpResponse.data.preapprovalId,
    });
  }

  return ApiResponse.Ok({
    message: "Checkout session criada com sucesso",
    data: {
      initPoint: mpResponse.data.initPoint,
      isFree: false,
    },
  });
};