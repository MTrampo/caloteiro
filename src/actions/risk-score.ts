"use server";

import { getUserLoggedApi } from "@/server/account/service/auth.api";
import { getDebtorRiskScoreSchema } from "@/commons/validations/risk-score";
import {
  getDebtorRaioXApi,
  getGrottoThermometerDataApi,
} from "@/server/debtors/service/risk-score.api";
import type {
  DebtorRaioXData,
  GrottoThermometerData,
} from "@/commons/models/risk-score";

/**
 * Busca os dados completos do Raio-X da Presa e Velocímetro de Score
 */
export async function getDebtorRaioXAction(rawParams: unknown): Promise<{
  success: boolean;
  data?: DebtorRaioXData;
  error?: string;
  isUpgradeRequired?: boolean;
}> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return {
        success: false,
        error: "Acesso não autorizado. Faça login novamente.",
      };
    }

    const validation = getDebtorRiskScoreSchema.safeParse(rawParams);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "ID da presa inválido.",
      };
    }

    const res = await getDebtorRaioXApi(validation.data.debtorId, userId);

    if (res.error === "PLAN_UPGRADE_REQUIRED") {
      return {
        success: false,
        isUpgradeRequired: true,
        error:
          res.message ||
          "Recurso exclusivo do plano Tubarão Cabeça Chata.",
      };
    }

    if (res.error || !res.data) {
      return {
        success: false,
        error: res.message || "Não foi possível carregar o Raio-X da presa.",
      };
    }

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("[getDebtorRaioXAction] Erro inesperado:", error);
    return {
      success: false,
      error: "Erro inesperado ao calcular o Score de Risco da presa.",
    };
  }
}

/**
 * Busca os dados consolidados do Termômetro da Gruta (Score geral de todos os devedores)
 */
export async function getGrottoThermometerAction(): Promise<{
  success: boolean;
  data?: GrottoThermometerData;
  error?: string;
  isUpgradeRequired?: boolean;
}> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return {
        success: false,
        error: "Acesso não autorizado. Faça login novamente.",
      };
    }

    const res = await getGrottoThermometerDataApi(userId);

    if (res.error === "PLAN_UPGRADE_REQUIRED") {
      return {
        success: false,
        isUpgradeRequired: true,
        error:
          res.message ||
          "Recurso exclusivo do plano Tubarão Cabeça Chata.",
      };
    }

    if (res.error || !res.data) {
      return {
        success: false,
        error: res.message || "Não foi possível carregar o Termômetro da Gruta.",
      };
    }

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("[getGrottoThermometerAction] Erro inesperado:", error);
    return {
      success: false,
      error: "Erro inesperado ao carregar o Termômetro da Gruta.",
    };
  }
}

