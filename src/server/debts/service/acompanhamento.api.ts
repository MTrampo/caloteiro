import "server-only";

import {
  getActiveDebtsWithRelationsSupabase,
  getInstallmentIdsWithExcusesSupabase,
  type DebtWithRelationsRow,
} from "../repository/acompanhamento.supabase";
import type {
  PromiseItemFormatted,
  PromiseGravity,
  AcompanhamentoSummaryData,
  PaginatedPromisesResult,
  GetPromisesQueryPayload,
} from "@/commons/models/acompanhamento";
import { getNameInitials, calculateDaysDifference } from "@/commons/utils/format";

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
      gravity: "EM_DIA",
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
      gravity: "ACORDO_ROMPIDO",
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
      gravity: "DESGULPA_PADRAO",
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
      gravity: "ATRASO_LEVE",
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
    gravity: "EM_DIA",
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
): AcompanhamentoSummaryData {
  const total = processed.length;
  const emDia = processed.filter((p) => p.promise.gravity === "EM_DIA").length;
  const emAtraso = processed.filter(
    (p) =>
      p.promise.gravity === "ATRASO_LEVE" ||
      p.promise.gravity === "DESGULPA_PADRAO"
  ).length;
  const caloteiros = processed.filter(
    (p) => p.promise.gravity === "ACORDO_ROMPIDO"
  ).length;

  const emDiaPercent = total > 0 ? Math.round((emDia / total) * 100) : 0;
  const emAtrasoPercent = total > 0 ? Math.round((emAtraso / total) * 100) : 0;
  const caloteirosPercent = total > 0 ? Math.round((caloteiros / total) * 100) : 0;

  return {
    emAberto: {
      amount: total === 1 ? "1 suspeito" : `${total} suspeitos`,
      description: "Promessas e pendências na praça",
      last: "Dívidas ativas no radar",
      changePercent: total > 0 ? 100 : 0,
    },
    emDia: {
      amount: emDia === 1 ? "1 milagreiro" : `${emDia} milagreiros`,
      description: "Pagando sem drama nem desculpa",
      last: "Raros e pontuais",
      changePercent: emDiaPercent,
    },
    emAtraso: {
      amount: emAtraso === 1 ? "1 sumido" : `${emAtraso} sumidos`,
      description: "Passou do prazo combinado",
      last: "Hora do 'bom dia, sumido'",
      changePercent: emAtrasoPercent,
    },
    caloteiros: {
      amount: caloteiros === 1 ? "1 lenda" : `${caloteiros} lendas`,
      description: "Deram o perdido no mês",
      last: "Alerta vermelho de golpe",
      changePercent: caloteirosPercent,
    },
  };
}

/**
 * Consulta de promessas com filtros, ordenação e paginação (Infinite Scroll)
 */
export const getAcompanhamentoDataApi = async (
  payload: GetPromisesQueryPayload
): Promise<{
  summary: AcompanhamentoSummaryData;
  paginated: PaginatedPromisesResult;
}> => {
  const {
    userId,
    page = 1,
    limit = 12,
    tab = "EM_ABERTO",
    search = "",
    sortBy = "late_first",
  } = payload;

  const debtsRaw = await getActiveDebtsWithRelationsSupabase(userId);

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
      },
      nextDueDate,
      maxLateDays,
    });
  }

  // 1. Contagens reais para os badges das abas
  const counts = {
    emAberto: processed.length,
    emDia: processed.filter((p) => p.promise.gravity === "EM_DIA").length,
    emAtraso: processed.filter(
      (p) =>
        p.promise.gravity === "ATRASO_LEVE" ||
        p.promise.gravity === "DESGULPA_PADRAO"
    ).length,
    caloteiros: processed.filter(
      (p) => p.promise.gravity === "ACORDO_ROMPIDO"
    ).length,
  };

  // 2. Summary Cards Data
  const summary = buildSummaryCards(processed);

  // 3. Filtragem por Aba
  let filtered = processed.filter(({ promise }) => {
    if (tab === "EM_DIA") return promise.gravity === "EM_DIA";
    if (tab === "EM_ATRASO") {
      return (
        promise.gravity === "ATRASO_LEVE" ||
        promise.gravity === "DESGULPA_PADRAO"
      );
    }
    if (tab === "CALOTEIROS") return promise.gravity === "ACORDO_ROMPIDO";
    return true; // EM_ABERTO
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
      // Prioridade: ACORDO_ROMPIDO (3) > DESGULPA_PADRAO (2) > ATRASO_LEVE (1) > EM_DIA (0)
      const gravityScore: Record<PromiseGravity, number> = {
        ACORDO_ROMPIDO: 4,
        DESGULPA_PADRAO: 3,
        ATRASO_LEVE: 2,
        EM_DIA: 1,
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
    },
  };
};
