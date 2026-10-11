"use server";

import {
  getActivePlansApi,
  cancelSubscriptionApi,
  createCheckoutSessionApi,
} from "@/server/account/service/subscription.api";
import { getUserLoggedApi } from "@/server/account/service/auth.api";
import { HttpStatusEnum } from "@/commons/enums/http";
import type {
  Plan,
  CheckoutSessionResult,
} from "@/commons/models/subscription";

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
): Promise<ActionResponse<CheckoutSessionResult>> {
  try {
    const userResponse = await getUserLoggedApi();
    if (
      userResponse.status !== HttpStatusEnum.Ok ||
      !userResponse.data?.user ||
      !userResponse.data.user.email
    ) {
      return {
        success: false,
        error: "Acesso negado. Usuário não autenticado.",
      };
    }

    const user = userResponse.data.user;
    if (!user.email) {
      return {
        success: false,
        error: "Acesso negado. Usuário sem e-mail cadastrado.",
      };
    }

    // 1. Delega a execução da criação da sessão para a camada de Service usando DTO tipado
    const sessionResponse = await createCheckoutSessionApi({
      userId: user.id,
      userEmail: user.email,
      planId,
    });

    if (sessionResponse.status !== HttpStatusEnum.Ok || !sessionResponse.data) {
      return {
        success: false,
        error:
          sessionResponse.message ||
          "Não foi possível processar a assinatura no momento.",
      };
    }

    return {
      success: true,
      data: sessionResponse.data,
    };
  } catch (err) {
    console.error("[createCheckoutSubscriptionAction] Erro inesperado:", err);
    return {
      success: false,
      error: "Falha ao processar assinatura.",
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
    const userResponse = await getUserLoggedApi();
    if (userResponse.status !== HttpStatusEnum.Ok || !userResponse.data?.user) {
      return {
        success: false,
        error: "Acesso negado. Usuário não autenticado.",
      };
    }

    const user = userResponse.data.user;
    const res = await cancelSubscriptionApi({
      userId: user.id,
      reason,
      reasonDetails,
    });

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
