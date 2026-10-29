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
import {
  createPreApprovalSubscriptionApi,
  updatePreApprovalPlanOrPriceApi,
  cancelPreApprovalApi,
} from "@/server/payment/service/payment.api";
import { ApiResponse } from "@/commons/lib/http/responses";
import {
  setCookieSubscription,
  getCookieSubscriptionPayload,
} from "@/commons/lib/auth/subscription";
import { sendPlanChangeEmailApi } from "@/server/email/service/email.api";
import {
  FREE_PLAN_SLUG,
  DEFAULT_FREE_PLAN_NAME,
  FREE_PLAN_PRICE,
  FREE_PLAN_DEFAULT_MAX_DEBTORS,
  FREE_PLAN_RESET_PAYLOAD,
} from "@/commons/constants/subscription";
import type { ResponseProps } from "@/commons/models/api";
import type {
  UserPermissions,
  UserPlanLimits,
  CreateCheckoutSessionPayload,
  CheckoutSessionResult,
  CancelSubscriptionPayload,
  ChangeSubscriptionPlanPayload,
  PlanChangeResult,
} from "@/commons/models/subscription";
import { countDebtorsByUserIdSupabase } from "@/server/debtors/repository/debtor.supabase";
import { countActiveDebtsByUserIdSupabase } from "@/server/debts/repository/debt.supabase";
import { updateProfileAvatarSupabase } from "../repository/auth.supabase";

/**
 * Retorna as permissões e limites ativos do credor no servidor
 */
export const getUserPermissionsApi = async (
  userId: string
): Promise<UserPermissions> => {
  return await getUserPermissionsByUserIdSupabase(userId);
};

/**
 * Obtém permissões do cache seguro criptografado (HMAC-SHA256) ou do banco com regeneração de cookie
 */
export const getUserPermissionsOrCacheApi = async (
  userId: string
): Promise<UserPermissions> => {
  const cookiePayload = await getCookieSubscriptionPayload(userId);
  if (cookiePayload?.permissions) {
    return cookiePayload.permissions;
  }

  const permissions = await getUserPermissionsByUserIdSupabase(userId);
  const sub = await getSubscriptionByUserIdSupabase(userId);
  if (sub) {
    await setCookieSubscription(
      {
        subscriptionId: sub.id,
        status: sub.mp_status,
        currentPeriodEnd: sub.current_period_end,
        userId,
        planSlug: sub.plan?.slug || "tubarao-lixa",
        planName: sub.plan?.name || "Tubarão Lixa",
        permissions,
      },
      userId
    );
  }
  return permissions;
};

/**
 * Retorna os limites e status de trava de plano do usuário (devedores e dívidas)
 */
export const getPlanLimitsApi = async (
  userId: string
): Promise<UserPlanLimits> => {
  const [permissions, currentDebtorsCount, currentActiveDebtsCount, sub] =
    await Promise.all([
      getUserPermissionsOrCacheApi(userId),
      countDebtorsByUserIdSupabase(userId),
      countActiveDebtsByUserIdSupabase(userId),
      getSubscriptionByUserIdSupabase(userId),
    ]);

  const max = permissions.maxDebtors;
  const isDebtorLimitReached = max !== null && currentDebtorsCount >= max;
  const isDebtLimitReached = max !== null && currentActiveDebtsCount >= max;

  return {
    maxDebtors: max,
    currentDebtorsCount,
    currentActiveDebtsCount,
    canCreateDebtor: !isDebtorLimitReached,
    canCreateDebt: !isDebtLimitReached,
    isDebtorLimitReached,
    isDebtLimitReached,
    planSlug: sub?.plan?.slug || "tubarao-lixa",
    planName: sub?.plan?.name || "Tubarão Lixa",
    isFreePlan: permissions.isFreePlan,
  };
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

  // 2. Cancela a recorrência no Mercado Pago se houver assinatura ativa
  if (subscription.mp_subscription_id) {
    await cancelPreApprovalApi(subscription.mp_subscription_id);
  }

  // 3. Atualiza o status local para cancelled (mantém o current_period_end vigente até a data de expiração)
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

  if (Number(plan.price) === FREE_PLAN_PRICE || plan.slug === FREE_PLAN_SLUG) {
    console.info(
      `🦈 [SUBSCRIPTION] Ativação direta de plano gratuito | userId: ${userId} | plan: ${plan.name}`
    );

    const existingSub = await getSubscriptionByUserIdSupabase(userId);
    let activeSubId: string;
    if (!existingSub) {
      const { data: created, error: createError } = await upsertSubscriptionSupabase({
        user_id: userId,
        plan_id: plan.id,
        mp_payer_email: userEmail,
        ...FREE_PLAN_RESET_PAYLOAD,
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
        mp_payer_email: userEmail,
        ...FREE_PLAN_RESET_PAYLOAD,
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
    // BLINDAGEM: Se a assinatura já existia (ex: plano gratuito Tubarão Lixa),
    // NUNCA atualizamos o plan_id prematuramente para o plano pago aqui!
    // Caso contrário, como o status é 'authorized', o usuário ganharia o plano pago sem pagar!
    // A promoção para o novo plano só ocorre quando o Mercado Pago confirmar o status 'authorized'.
    await updateSubscriptionByIdSupabase(subscription.id, {
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
  // REGRA: Usuários que já têm plano gratuito (ou histórico de assinatura) NÃO recebem 30 dias de trial.
  // Apenas novos cadastros que nunca tiveram plano algum poderiam ser elegíveis.
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

/**
 * Executa a mudança de plano (Upgrade ou Downgrade) com sincronização no Mercado Pago
 * e envio de e-mail informativo (regra: cobrança do novo valor somente na próxima fatura).
 */
export const changeSubscriptionPlanApi = async (
  payload: ChangeSubscriptionPlanPayload
): Promise<ResponseProps<PlanChangeResult>> => {
  const { userId, userEmail, targetPlanId } = payload;

  const targetPlan = await getPlanByIdSupabase(targetPlanId);
  if (!targetPlan) {
    return ApiResponse.NotFound({
      message: "Plano selecionado inválido ou indisponível.",
    });
  }

  const currentSub = await getSubscriptionByUserIdSupabase(userId);
  const currentPlan = currentSub?.plan;
  const currentPrice = Number(currentSub?.base_value ?? currentPlan?.price ?? 0);
  const newPrice = Number(targetPlan.price ?? 0);
  const isUpgrade = newPrice > currentPrice;
  const isFreePlan = targetPlan.slug === FREE_PLAN_SLUG || newPrice === FREE_PLAN_PRICE;

  console.info(
    `🦈 [SUBSCRIPTION:changePlan] ${isUpgrade ? "UPGRADE" : "DOWNGRADE"} | userId: ${userId} | de: ${
      currentPlan?.name || "Sem plano"
    } (${currentPrice}) -> para: ${targetPlan.name} (${newPrice})`
  );

  // Cenário 1: Mudança para plano gratuito (Downgrade para Tubarão Lixa)
  if (isFreePlan) {
    if (currentSub?.mp_subscription_id) {
      await cancelPreApprovalApi(currentSub.mp_subscription_id);
    }

    if (currentSub) {
      await updateSubscriptionByIdSupabase(currentSub.id, {
        plan_id: targetPlan.id,
        ...FREE_PLAN_RESET_PAYLOAD,
      });
    } else {
      await upsertSubscriptionSupabase({
        user_id: userId,
        plan_id: targetPlan.id,
        mp_payer_email: userEmail,
        ...FREE_PLAN_RESET_PAYLOAD,
      });
    }

    await updateProfileAvatarSupabase(userId, targetPlan.slug);

    const newPermissions = await getUserPermissionsByUserIdSupabase(userId);
    await setCookieSubscription(
      {
        subscriptionId: currentSub?.id,
        status: "authorized",
        currentPeriodEnd: null,
        userId,
        planSlug: targetPlan.slug,
        planName: targetPlan.name,
        permissions: newPermissions,
      },
      userId
    );

    // Dispara e-mail de alteração para plano gratuito
    await sendPlanChangeEmailApi(userEmail, {
      previousPlanName: currentPlan?.name || DEFAULT_FREE_PLAN_NAME,
      newPlanName: targetPlan.name,
      isUpgrade: false,
      newPrice: FREE_PLAN_PRICE,
      maxDebtors: targetPlan.config_plan?.max_debtors ?? FREE_PLAN_DEFAULT_MAX_DEBTORS,
    });

    return ApiResponse.Ok({
      message: `Plano alterado para ${DEFAULT_FREE_PLAN_NAME} com sucesso!`,
      data: {
        isUpgrade: false,
        previousPlanName: currentPlan?.name || DEFAULT_FREE_PLAN_NAME,
        newPlanName: targetPlan.name,
        newPrice: FREE_PLAN_PRICE,
        effectiveNextBilling: false,
        isFreePlan: true,
        initPoint: null,
      },
    });
  }

  // Cenário 2: Mudança para plano pago
  // 2.A: Migração em segundo plano: SOMENTE se o usuário já possuir assinatura PAGA e AUTORIZADA no Mercado Pago
  const isCurrentPaidAndAuthorized =
    Boolean(currentSub?.mp_subscription_id) &&
    currentSub?.mp_status === "authorized" &&
    currentPrice > FREE_PLAN_PRICE &&
    currentPlan?.slug !== FREE_PLAN_SLUG;

  if (isCurrentPaidAndAuthorized && currentSub?.mp_subscription_id) {
    const mpUpdateRes = await updatePreApprovalPlanOrPriceApi(
      currentSub.mp_subscription_id,
      newPrice,
      targetPlan.name
    );

    if (mpUpdateRes.status !== 200) {
      return ApiResponse.InternalError({
        message: "Não foi possível atualizar o plano no Mercado Pago.",
        error: mpUpdateRes.error,
      });
    }

    await updateSubscriptionByIdSupabase(currentSub.id, {
      plan_id: targetPlan.id,
      base_value: newPrice,
    });

    await updateProfileAvatarSupabase(userId, targetPlan.slug);

    const newPermissions = await getUserPermissionsByUserIdSupabase(userId);
    await setCookieSubscription(
      {
        subscriptionId: currentSub.id,
        status: currentSub.mp_status,
        currentPeriodEnd: currentSub.current_period_end,
        userId,
        planSlug: targetPlan.slug,
        planName: targetPlan.name,
        permissions: newPermissions,
      },
      userId
    );

    // Dispara e-mail de alteração com aviso de cobrança na próxima fatura
    await sendPlanChangeEmailApi(userEmail, {
      previousPlanName: currentPlan?.name || DEFAULT_FREE_PLAN_NAME,
      newPlanName: targetPlan.name,
      isUpgrade,
      newPrice,
      maxDebtors: targetPlan.config_plan?.max_debtors,
    });

    return ApiResponse.Ok({
      message: isUpgrade
        ? `Parabéns, Tubarão! Você subiu para o plano ${targetPlan.name}!`
        : `Plano alterado para ${targetPlan.name}.`,
      data: {
        isUpgrade,
        previousPlanName: currentPlan?.name || DEFAULT_FREE_PLAN_NAME,
        newPlanName: targetPlan.name,
        newPrice,
        effectiveNextBilling: true,
        isFreePlan: false,
        initPoint: null,
      },
    });
  }

  // 2.B: Não possuía assinatura ativa e paga no MP (vindo do plano gratuito, cancelado ou pendente) -> OBRIGATÓRIO gerar novo checkout
  const checkoutRes = await createCheckoutSessionApi({
    userId,
    userEmail,
    planId: targetPlan.id,
  });

  if (checkoutRes.status !== 200 || !checkoutRes.data?.initPoint) {
    return ApiResponse.InternalError({
      message: "Falha ao iniciar checkout no Mercado Pago.",
      error: checkoutRes.error,
    });
  }

  return ApiResponse.Ok({
    message: "Redirecionando para autorização no Mercado Pago...",
    data: {
      isUpgrade: true,
      previousPlanName: currentPlan?.name || DEFAULT_FREE_PLAN_NAME,
      newPlanName: targetPlan.name,
      newPrice,
      effectiveNextBilling: false,
      isFreePlan: false,
      initPoint: checkoutRes.data.initPoint,
    },
  });
};