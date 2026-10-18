import "server-only";

import { serverSupabase } from "@/commons/lib/supabase/server";
import type { DebtRow, InstallmentRow, DebtPaymentRow } from "@/commons/models/debt";
import type { DebtorRow } from "@/commons/models/debtor";

export interface FinancialDebtWithRelationsRow extends DebtRow {
  debtor: DebtorRow | null;
  installments: InstallmentRow[];
}

/**
 * Consulta todas as dívidas do usuário com parcelas e devedor para a inteligência financeira.
 */
export const getFinancialDebtsWithRelationsSupabase = async (
  userId: string
): Promise<FinancialDebtWithRelationsRow[]> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debts")
    .select(`
      *,
      debtor:debtors(*),
      installments(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[getFinancialDebtsWithRelationsSupabase] Erro ao buscar dados:", error);
    return [];
  }

  return data as unknown as FinancialDebtWithRelationsRow[];
};

/**
 * Consulta todos os pagamentos (amortizações) registrados pelo usuário para análise de eficiência.
 */
export const getFinancialPaymentsSupabase = async (
  userId: string,
  startDate?: string
): Promise<DebtPaymentRow[]> => {
  const supabase = await serverSupabase();

  let query = supabase
    .from("debt_payments")
    .select("*")
    .eq("user_id", userId)
    .order("paid_at", { ascending: true });

  if (startDate) {
    query = query.gte("paid_at", startDate);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("[getFinancialPaymentsSupabase] Erro ao buscar pagamentos:", error);
    return [];
  }

  return data as unknown as DebtPaymentRow[];
};

/**
 * Consulta a chave Pix configurada pelo credor/Tubarão (se houver).
 */
export const getCreditorPixKeySupabase = async (
  userId: string
): Promise<string | undefined> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("creditor_settings")
    .select("pix_key")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.pix_key) {
    return undefined;
  }

  return data.pix_key;
};

