import "server-only";

import { serverSupabase } from "@/commons/lib/supabase/server";
import type { DebtRow, InstallmentRow } from "@/commons/models/debt";
import type { DebtorRow } from "@/commons/models/debtor";

export interface HomeCommandDebtRow extends DebtRow {
  debtor: DebtorRow | null;
  installments: InstallmentRow[];
}

export interface RecentDebtPaymentRow {
  id: string;
  debt_id: string;
  debtor_id: string;
  amount: number;
  notes: string | null;
  paid_at: string;
}

export interface InstallmentExcuseRow {
  installment_id: string;
  excuse_text: string;
  promised_date: string;
  created_at: string;
}

/**
 * Busca todas as dívidas ativas com devedores e parcelas do Tubarão
 */
export const getHomeCommandDebtsSupabase = async (
  userId: string
): Promise<HomeCommandDebtRow[]> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debts")
    .select(`
      *,
      debtor:debtors(*),
      installments(*)
    `)
    .eq("user_id", userId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[getHomeCommandDebtsSupabase] Erro ao buscar dívidas:", error);
    return [];
  }

  return data as unknown as HomeCommandDebtRow[];
};

/**
 * Busca as desculpas mais recentes vinculadas a uma lista de parcelas
 */
export const getRecentExcusesByInstallmentIdsSupabase = async (
  installmentIds: string[]
): Promise<Record<string, string>> => {
  if (installmentIds.length === 0) return {};
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debt_excuses")
    .select("installment_id, excuse_text, created_at")
    .in("installment_id", installmentIds)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {};
  }

  const excusesMap: Record<string, string> = {};
  for (const item of data) {
    // Guarda apenas a mais recente por parcela
    if (!excusesMap[item.installment_id]) {
      excusesMap[item.installment_id] = item.excuse_text;
    }
  }

  return excusesMap;
};

/**
 * Busca os pagamentos de dívidas realizados nos últimos 7 dias
 */
export const getRecentDebtPaymentsSupabase = async (
  userId: string,
  sinceDateIso: string
): Promise<RecentDebtPaymentRow[]> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debt_payments")
    .select("id, debt_id, debtor_id, amount, notes, paid_at")
    .eq("user_id", userId)
    .gte("paid_at", sinceDateIso)
    .order("paid_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as unknown as RecentDebtPaymentRow[];
};
