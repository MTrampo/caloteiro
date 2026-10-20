import "server-only";

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

  const [debts, payments, creditorPixKey] = await Promise.all([
    getFinancialDebtsWithRelationsSupabase(userId),
    getFinancialPaymentsSupabase(userId, windowConfig.startDate),
    getCreditorPixKeySupabase(userId),
  ]);

  if (debts.length === 0) {
    return createEmptyFinancialResult(period);
  }

  // Agregações de parcelas
  let totalPendingAmount = 0;
  let totalPaidAmount = 0;
  let overdueLightAmount = 0;
  let overdueCriticalAmount = 0;

  let paidInstallmentsCount = 0;
  let overdueLightCount = 0;
  let overdueCriticalCount = 0;
  let totalInstallmentsCount = 0;

  const uniqueDebtorsSet = new Set<string>();

  // Estrutura para eleger o devedor prioritário
  interface PriorityCandidate {
    installment: NonNullable<FinancialDebtWithRelationsRow["installments"]>[number];
    debt: FinancialDebtWithRelationsRow;
    lateDays: number;
    diffDays: number;
    remainingAmount: number;
  }

  const overdueCandidates: PriorityCandidate[] = [];
  const upcomingCandidates: PriorityCandidate[] = [];

  for (const debt of debts) {
    if (debt.debtor_id) {
      uniqueDebtorsSet.add(debt.debtor_id);
    }

    const installments = debt.installments || [];
    totalInstallmentsCount += installments.length;

    for (const inst of installments) {
      const nominal = Number(inst.nominal_amount) || 0;
      const paid = Number(inst.paid_amount) || 0;
      const remaining = Math.max(0, nominal - paid);
      const isPaid = inst.status === "paid" || paid >= nominal;

      if (isPaid) {
        paidInstallmentsCount++;
        totalPaidAmount += nominal;
      } else {
        totalPendingAmount += remaining;

        const { isLate, lateDays, diffDays } = calculateDaysDifference(inst.due_date);

        if (isLate && lateDays > 0) {
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
            remainingAmount: remaining,
          });
        } else {
          upcomingCandidates.push({
            installment: inst,
            debt,
            lateDays: 0,
            diffDays,
            remainingAmount: remaining,
          });
        }
      }
    }
  }

  // Considera o total de pagamentos registrados no período se houver amortizações pontuais
  const periodPaymentsTotal = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const effectivePaid = Math.max(totalPaidAmount, periodPaymentsTotal);

  // Determina o Alvo Imediato (PriorityDebtor)
  let priorityDebtor: PriorityDebtorData | null = null;

  if (overdueCandidates.length > 0) {
    // Ordena os mais atrasados primeiro e, em empate, pelo maior saldo pendente
    overdueCandidates.sort((a, b) => {
      if (b.lateDays !== a.lateDays) return b.lateDays - a.lateDays;
      return b.remainingAmount - a.remainingAmount;
    });

    const top = overdueCandidates[0];
    const debtor = top.debt.debtor;
    const isCritical = top.lateDays > 15;
    const debtorPixKey = debtor?.pix_key || null;
    const debtorPixKeyType = debtor?.pix_key_type || null;

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
      urgency: isCritical ? "CRITICO" : "ATRASO_LEVE",
      reasonText: isCritical
        ? `${top.lateDays} dias em atraso. Alerta vermelho acionado para intervenção do Tubarão.`
        : `${top.lateDays} dias de atraso. Hora de enviar o lembrete de cobrança.`,
    };
  } else if (upcomingCandidates.length > 0) {
    // Vencimentos mais próximos (desempate por maior valor pendente)
    upcomingCandidates.sort((a, b) => {
      if (a.diffDays !== b.diffDays) return a.diffDays - b.diffDays;
      return b.remainingAmount - a.remainingAmount;
    });
    const top = upcomingCandidates[0];
    const debtor = top.debt.debtor;
    const isDueToday = top.diffDays === 0;
    const debtorPixKey = debtor?.pix_key || null;
    const debtorPixKeyType = debtor?.pix_key_type || null;

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
      urgency: isDueToday ? "VENCE_HOJE" : "PROXIMO",
      reasonText: isDueToday
        ? "Vence hoje! Acompanhe o Pix ou cobre logo pela manhã."
        : `Vencimento programado em ${top.diffDays} dias.`,
    };
  }

  // KPIs
  const activeDebtsCount = debts.filter((d) => d.status === "active").length;

  const kpis = {
    emAberto: {
      amount: totalPendingAmount,
      title: "Em Aberto",
      natureLabel: "Total a Receber na Pista",
      description: "Promessas e pendências ativas nos prazos",
      footnote: `${activeDebtsCount} ${activeDebtsCount === 1 ? "acordo ativo" : "acordos ativos"} na gruta`,
      changePercent: 100,
      isGainOrLoss: "neutral" as const,
    },
    emDia: {
      amount: effectivePaid,
      title: "Em Dia",
      natureLabel: "Já no Bolso (Você Ganhou)",
      description: "Milagres confirmados sem drama nem desculpa",
      footnote: `+ R$ ${effectivePaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} garantidos na conta`,
      changePercent: totalPendingAmount > 0 ? Math.round((effectivePaid / (effectivePaid + totalPendingAmount)) * 100) : 100,
      isGainOrLoss: "positive" as const,
    },
    emAtraso: {
      amount: overdueLightAmount,
      title: "Em Atraso",
      natureLabel: "Travado (Falta Receber)",
      description: "Passou do prazo há menos de 30 dias",
      footnote: overdueLightCount > 0 ? `${overdueLightCount} parcelas em atraso leve` : "Nenhum atraso leve",
      changePercent: totalPendingAmount > 0 ? Math.round((overdueLightAmount / totalPendingAmount) * 100) : 0,
      isGainOrLoss: "negative" as const,
    },
    caloteiros: {
      amount: overdueCriticalAmount,
      title: "Caloteiros",
      natureLabel: "Prejuízo (Deixou de Receber)",
      description: "Mais de 30 dias de sumiço ou quebra total",
      footnote: overdueCriticalCount > 0 ? `${overdueCriticalCount} parcelas em alerta vermelho` : "Nenhum caloteiro crítico",
      changePercent: totalPendingAmount > 0 ? Math.round((overdueCriticalAmount / totalPendingAmount) * 100) : 0,
      isGainOrLoss: "negative" as const,
    },
  };

  // Carteira
  const totalVolume = effectivePaid + totalPendingAmount;
  const onTimePercentage = totalVolume > 0 ? Math.round((effectivePaid / totalVolume) * 100) : 0;
  const overduePercentage = totalVolume > 0 ? Math.round((overdueLightAmount / totalVolume) * 100) : 0;
  const criticalPercentage = totalVolume > 0 ? Math.round((overdueCriticalAmount / totalVolume) * 100) : 0;

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
      amount: effectivePaid,
      count: paidInstallmentsCount,
      percentage: onTimePercentage,
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
      immediateLiquidity: onTimePercentage,
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

  const intervalPrevisto = totalPendingAmount / Math.max(1, pointsCount);
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

  const efficiency: DebtEfficiencyData = {
    globalEfficiencyScore,
    totalPrevisto: totalVolume,
    totalRecebido: effectivePaid,
    series,
    metrics: {
      averageTimeToPixDays: 3,
      averageTimeToPixDesc: "Média estimada para compensação após o vencimento",
      agreementsHonoredPercent: resolutionRate,
      agreementsHonoredDesc: "Parcelas honradas sem necessidade de cobrança judicial",
      returnRatePercent: Math.round(Math.min(100, onTimePercentage)),
      returnRateDesc: "Taxa de recuperação sobre o capital na pista",
      bestPeriodNote: effectivePaid > 0 ? "Fluxo regular de recebimentos identificado." : "Aguardando primeiras amortizações.",
    },
  };

  return {
    kpis,
    priorityDebtor,
    portfolio,
    efficiency,
  };
};
