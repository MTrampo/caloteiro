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
  FeedItemType,
  TriageKPIs,
} from "@/commons/models/home-command";
import {
  calculateDaysDifference,
  formatDisplayPhone,
} from "@/commons/utils/format";
import { getRandomWisdomQuote } from "@/features/home-command/utils/greeting-helper";

interface FeedCandidate {
  item: FeedOccurrence;
  priority: number; // 1: urgent_overdue, 2: due_today, 3: due_soon, 4: recently_paid
  orderWeight: number;
}

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
 * Constrói o Feed de ocorrências do dia priorizando urgências e ações imediatas
 */
export function buildHomeCommandFeed(
  debts: HomeCommandDebtRow[],
  excusesMap: Record<string, string> = {},
  creditorPixKey?: string
): FeedOccurrence[] {
  const candidates: FeedCandidate[] = [];

  for (const debt of debts) {
    const debtor = debt.debtor;
    if (!debtor) continue;

    const debtorName = debtor.name;
    const debtorNickname = debtor.nickname || undefined;
    const debtorPhone = formatDisplayPhone(debtor.phone);
    const pixKey = creditorPixKey || debtor.pix_key || undefined;
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

      // Parcela já paga recentemente (últimas 48 horas baseadas na data de atualização)
      if (isPaid) {
        const updatedTime = inst.updated_at ? new Date(inst.updated_at).getTime() : 0;
        const nowTime = Date.now();
        const diffHours = (nowTime - updatedTime) / (1000 * 60 * 60);

        if (diffHours >= 0 && diffHours <= 48) {
          candidates.push({
            priority: 4,
            orderWeight: diffHours,
            item: {
              id: inst.id,
              debtId: debt.id,
              debtorName,
              debtorNickname,
              debtorPhone,
              type: "recently_paid",
              relativeTimeText: diffHours <= 24 ? "Pagou hoje" : "Pagou ontem",
              installmentText,
              pixKey,
              lastExcuseNote,
              nominalAmount: nominal,
              paidAmount: paid,
            },
          });
        }
        continue;
      }

      // Parcela pendente: verificar status e proximidade
      const { isLate, lateDays, diffDays } = calculateDaysDifference(inst.due_date);

      if (isLate && lateDays > 0) {
        // Atrasada
        candidates.push({
          priority: 1,
          orderWeight: -lateDays, // As mais atrasadas têm maior prioridade
          item: {
            id: inst.id,
            debtId: debt.id,
            debtorName,
            debtorNickname,
            debtorPhone,
            type: "urgent_overdue",
            relativeTimeText: lateDays === 1 ? "Venceu ontem" : `Venceu há ${lateDays} dias`,
            installmentText,
            pixKey,
            lastExcuseNote,
            nominalAmount: nominal,
            paidAmount: paid,
          },
        });
      } else if (diffDays === 0) {
        // Vence Hoje
        candidates.push({
          priority: 2,
          orderWeight: 0,
          item: {
            id: inst.id,
            debtId: debt.id,
            debtorName,
            debtorNickname,
            debtorPhone,
            type: "due_today",
            relativeTimeText: "Vence Hoje",
            installmentText,
            pixKey,
            lastExcuseNote,
            nominalAmount: nominal,
            paidAmount: paid,
          },
        });
      } else if (diffDays > 0 && diffDays <= 3) {
        // Vence nos próximos 3 dias
        candidates.push({
          priority: 3,
          orderWeight: diffDays, // 1 dia na frente de 2 dias
          item: {
            id: inst.id,
            debtId: debt.id,
            debtorName,
            debtorNickname,
            debtorPhone,
            type: "due_soon",
            relativeTimeText: diffDays === 1 ? "Vence amanhã" : `Vence em ${diffDays} dias`,
            installmentText,
            pixKey,
            lastExcuseNote,
            nominalAmount: nominal,
            paidAmount: paid,
          },
        });
      }
    }
  }

  // Ordena por prioridade de urgência e peso
  candidates.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.orderWeight - b.orderWeight;
  });

  // Limite enxuto de até 8 itens para visualização executiva do dia
  return candidates.slice(0, 8).map((c) => c.item);
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
  const feed = buildHomeCommandFeed(debts, excusesMap, creditorPixKey);

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
