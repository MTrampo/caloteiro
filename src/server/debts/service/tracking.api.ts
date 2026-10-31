import "server-only";

import {
  getActiveDebtsWithRelationsSupabase,
  getInstallmentIdsWithExcusesSupabase,
  type DebtWithRelationsRow,
} from "../repository/tracking.supabase";
import type {
  PromiseItemFormatted,
  PromiseGravity,
  PromiseFilterTab,
  TrackingSummaryData,
  TrackingCounts,
  PaginatedPromisesResult,
  GetPromisesQueryPayload,
} from "@/commons/models/tracking";
import { getNameInitials, calculateDaysDifference } from "@/commons/utils/format";
import { getUserPermissionsOrCacheApi } from "@/server/account/service/subscription.api";
import { partitionDebtsByQuota } from "./debt-quota.api";

interface ProcessedPromiseDebt {
  promise: PromiseItemFormatted;
  nextDueDate: string | null;
  maxLateDays: number;
}

/**
 * Converte data para timestamp seguro
 */
function getTimestamp(dateStr?: string | null): number {
  if (!dateStr) return 0;
  return new Date(dateStr).getTime();
}

/**
 * Determina gravidade e prazo da dívida baseado nas suas parcelas
 */
function processDebtGravityAndStatus(
  debt: DebtWithRelationsRow,
  installmentsWithExcuses: Set<string>
): {
  gravity: PromiseGravity;
  dueStatusText: string;
  paidCount: number;
  totalCount: number;
  nextDueDate: string | null;
  maxLateDays: number;
} {
  const installments = debt.installments || [];
  const totalCount = installments.length || debt.installments_count || 1;

  // Ordena parcelas por número
  const sorted = [...installments].sort(
    (a, b) => a.installment_number - b.installment_number
  );

  let paidCount = 0;
  let overdueCount = 0;
  let maxLateDays = 0;
  let nextPendingDue: string | null = null;
  let nextPendingDiffDays: number | null = null;
  let hasExcuseOnOverdue = false;

  for (const inst of sorted) {
    const nominal = Number(inst.nominal_amount);
    const paid = Number(inst.paid_amount);
    const isPaid = inst.status === "paid" || paid >= nominal;

    if (isPaid) {
      paidCount++;
      continue;
    }

    const { isLate, lateDays, diffDays } = calculateDaysDifference(inst.due_date);

    if (isLate && lateDays > 0) {
      overdueCount++;
      if (lateDays > maxLateDays) {
        maxLateDays = lateDays;
      }
      if (installmentsWithExcuses.has(inst.id)) {
        hasExcuseOnOverdue = true;
      }
    } else if (nextPendingDue === null) {
      nextPendingDue = inst.due_date;
      nextPendingDiffDays = diffDays;
    }
  }

  // 1. Dívida quitada
  if (paidCount >= totalCount || debt.status === "settled") {
    return {
      gravity: "ON_TIME",
      dueStatusText: "Totalmente quitada",
      paidCount: totalCount,
      totalCount,
      nextDueDate: null,
      maxLateDays: 0,
    };
  }

  // 2. Acordo Rompido / Caloteiro (atraso grave > 15 dias ou >= 2 parcelas acumuladas)
  if (overdueCount >= 2 || maxLateDays > 15 || debt.status === "defaulted") {
    const text =
      overdueCount >= 2
        ? `${overdueCount} parcelas acumuladas`
        : `Venceu há ${maxLateDays} dias`;
    return {
      gravity: "BROKEN_AGREEMENT",
      dueStatusText: text,
      paidCount,
      totalCount,
      nextDueDate: nextPendingDue,
      maxLateDays,
    };
  }

  // 3. Desculpa Padrão (tem caô anotado em parcela atrasada)
  if (hasExcuseOnOverdue) {
    return {
      gravity: "STANDARD_EXCUSE",
      dueStatusText: `Venceu há ${maxLateDays} dias (com caô)`,
      paidCount,
      totalCount,
      nextDueDate: nextPendingDue,
      maxLateDays,
    };
  }

  // 4. Atraso Leve (1 a 15 dias de atraso, 1 parcela)
  if (overdueCount > 0) {
    return {
      gravity: "LIGHT_DELAY",
      dueStatusText:
        maxLateDays === 1 ? "Venceu ontem" : `Venceu há ${maxLateDays} dias`,
      paidCount,
      totalCount,
      nextDueDate: nextPendingDue,
      maxLateDays,
    };
  }

  // 5. Em Dia (próximo vencimento no futuro ou hoje)
  let statusText = "Em dia";
  if (nextPendingDiffDays !== null) {
    if (nextPendingDiffDays === 0) {
      statusText = "Vence hoje!";
    } else if (nextPendingDiffDays === 1) {
      statusText = "Vence amanhã";
    } else {
      statusText = `Vence em ${nextPendingDiffDays} dias`;
    }
  }

  return {
    gravity: "ON_TIME",
    dueStatusText: statusText,
    paidCount,
    totalCount,
    nextDueDate: nextPendingDue,
    maxLateDays: 0,
  };
}

/**
 * Monta os 4 Summary Cards com os dados consolidados do usuário
 */
export function buildSummaryCards(
  processed: ProcessedPromiseDebt[]
): TrackingSummaryData {
  const total = processed.length;
  const onTime = processed.filter((p) => p.promise.gravity === "ON_TIME").length;
  const overdue = processed.filter(
    (p) =>
      p.promise.gravity === "LIGHT_DELAY" ||
      p.promise.gravity === "STANDARD_EXCUSE"
  ).length;
  const defaulted = processed.filter(
    (p) => p.promise.gravity === "BROKEN_AGREEMENT"
  ).length;

  const onTimePercent = total > 0 ? Math.round((onTime / total) * 100) : 0;
  const overduePercent = total > 0 ? Math.round((overdue / total) * 100) : 0;
  const defaultedPercent = total > 0 ? Math.round((defaulted / total) * 100) : 0;

  return {
    open: {
      amount: total === 1 ? "1 suspeito" : `${total} suspeitos`,
      description: "Promessas e pendências na praça",
      last: "Dívidas ativas na gruta",
      changePercent: total > 0 ? 100 : 0,
    },
    onTime: {
      amount: onTime === 1 ? "1 milagreiro" : `${onTime} milagreiros`,
      description: "Pagando sem drama nem desculpa",
      last: "Raros e pontuais",
      changePercent: onTimePercent,
    },
    overdue: {
      amount: overdue === 1 ? "1 sumido" : `${overdue} sumidos`,
      description: "Passou do prazo combinado",
      last: "Hora do 'bom dia, sumido'",
      changePercent: overduePercent,
    },
    defaulted: {
      amount: defaulted === 1 ? "1 lenda" : `${defaulted} lendas`,
      description: "Deram o perdido no mês",
      last: "Alerta vermelho de golpe",
      changePercent: defaultedPercent,
    },
  };
}

/**
 * Normaliza o valor de tab para o padrão inglês
 */
function normalizeTab(rawTab?: string): PromiseFilterTab {
  if (rawTab === "EM_DIA" || rawTab === "ON_TIME") return "ON_TIME";
  if (rawTab === "EM_ATRASO" || rawTab === "OVERDUE") return "OVERDUE";
  if (rawTab === "CALOTEIROS" || rawTab === "DEFAULTED") return "DEFAULTED";
  return "OPEN";
}

/**
 * Consulta de promessas com filtros, ordenação e paginação (Infinite Scroll)
 */
export const getTrackingDataApi = async (
  payload: GetPromisesQueryPayload & { userId: string }
): Promise<{
  summary: TrackingSummaryData;
  paginated: PaginatedPromisesResult;
}> => {
  const {
    userId,
    page = 1,
    limit = 12,
    tab: rawTab,
    search = "",
    sortBy = "late_first",
  } = payload;

  const tab = normalizeTab(rawTab);
  const [permissions, debtsRaw] = await Promise.all([
    getUserPermissionsOrCacheApi(userId),
    getActiveDebtsWithRelationsSupabase(userId),
  ]);

  const quotaPartition = partitionDebtsByQuota(debtsRaw, permissions.maxDebtors);

  // Coleta IDs de parcelas para buscar desculpas registradas
  const allInstallmentIds: string[] = [];
  for (const d of debtsRaw) {
    if (d.installments) {
      for (const inst of d.installments) {
        allInstallmentIds.push(inst.id);
      }
    }
  }

  const excusesSet = await getInstallmentIdsWithExcusesSupabase(allInstallmentIds);

  // Processa cada dívida ativa
  const processed: ProcessedPromiseDebt[] = [];

  for (const debt of debtsRaw) {
    const debtorName = debt.debtor?.name || "Devedor Desconhecido";
    const debtorInitials = getNameInitials(debtorName);
    const {
      gravity,
      dueStatusText,
      paidCount,
      totalCount,
      nextDueDate,
      maxLateDays,
    } = processDebtGravityAndStatus(debt, excusesSet);

    const isLocked = quotaPartition.lockedDebtIds.has(debt.id);
    const lockedReason = isLocked
      ? "Presa trancada na jaula! Esta dívida possui maior valor em aberto e foi bloqueada devido ao limite do seu plano atual."
      : undefined;

    processed.push({
      promise: {
        id: debt.id,
        debtorId: debt.debtor_id,
        debtorName,
        debtorNickname: debt.debtor?.nickname || null,
        debtorInitials,
        debtTitle: debt.title,
        paidInstallments: paidCount,
        totalInstallments: totalCount,
        dueStatusText,
        gravity,
        url: `/painel/dividas/${debt.id}`,
        createdAt: debt.created_at || new Date().toISOString(),
        isLocked,
        lockedReason,
      },
      nextDueDate,
      maxLateDays,
    });
  }

  // 1. Contagens para os badges das abas (expurga as dívidas trancadas dos KPIs oficiais)
  const allowedProcessed = processed.filter((p) => !p.promise.isLocked);

  const counts: TrackingCounts = {
    open: allowedProcessed.length,
    onTime: allowedProcessed.filter((p) => p.promise.gravity === "ON_TIME").length,
    overdue: allowedProcessed.filter(
      (p) =>
        p.promise.gravity === "LIGHT_DELAY" ||
        p.promise.gravity === "STANDARD_EXCUSE"
    ).length,
    defaulted: allowedProcessed.filter(
      (p) => p.promise.gravity === "BROKEN_AGREEMENT"
    ).length,
  };

  // 2. Summary Cards Data (calculado somente sobre as ativas liberadas)
  const summary = buildSummaryCards(allowedProcessed);

  // 3. Filtragem por Aba
  let filtered = processed.filter(({ promise }) => {
    if (tab === "ON_TIME") return promise.gravity === "ON_TIME";
    if (tab === "OVERDUE") {
      return (
        promise.gravity === "LIGHT_DELAY" ||
        promise.gravity === "STANDARD_EXCUSE"
      );
    }
    if (tab === "DEFAULTED") return promise.gravity === "BROKEN_AGREEMENT";
    return true; // OPEN
  });

  // 4. Filtragem por Busca
  if (search.trim()) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      ({ promise }) =>
        promise.debtorName.toLowerCase().includes(query) ||
        (promise.debtorNickname &&
          promise.debtorNickname.toLowerCase().includes(query)) ||
        promise.debtTitle.toLowerCase().includes(query)
    );
  }

  // 5. Ordenação Flexível
  filtered.sort((a, b) => {
    if (sortBy === "late_first") {
      const gravityScore: Record<PromiseGravity, number> = {
        BROKEN_AGREEMENT: 4,
        STANDARD_EXCUSE: 3,
        LIGHT_DELAY: 2,
        ON_TIME: 1,
      };
      const scoreDiff =
        gravityScore[b.promise.gravity] - gravityScore[a.promise.gravity];
      if (scoreDiff !== 0) return scoreDiff;

      // Se ambos em atraso, o com mais dias de atraso vem primeiro
      if (b.maxLateDays !== a.maxLateDays) {
        return b.maxLateDays - a.maxLateDays;
      }

      // Desempate: data de criação mais recente
      return getTimestamp(b.promise.createdAt) - getTimestamp(a.promise.createdAt);
    }

    if (sortBy === "due_date_asc") {
      if (!a.nextDueDate && !b.nextDueDate) return 0;
      if (!a.nextDueDate) return 1;
      if (!b.nextDueDate) return -1;
      return getTimestamp(a.nextDueDate) - getTimestamp(b.nextDueDate);
    }

    if (sortBy === "created_at_desc") {
      return getTimestamp(b.promise.createdAt) - getTimestamp(a.promise.createdAt);
    }

    if (sortBy === "debtor_name_asc") {
      return a.promise.debtorName.localeCompare(b.promise.debtorName, "pt-BR");
    }

    return 0;
  });

  // 6. Paginação (Infinite Scroll - 12x por página)
  const total = filtered.length;
  const offset = (page - 1) * limit;
  const items = filtered
    .slice(offset, offset + limit)
    .map((item) => item.promise);
  const hasMore = offset + limit < total;

  return {
    summary,
    paginated: {
      items,
      total,
      page,
      limit,
      hasMore,
      counts,
      lockedQuotaSummary: {
        lockedDebtsCount: quotaPartition.lockedDebtsCount,
        lockedTotalAmount: quotaPartition.lockedTotalAmount,
        isOverQuota: quotaPartition.isOverQuota,
        maxAllowed: quotaPartition.maxAllowed,
      },
    },
  };
};

