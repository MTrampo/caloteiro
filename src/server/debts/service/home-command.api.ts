import "server-only";

import {
  getHomeCommandDebtsSupabase,
  getRecentExcusesByInstallmentIdsSupabase,
  getRecentDebtPaymentsSupabase,
  type HomeCommandDebtRow,
  type RecentDebtPaymentRow,
} from "../repository/home-command.supabase";
import { getCreditorSettingsByUserIdSupabase } from "@/server/account/repository/creditor-settings.supabase";
import type {
  CommandCenterData,
  FeedOccurrence,
  TriageKPIs,
} from "@/commons/models/home-command";
import {
  calculateDaysDifference,
  calculatePastCalendarDaysDiff,
  formatDisplayPhone,
  formatRelativePaidText,
} from "@/commons/utils/format";
import { getRandomWisdomQuote } from "@/features/home-command/utils/greeting-helper";


/**
 * Calcula os 3 KPIs de triagem rápida a partir das dívidas e pagamentos recentes
 */
export function buildHomeCommandKPIs(
  debts: HomeCommandDebtRow[],
  recentPayments: RecentDebtPaymentRow[] = []
): TriageKPIs {
  let dueSoonCount = 0;
  let criticalOverdueCount = 0;

  // 1. Contabiliza parcelas pendentes
  for (const debt of debts) {
    if (debt.status === "settled" || debt.status === "cancelled") continue;

    for (const inst of debt.installments || []) {
      const nominal = Number(inst.nominal_amount);
      const paid = Number(inst.paid_amount);
      const isPaid = inst.status === "paid" || paid >= nominal;

      if (isPaid) continue;

      const { isLate, lateDays, diffDays } = calculateDaysDifference(inst.due_date);

      if (isLate && lateDays > 0) {
        if (lateDays > 30) {
          criticalOverdueCount++;
        }
      } else {
        // Vencendo hoje (diffDays === 0) ou nos próximos 7 dias
        if (diffDays <= 7) {
          dueSoonCount++;
        }
      }
    }
  }

  // 2. Pix recebidos nos últimos 7 dias (direto dos pagamentos ou parcelas quitadas)
  const recentlyPaidCount = recentPayments.length;

  return {
    dueSoonCount,
    recentlyPaidCount,
    criticalOverdueCount,
  };
}

/**
 * Constrói o Feed de ocorrências do dia priorizando:
 * 1. Parcelas Atrasadas (da mais atrasada para a menos atrasada)
 * 2. Próximos Vencimentos (do mais próximo [hoje, amanhã] até 7 dias)
 * 3. Pagamentos Recentes (hoje, ontem e últimos dias)
 */
export function buildHomeCommandFeed(
  debts: HomeCommandDebtRow[],
  excusesMap: Record<string, string> = {},
  creditorPixKey?: string,
  recentPayments: RecentDebtPaymentRow[] = []
): FeedOccurrence[] {
  const overdueItems: FeedOccurrence[] = [];
  const upcomingItems: FeedOccurrence[] = [];
  const paidItems: FeedOccurrence[] = [];

  // Mapeia os pagamentos recentes por dívida para recuperar o paid_at real
  const paymentsByDebtId = new Map<string, RecentDebtPaymentRow[]>();
  for (const pay of recentPayments) {
    const list = paymentsByDebtId.get(pay.debt_id) || [];
    list.push(pay);
    paymentsByDebtId.set(pay.debt_id, list);
  }

  for (const debt of debts) {
    if (debt.status === "settled" || debt.status === "cancelled") continue;

    const debtor = debt.debtor;
    if (!debtor) continue;

    const debtorName = debtor.name;
    const debtorNickname = debtor.nickname || undefined;
    const debtorPhone = formatDisplayPhone(debtor.phone);
    const pixKey = creditorPixKey || undefined;
    const totalInstallments = debt.installments_count || debt.installments?.length || 1;

    for (const inst of debt.installments || []) {
      const nominal = Number(inst.nominal_amount);
      const paid = Number(inst.paid_amount);
      const isPaid = inst.status === "paid" || paid >= nominal;

      const installmentText =
        totalInstallments === 1
          ? "Parcela única"
          : `Parcela ${inst.installment_number} de ${totalInstallments}`;

      const lastExcuseNote = excusesMap[inst.id] || undefined;

      // Parcela já paga recentemente (hoje, ontem ou até 2 dias de calendário no fuso de São Paulo)
      if (isPaid) {
        const debtPayments = paymentsByDebtId.get(debt.id);
        const paymentDate = debtPayments?.[0]?.paid_at || inst.updated_at;

        if (paymentDate) {
          const diffDays = calculatePastCalendarDaysDiff(paymentDate);

          if (diffDays >= 0 && diffDays <= 2) {
            paidItems.push({
              id: inst.id,
              debtId: debt.id,
              debtorName,
              debtorNickname,
              debtorPhone,
              type: "recently_paid",
              category: "paid",
              relativeTimeText: formatRelativePaidText(diffDays),
              installmentText,
              pixKey,
              lastExcuseNote,
              nominalAmount: nominal,
              paidAmount: paid,
            });
          }
        }
        continue;
      }

      // Parcela pendente: verificar status e proximidade
      const { isLate, lateDays, diffDays } = calculateDaysDifference(inst.due_date);

      if (isLate && lateDays > 0) {
        // Atrasada: prioridade máxima do Tubarão
        overdueItems.push({
          id: inst.id,
          debtId: debt.id,
          debtorName,
          debtorNickname,
          debtorPhone,
          type: "urgent_overdue",
          category: "overdue",
          lateDays,
          diffDays,
          relativeTimeText: lateDays === 1 ? "Venceu ontem" : `Venceu há ${lateDays} dias`,
          installmentText,
          pixKey,
          lastExcuseNote,
          nominalAmount: nominal,
          paidAmount: paid,
        });
      } else if (diffDays === 0) {
        // Vence Hoje
        upcomingItems.push({
          id: inst.id,
          debtId: debt.id,
          debtorName,
          debtorNickname,
          debtorPhone,
          type: "due_today",
          category: "upcoming",
          lateDays: 0,
          diffDays: 0,
          relativeTimeText: "Vence Hoje",
          installmentText,
          pixKey,
          lastExcuseNote,
          nominalAmount: nominal,
          paidAmount: paid,
        });
      } else if (diffDays > 0 && diffDays <= 7) {
        // Vence nos próximos 7 dias (alinhado com o KPI semanal)
        upcomingItems.push({
          id: inst.id,
          debtId: debt.id,
          debtorName,
          debtorNickname,
          debtorPhone,
          type: "due_soon",
          category: "upcoming",
          lateDays: 0,
          diffDays,
          relativeTimeText: diffDays === 1 ? "Vence amanhã" : `Vence em ${diffDays} dias`,
          installmentText,
          pixKey,
          lastExcuseNote,
          nominalAmount: nominal,
          paidAmount: paid,
        });
      }
    }
  }

  // 1. Parcelas atrasadas: da mais atrasada para a menos atrasada (lateDays DESC)
  overdueItems.sort((a, b) => (b.lateDays ?? 0) - (a.lateDays ?? 0));

  // 2. Próximos vencimentos: do mais próximo para frente (diffDays ASC: 0 [hoje], 1 [amanhã]...)
  upcomingItems.sort((a, b) => (a.diffDays ?? 0) - (b.diffDays ?? 0));

  // Hierarquia unificada: [Atrasadas mais críticas -> Próximos vencimentos -> Pagos]
  const combined = [...overdueItems, ...upcomingItems, ...paidItems];

  // Limite enxuto de até 10 ocorrências para visualização executiva
  return combined.slice(0, 10);
}

/**
 * Consulta e consolida os dados reais da Central de Comando do Tubarão
 */
export const getHomeCommandDataApi = async (
  userId: string,
  userName: string = "Tubarão"
): Promise<CommandCenterData> => {
  // 1. Busca dívidas com devedores e parcelas
  const debts = await getHomeCommandDebtsSupabase(userId);

  // 2. Extrai IDs das parcelas para buscar desculpas registradas
  const allInstallmentIds: string[] = [];
  let overdueCount = 0;
  let criticalCount = 0;
  let dueSoonCount = 0;
  let totalCount = 0;

  for (const debt of debts) {
    for (const inst of debt.installments || []) {
      totalCount++;
      allInstallmentIds.push(inst.id);

      const nominal = Number(inst.nominal_amount);
      const paid = Number(inst.paid_amount);
      const isPaid = inst.status === "paid" || paid >= nominal;

      if (!isPaid) {
        const { isLate, lateDays, diffDays } = calculateDaysDifference(inst.due_date);
        if (isLate && lateDays > 0) {
          overdueCount++;
          if (lateDays > 30) {
            criticalCount++;
          }
        } else if (diffDays <= 7) {
          dueSoonCount++;
        }
      }
    }
  }

  // 3. Busca desculpas das parcelas e pagamentos recentes
  const excusesMap = await getRecentExcusesByInstallmentIdsSupabase(allInstallmentIds);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentPayments = await getRecentDebtPaymentsSupabase(
    userId,
    sevenDaysAgo.toISOString()
  );

  // 4. Busca configurações de credor (Chave Pix oficial)
  const creditorSettings = await getCreditorSettingsByUserIdSupabase(userId);
  const creditorPixKey = creditorSettings?.pix_key || undefined;

  // 5. Calcula KPIs e Feed
  const kpis = buildHomeCommandKPIs(debts, recentPayments);
  const feed = buildHomeCommandFeed(debts, excusesMap, creditorPixKey, recentPayments);

  const wisdomQuote = getRandomWisdomQuote();

  return {
    userName,
    kpis,
    feed,
    totalDebtsCount: debts.length,
    creditorPixKey,
    wisdomQuote,
    counts: {
      overdueCount,
      criticalCount,
      dueSoonCount,
      totalCount,
    },
  };
};
