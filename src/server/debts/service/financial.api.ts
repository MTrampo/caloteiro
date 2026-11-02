import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/commons/lib/cache/server-cache";
import { getCalendarDateInSaoPaulo, getSecondsUntilMidnightSaoPaulo } from "@/commons/utils/date";
import {
  getFinancialDebtsWithRelationsSupabase,
  getFinancialPaymentsSupabase,
  getCreditorPixKeySupabase,
  type FinancialDebtWithRelationsRow,
} from "../repository/financial.supabase";
import type {
  FinancialPeriod,
  PriorityDebtorData,
  PortfolioDistributionData,
  DebtEfficiencyData,
  FinancialAnalyticsResult,
  EfficiencyTimePoint,
} from "@/commons/models/financial";
import { calculateDaysDifference, getNameInitials } from "@/commons/utils/format";
import { getUserPermissionsOrCacheApi } from "@/server/account/service/subscription.api";
import { partitionDebtsByQuota } from "./debt-quota.api";

interface DateWindow {
  startDate: string;
  pointsCount: number;
  periodLabelFormat: (index: number) => string;
}

/**
 * Retorna a janela temporal e configuração de agregação para o período selecionado
 */
function getPeriodWindow(period: FinancialPeriod): DateWindow {
  const now = new Date();

  if (period === "six_months") {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 6);
    return {
      startDate: start.toISOString(),
      pointsCount: 6,
      periodLabelFormat: (i) => `Mês ${i + 1}`,
    };
  }

  if (period === "year") {
    const start = new Date(now);
    start.setFullYear(start.getFullYear() - 1);
    return {
      startDate: start.toISOString(),
      pointsCount: 12,
      periodLabelFormat: (i) => `Mês ${i + 1}`,
    };
  }

  // Padrão: 30 dias (4 semanas)
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  return {
    startDate: start.toISOString(),
    pointsCount: 4,
    periodLabelFormat: (i) => `Sem ${i + 1}`,
  };
}

/**
 * Cria um objeto de resultado zerado seguro para contas vazias
 */
function createEmptyFinancialResult(period: FinancialPeriod = "month"): FinancialAnalyticsResult {
  const windowConfig = getPeriodWindow(period);
  const series: EfficiencyTimePoint[] = [];
  for (let i = 0; i < windowConfig.pointsCount; i++) {
    series.push({
      periodLabel: windowConfig.periodLabelFormat(i),
      previsto: 0,
      recebido: 0,
      taxa: 100,
    });
  }

  return {
    kpis: {
      emAberto: {
        amount: 0,
        title: "Em Aberto",
        natureLabel: "Total a Receber na Pista",
        description: "Promessas e pendências ativas na gruta",
        footnote: "0 acordos ativos na gruta",
        changePercent: 0,
        isGainOrLoss: "neutral",
      },
      emDia: {
        amount: 0,
        title: "Em Dia",
        natureLabel: "Já no Bolso (Você Ganhou)",
        description: "Milagres confirmados sem drama nem desculpa",
        footnote: "+ R$ 0,00 garantidos na conta",
        changePercent: 0,
        isGainOrLoss: "positive",
      },
      emAtraso: {
        amount: 0,
        title: "Em Atraso",
        natureLabel: "Travado (Falta Receber)",
        description: "Passou do prazo há menos de 30 dias",
        footnote: "Nenhum devedor em atraso leve",
        changePercent: 0,
        isGainOrLoss: "negative",
      },
      caloteiros: {
        amount: 0,
        title: "Caloteiros",
        natureLabel: "Prejuízo (Deixou de Receber)",
        description: "Mais de 30 dias de sumiço ou quebra total",
        footnote: "R$ 0,00 em risco severo de golpe",
        changePercent: 0,
        isGainOrLoss: "negative",
      },
    },
    priorityDebtor: null,
    portfolio: {
      totalAmount: 0,
      totalDebtors: 0,
      emDia: { amount: 0, count: 0, percentage: 0 },
      emAtraso: { amount: 0, count: 0, percentage: 0 },
      critico: { amount: 0, count: 0, percentage: 0 },
      healthMetrics: {
        immediateLiquidity: 100,
        immediateLiquidityLabel: "Liquidez Imediata",
        immediateLiquidityDesc: "Proporção de recebimentos em dia em relação à carteira",
        resolutionRate: 0,
        resolutionRateLabel: "Taxa de Resolução",
        resolutionRateDesc: "Parcelas finalizadas com sucesso sobre o total contratado",
        averageTicket: 0,
        averageTicketLabel: "Ticket Médio",
        averageTicketDesc: "Valor médio por promessa registrada no seu tanque",
      },
    },
    efficiency: {
      globalEfficiencyScore: 100,
      totalPrevisto: 0,
      totalRecebido: 0,
      series,
      metrics: {
        averageTimeToPixDays: 0,
        averageTimeToPixDesc: "Tempo médio em dias para o Pix cair após o vencimento",
        agreementsHonoredPercent: 100,
        agreementsHonoredDesc: "Percentual de promessas quitadas sem quebra total",
        returnRatePercent: 0,
        returnRateDesc: "Retorno financeiro de juros e correções sobre o capital",
        bestPeriodNote: "Sem histórico financeiro no período.",
      },
    },
  };
}

/**
 * Serviço de Inteligência Financeira Consolidada do Tubarão
 * Consolida dados reais de dívidas, parcelas e pagamentos em centavos inteiros precisos.
 */
export const getFinancialAnalyticsApi = async (
  userId: string,
  period: FinancialPeriod = "month"
): Promise<FinancialAnalyticsResult> => {
  const windowConfig = getPeriodWindow(period);
  const todayStr = getCalendarDateInSaoPaulo(new Date());
  const ttlSeconds = getSecondsUntilMidnightSaoPaulo();

  const getCachedFinancialBase = unstable_cache(
    async (uid: string, p: string, startDate: string) => {
      const [debts, payments, creditorPixKey] = await Promise.all([
        getFinancialDebtsWithRelationsSupabase(uid),
        getFinancialPaymentsSupabase(uid, startDate),
        getCreditorPixKeySupabase(uid),
      ]);
      return { debts, payments, creditorPixKey };
    },
    ["financial-data-base", userId, period, todayStr],
    {
      revalidate: ttlSeconds,
      tags: [CACHE_TAGS.userData(userId)],
    }
  );

  const [permissions, { debts, payments, creditorPixKey }] = await Promise.all([
    getUserPermissionsOrCacheApi(userId),
    getCachedFinancialBase(userId, period, windowConfig.startDate),
  ]);

  if (debts.length === 0) {
    return createEmptyFinancialResult(period);
  }

  // Particiona a cota: dívidas de maior valor excedentes vão para a Jaula e NÃO inflam os KPIs
  const quotaPartition = partitionDebtsByQuota(debts, permissions.maxDebtors);

  // Agregações de parcelas e contratos
  let totalPendingAmount = 0;
  let totalPaidAmount = 0;
  let onTimePendingAmount = 0;
  let overdueLightAmount = 0;
  let overdueCriticalAmount = 0;
  let totalOriginalAmount = 0;
  let totalContractedAmount = 0;

  let paidInstallmentsCount = 0;
  let onTimePendingCount = 0;
  let overdueLightCount = 0;
  let overdueCriticalCount = 0;
  let totalInstallmentsCount = 0;
  let totalOverdueDaysSum = 0;

  const uniqueDebtorsSet = new Set<string>();

  // Estrutura para eleger o devedor prioritário
  interface PriorityCandidate {
    installment: NonNullable<FinancialDebtWithRelationsRow["installments"]>[number];
    debt: FinancialDebtWithRelationsRow;
    lateDays: number;
    diffDays: number;
    nominalAmount: number;
    remainingAmount: number;
  }

  const overdueCandidates: PriorityCandidate[] = [];
  const upcomingCandidates: PriorityCandidate[] = [];

  for (const debt of debts) {
    // Se a dívida estiver trancada na jaula, ela é expurgada do resumo financeiro oficial
    if (quotaPartition.lockedDebtIds.has(debt.id)) {
      continue;
    }

    if (debt.debtor_id) {
      uniqueDebtorsSet.add(debt.debtor_id);
    }

    const debtOriginal = Number(debt.original_amount) || 0;
    const debtTotal = Number(debt.total_amount) || debtOriginal;
    totalOriginalAmount += debtOriginal;
    totalContractedAmount += debtTotal;

    const installments = debt.installments || [];
    totalInstallmentsCount += installments.length;

    // Para cada dívida, identifica as parcelas em atraso e apenas a próxima parcela a vencer
    let earliestUpcomingForDebt: PriorityCandidate | null = null;

    for (const inst of installments) {
      const nominal = Number(inst.nominal_amount) || 0;
      const paid = Number(inst.paid_amount) || 0;
      const remaining = Math.max(0, nominal - paid);
      const isPaid = inst.status === "paid" || paid >= nominal;

      if (isPaid) {
        paidInstallmentsCount++;
        totalPaidAmount += Math.max(nominal, paid);
      } else {
        if (paid > 0) {
          totalPaidAmount += paid;
        }
        totalPendingAmount += remaining;

        const { isLate, lateDays, diffDays } = calculateDaysDifference(inst.due_date);

        if (isLate && lateDays > 0) {
          totalOverdueDaysSum += lateDays;
          if (lateDays > 30) {
            overdueCriticalAmount += remaining;
            overdueCriticalCount++;
          } else {
            overdueLightAmount += remaining;
            overdueLightCount++;
          }

          overdueCandidates.push({
            installment: inst,
            debt,
            lateDays,
            diffDays,
            nominalAmount: nominal,
            remainingAmount: remaining,
          });
        } else {
          onTimePendingAmount += remaining;
          onTimePendingCount++;

          const candidate: PriorityCandidate = {
            installment: inst,
            debt,
            lateDays: 0,
            diffDays,
            nominalAmount: nominal,
            remainingAmount: remaining,
          };

          if (
            !earliestUpcomingForDebt ||
            candidate.diffDays < earliestUpcomingForDebt.diffDays ||
            (candidate.diffDays === earliestUpcomingForDebt.diffDays &&
              candidate.installment.installment_number <
                earliestUpcomingForDebt.installment.installment_number)
          ) {
            earliestUpcomingForDebt = candidate;
          }
        }
      }
    }

    if (earliestUpcomingForDebt) {
      upcomingCandidates.push(earliestUpcomingForDebt);
    }
  }

  // Considera o total de pagamentos registrados no período se houver amortizações pontuais
  const periodPaymentsTotal = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const effectivePaid = Math.max(totalPaidAmount, periodPaymentsTotal);

  // Determina o Alvo Imediato (PriorityDebtor):
  // Prioriza o vencimento mais próximo/atrasado (data); em caso de mesma data, usa o maior saldo a receber (remainingAmount) como desempate.
  let priorityDebtor: PriorityDebtorData | null = null;

  const nearUpcomingCandidates = upcomingCandidates.filter((c) => c.diffDays <= 30);
  const priorityPool =
    overdueCandidates.length > 0 || nearUpcomingCandidates.length > 0
      ? [...overdueCandidates, ...nearUpcomingCandidates]
      : [...upcomingCandidates];

  if (priorityPool.length > 0) {
    // 1º critério: Data de vencimento mais urgente/próxima (menor diffDays)
    // 2º critério (desempate na mesma data): Maior saldo restante a receber (remainingAmount)
    priorityPool.sort((a, b) => {
      if (a.diffDays !== b.diffDays) {
        return a.diffDays - b.diffDays;
      }
      return b.remainingAmount - a.remainingAmount;
    });

    const top = priorityPool[0];
    const debtor = top.debt.debtor;
    const debtorPixKey = debtor?.pix_key || null;
    const debtorPixKeyType = debtor?.pix_key_type || null;
    const isOverdue = top.lateDays > 0;
    const isCritical = top.lateDays > 15;
    const isDueToday = !isOverdue && top.diffDays === 0;

    let urgency: PriorityDebtorData["urgency"] = "PROXIMO";
    let reasonText = `Vencimento programado em ${top.diffDays} dias.`;

    if (isOverdue) {
      urgency = isCritical ? "CRITICO" : "ATRASO_LEVE";
      reasonText = isCritical
        ? `${top.lateDays} dias em atraso. Alerta vermelho acionado para intervenção do Tubarão.`
        : `${top.lateDays} dias de atraso. Hora de enviar o lembrete de cobrança.`;
    } else if (isDueToday) {
      urgency = "VENCE_HOJE";
      reasonText = "Vence hoje! Acompanhe o Pix ou cobre logo pela manhã.";
    }

    priorityDebtor = {
      id: top.debt.id,
      debtId: top.debt.id,
      installmentId: top.installment.id,
      debtorId: top.debt.debtor_id,
      debtorName: debtor?.name || "Devedor",
      debtorInitials: getNameInitials(debtor?.name || "D"),
      debtorPhone: debtor?.phone || "",
      debtTitle: top.debt.title,
      currentInstallment: top.installment.installment_number,
      totalInstallments: top.debt.installments_count || top.debt.installments?.length || 1,
      installmentAmount: Number(top.installment.nominal_amount) || 0,
      remainingAmount: top.remainingAmount,
      totalDebtAmount: Number(top.debt.total_amount) || 0,
      pixKey: debtorPixKey || "",
      debtorPixKey,
      debtorPixKeyType,
      creditorPixKey: creditorPixKey || null,
      dueDate: top.installment.due_date,
      urgency,
      reasonText,
    };
  }

  // KPIs: No banco public.debts, dívidas ativas têm status 'pending' (ou diferente de 'settled')
  const allowedDebts = debts.filter((d) => !quotaPartition.lockedDebtIds.has(d.id));
  const activeDebtsCount = allowedDebts.filter((d) => d.status !== "settled").length;
  const totalVolume = effectivePaid + totalPendingAmount;
  const pendingVolumePercent =
    totalVolume > 0 ? Math.round((totalPendingAmount / totalVolume) * 100) : 0;
  const paidVolumePercent =
    totalVolume > 0 ? Math.round((effectivePaid / totalVolume) * 100) : 0;

  const footnoteEmAberto = quotaPartition.isOverQuota
    ? `${activeDebtsCount} ${activeDebtsCount === 1 ? "acordo ativo" : "acordos ativos"} (⚠️ ${quotaPartition.lockedDebtsCount} na jaula)`
    : `${activeDebtsCount} ${activeDebtsCount === 1 ? "acordo ativo" : "acordos ativos"} na gruta`;

  const kpis = {
    emAberto: {
      amount: totalPendingAmount,
      title: "Em Aberto",
      natureLabel: "Total a Receber na Pista",
      description: "Promessas e pendências ativas nos prazos",
      footnote: footnoteEmAberto,
      changePercent: pendingVolumePercent,
      isGainOrLoss: "neutral" as const,
    },
    emDia: {
      amount: effectivePaid,
      title: "Em Dia",
      natureLabel: "Já no Bolso (Você Ganhou)",
      description: "Milagres confirmados sem drama nem desculpa",
      footnote: `+ R$ ${effectivePaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} garantidos na conta`,
      changePercent: paidVolumePercent,
      isGainOrLoss: "positive" as const,
    },
    emAtraso: {
      amount: overdueLightAmount,
      title: "Em Atraso",
      natureLabel: "Travado (Falta Receber)",
      description: "Passou do prazo há menos de 30 dias",
      footnote:
        overdueLightCount > 0
          ? `${overdueLightCount} ${overdueLightCount === 1 ? "parcela em atraso leve" : "parcelas em atraso leve"}`
          : "Nenhum atraso leve",
      changePercent: totalPendingAmount > 0 ? Math.round((overdueLightAmount / totalPendingAmount) * 100) : 0,
      isGainOrLoss: "negative" as const,
    },
    caloteiros: {
      amount: overdueCriticalAmount,
      title: "Caloteiros",
      natureLabel: "Prejuízo (Deixou de Receber)",
      description: "Mais de 30 dias de sumiço ou quebra total",
      footnote:
        overdueCriticalCount > 0
          ? `${overdueCriticalCount} ${overdueCriticalCount === 1 ? "parcela em alerta vermelho" : "parcelas em alerta vermelho"}`
          : "Nenhum caloteiro crítico",
      changePercent: totalPendingAmount > 0 ? Math.round((overdueCriticalAmount / totalPendingAmount) * 100) : 0,
      isGainOrLoss: "negative" as const,
    },
  };

  // Carteira: Em Dia (Recebido + A Vencer no Prazo) vs Em Atraso (<30d) vs Crítico (>30d)
  const portfolioOnTimeAmount = effectivePaid + onTimePendingAmount;
  const portfolioOnTimeCount = paidInstallmentsCount + onTimePendingCount;
  const overduePercentage = totalVolume > 0 ? Math.round((overdueLightAmount / totalVolume) * 100) : 0;
  const criticalPercentage = totalVolume > 0 ? Math.round((overdueCriticalAmount / totalVolume) * 100) : 0;
  const portfolioOnTimePercentage =
    totalVolume > 0 ? Math.max(0, 100 - overduePercentage - criticalPercentage) : 0;

  const resolutionRate = totalInstallmentsCount > 0
    ? Math.round((paidInstallmentsCount / totalInstallmentsCount) * 100)
    : 0;

  const averageTicket = debts.length > 0
    ? Math.round((totalVolume / debts.length) * 100) / 100
    : 0;

  const portfolio: PortfolioDistributionData = {
    totalAmount: totalVolume,
    totalDebtors: uniqueDebtorsSet.size,
    emDia: {
      amount: portfolioOnTimeAmount,
      count: portfolioOnTimeCount,
      percentage: portfolioOnTimePercentage,
    },
    emAtraso: {
      amount: overdueLightAmount,
      count: overdueLightCount,
      percentage: overduePercentage,
    },
    critico: {
      amount: overdueCriticalAmount,
      count: overdueCriticalCount,
      percentage: criticalPercentage,
    },
    healthMetrics: {
      immediateLiquidity: paidVolumePercent,
      immediateLiquidityLabel: "Liquidez Imediata",
      immediateLiquidityDesc: "Percentual recuperado em relação ao montante total contratado",
      resolutionRate,
      resolutionRateLabel: "Taxa de Resolução",
      resolutionRateDesc: `${paidInstallmentsCount} de ${totalInstallmentsCount} parcelas já foram liquidadas`,
      averageTicket,
      averageTicketLabel: "Ticket Médio",
      averageTicketDesc: `Média de R$ ${averageTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} por acordo`,
    },
  };

  // Eficiência Temporal
  const pointsCount = windowConfig.pointsCount;
  const series: EfficiencyTimePoint[] = [];

  const intervalPrevisto = totalVolume / Math.max(1, pointsCount);
  const intervalRecebido = effectivePaid / Math.max(1, pointsCount);

  for (let i = 0; i < pointsCount; i++) {
    const label = windowConfig.periodLabelFormat(i);
    const previsto = Math.round(intervalPrevisto * 100) / 100;
    const recebido = Math.round(intervalRecebido * 100) / 100;
    const taxa = previsto > 0 ? Math.min(100, Math.round((recebido / previsto) * 100)) : 100;

    series.push({
      periodLabel: label,
      previsto,
      recebido,
      taxa,
    });
  }

  const globalEfficiencyScore = totalVolume > 0
    ? Math.min(100, Math.round((effectivePaid / totalVolume) * 100))
    : 100;

  const totalOverdueCount = overdueLightCount + overdueCriticalCount;
  const averageTimeToPixDays =
    totalOverdueCount > 0 ? Math.round(totalOverdueDaysSum / totalOverdueCount) : 0;

  const totalInterestAmount = Math.max(0, totalContractedAmount - totalOriginalAmount);
  const returnRatePercent =
    totalOriginalAmount > 0
      ? Math.round((totalInterestAmount / totalOriginalAmount) * 100)
      : 0;

  const efficiency: DebtEfficiencyData = {
    globalEfficiencyScore,
    totalPrevisto: totalVolume,
    totalRecebido: effectivePaid,
    series,
    metrics: {
      averageTimeToPixDays,
      averageTimeToPixDesc:
        totalOverdueCount > 0
          ? "Média de dias em atraso nas parcelas vencidas"
          : "Pagamentos realizados dentro do prazo combinado",
      agreementsHonoredPercent: resolutionRate,
      agreementsHonoredDesc: `${paidInstallmentsCount} de ${totalInstallmentsCount} parcelas quitadas integralmente`,
      returnRatePercent,
      returnRateDesc:
        totalInterestAmount > 0
          ? `+ R$ ${totalInterestAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de juros sobre o capital`
          : "Acordos firmados sem cobrança de juros",
      bestPeriodNote: effectivePaid > 0 ? "Fluxo regular de recebimentos identificado." : "Aguardando primeiras amortizações.",
    },
  };

  return {
    kpis,
    priorityDebtor,
    portfolio,
    efficiency,
    lockedQuotaSummary: {
      lockedDebtsCount: quotaPartition.lockedDebtsCount,
      lockedTotalAmount: quotaPartition.lockedTotalAmount,
      isOverQuota: quotaPartition.isOverQuota,
      maxAllowed: quotaPartition.maxAllowed,
    },
  };
};
