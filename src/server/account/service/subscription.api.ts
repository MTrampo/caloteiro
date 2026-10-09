import {
  getActivePlansSupabase,
  getSubscriptionByUserIdSupabase,
  getUserPermissionsByUserIdSupabase,
  insertCancellationReasonSupabase,
  updateSubscriptionByIdSupabase,
} from "../repository/subscription.supabase";
import { ApiResponse } from "@/commons/lib/http/responses";
import type { UserPermissions } from "@/commons/models/subscription";

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
  userId: string,
  reason: string,
  reasonDetails?: string
) => {
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