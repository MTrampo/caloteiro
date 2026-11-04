'use server';

import { getUserLoggedApi } from "@/server/account/service/auth.api";
import { getUserPermissionsOrCacheApi } from "@/server/account/service/subscription.api";
import { getFinancialAnalyticsApi } from "@/server/debts/service/financial.api";
import { getFinancialAnalyticsSchema } from "@/commons/validations/financial";
import type { FinancialAnalyticsResult, FinancialPeriod } from "@/commons/models/financial";

export type GetFinancialAnalyticsActionResponse =
  | { success: true; data: FinancialAnalyticsResult }
  | { success: false; error: string };

/**
 * Server Action para carregar dados de inteligência financeira por período
 */
export async function getFinancialAnalyticsAction(
  payload?: { period?: FinancialPeriod }
): Promise<GetFinancialAnalyticsActionResponse> {
  const userRes = await getUserLoggedApi();
  const userId = userRes.data?.user?.id;

  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado. Faça login novamente.",
    };
  }

  // Validação de permissões do plano
  const permissions = await getUserPermissionsOrCacheApi(userId);
  if (!permissions.canAccessFinancial) {
    return {
      success: false,
      error: "O Painel Financeiro é exclusivo dos planos Tubarão Branco e Tubarão Cabeça Chato.",
    };
  }

  // Validação de entrada com Zod
  const validation = getFinancialAnalyticsSchema.safeParse(payload || {});
  if (!validation.success) {
    return {
      success: false,
      error: "Parâmetros de período inválidos.",
    };
  }

  try {
    const data = await getFinancialAnalyticsApi(userId, validation.data.period);
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("[getFinancialAnalyticsAction] Erro ao processar inteligência financeira:", err);
    return {
      success: false,
      error: "Não foi possível carregar a inteligência financeira no momento.",
    };
  }
}

