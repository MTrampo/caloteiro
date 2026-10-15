import "server-only";

import { serverSupabase } from "@/commons/lib/supabase/server";
import type { DebtRow, InstallmentRow } from "@/commons/models/debt";
import type { DebtorRow } from "@/commons/models/debtor";

export interface DebtWithRelationsRow extends DebtRow {
  debtor: DebtorRow | null;
  installments: InstallmentRow[];
}

/**
 * Busca todas as dívidas ativas (e recentemente quitadas se necessário)
 * com devedores e parcelas vinculadas para o Tubarão autenticado.
 */
export const getActiveDebtsWithRelationsSupabase = async (
  userId: string
): Promise<DebtWithRelationsRow[]> => {
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
    console.error("[getActiveDebtsWithRelationsSupabase] Erro ao buscar dados:", error);
    return [];
  }

  return data as unknown as DebtWithRelationsRow[];
};

/**
 * Busca os IDs de parcelas com desculpas/caôs registradas
 */
export const getInstallmentIdsWithExcusesSupabase = async (
  installmentIds: string[]
): Promise<Set<string>> => {
  if (installmentIds.length === 0) return new Set();
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debt_excuses")
    .select("installment_id")
    .in("installment_id", installmentIds);

  if (error || !data) {
    return new Set();
  }

  return new Set(data.map((item) => item.installment_id));
};

