import "server-only";

import type { PartitionedDebtsQuotaResult } from "@/commons/models/quota";
import { getUserPermissionsOrCacheApi } from "@/server/account/service/subscription.api";
import { getActiveDebtsWithRelationsSupabase } from "../repository/tracking.supabase";

export interface QuotaDebtTarget {
  id: string;
  user_id?: string;
  status: string;
  original_amount: number;
  total_amount?: number | null;
  created_at?: string | null;
  installments?: Array<{
    nominal_amount: number;
    paid_amount?: number | null;
    status?: string;
  }> | null;
}

/**
 * Calcula o saldo restante real em aberto de uma dívida (total contratado - amortizações).
 */
export function calculateRemainingDebtAmount(debt: QuotaDebtTarget): number {
  const nominalTotal = Number(debt.total_amount ?? debt.original_amount ?? 0);
  if (debt.installments && debt.installments.length > 0) {
    const totalPaid = debt.installments.reduce(
      (sum, inst) => sum + Number(inst.paid_amount || 0),
      0
    );
    const remaining = nominalTotal - totalPaid;
    return Math.max(0, Math.round(remaining * 100) / 100);
  }
  return Math.max(0, nominalTotal);
}

/**
 * Particiona determinística e inteligentemente as dívidas do credor por cota do plano:
 * - Dívidas quitadas (status = 'settled') não consomem cota da gruta.
 * - Quando as dívidas ativas ultrapassam a cota (ex: downgrade de Tubarão Branco para Lixa):
 *   As dívidas de MENOR valor em aberto ocupam as vagas liberadas do plano.
 *   As dívidas de MAIOR valor em aberto são enviadas para A JAULA (isLocked = true).
 */
export function partitionDebtsByQuota<T extends QuotaDebtTarget>(
  debts: T[],
  maxAllowed: number | null
): PartitionedDebtsQuotaResult {
  const activeDebts = debts.filter((d) => d.status !== "settled");
  const totalActive = activeDebts.length;

  if (maxAllowed === null || totalActive <= maxAllowed) {
    return {
      activeDebtIds: new Set(activeDebts.map((d) => d.id)),
      lockedDebtIds: new Set(),
      lockedDebtsCount: 0,
      lockedTotalAmount: 0,
      isOverQuota: false,
      maxAllowed,
    };
  }

  // Ordena determinísticamente: menores valores restantes primeiro (ocupam as vagas liberadas)
  const sorted = [...activeDebts].sort((a, b) => {
    const remA = calculateRemainingDebtAmount(a);
    const remB = calculateRemainingDebtAmount(b);
    if (remA !== remB) {
      return remA - remB;
    }
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return a.id.localeCompare(b.id);
  });

  const allowedItems = sorted.slice(0, maxAllowed);
  const lockedItems = sorted.slice(maxAllowed);

  const activeDebtIds = new Set(allowedItems.map((d) => d.id));
  const lockedDebtIds = new Set(lockedItems.map((d) => d.id));

  const lockedTotalAmount = lockedItems.reduce((acc, curr) => {
    return acc + calculateRemainingDebtAmount(curr);
  }, 0);

  return {
    activeDebtIds,
    lockedDebtIds,
    lockedDebtsCount: lockedItems.length,
    lockedTotalAmount: Math.round(lockedTotalAmount * 100) / 100,
    isOverQuota: true,
    maxAllowed,
  };
}

/**
 * Consulta a partição de cota ativa do usuário no servidor
 */
export const getUserDebtQuotaPartitionApi = async (
  userId: string
): Promise<PartitionedDebtsQuotaResult> => {
  const [permissions, debts] = await Promise.all([
    getUserPermissionsOrCacheApi(userId),
    getActiveDebtsWithRelationsSupabase(userId),
  ]);

  return partitionDebtsByQuota(debts, permissions.maxDebtors);
};

/**
 * Verifica de forma Zero Trust se uma dívida específica está trancada na jaula para o credor
 */
export const checkDebtLockedStatusApi = async (
  debtId: string,
  userId: string
): Promise<{ isLocked: boolean; reason?: string }> => {
  const partition = await getUserDebtQuotaPartitionApi(userId);
  if (partition.lockedDebtIds.has(debtId)) {
    return {
      isLocked: true,
      reason:
        "Presa trancada na jaula! Esta dívida possui maior valor em aberto e foi bloqueada devido ao limite do seu plano atual. Faça o upgrade para soltar a fera e continuar cobrando.",
    };
  }
  return { isLocked: false };
};

