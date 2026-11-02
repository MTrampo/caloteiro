import "server-only";

import { internalSupabase } from "@/commons/lib/supabase/internal";
import type { DebtorItem } from "@/commons/models/debtor";
import type { Database } from "@/commons/types/database.types";
import { decryptSensitiveData } from "@/server/account/service/encryption.api";

type DebtRow = Database["public"]["Tables"]["debts"]["Row"];
type InstallmentRow = Database["public"]["Tables"]["installments"]["Row"];
type DebtPaymentRow = Database["public"]["Tables"]["debt_payments"]["Row"];
type DebtExcuseRow = Database["public"]["Tables"]["debt_excuses"]["Row"];

export interface DebtorRelationalRiskBundle {
  debtor: DebtorItem;
  debts: DebtRow[];
  installments: InstallmentRow[];
  payments: DebtPaymentRow[];
  excuses: DebtExcuseRow[];
  creditorPixKey: string | null;
}

export interface BatchDebtorsRelationalRiskBundle {
  debtors: DebtorItem[];
  debts: DebtRow[];
  installments: InstallmentRow[];
  payments: DebtPaymentRow[];
  excuses: DebtExcuseRow[];
  creditorPixKey: string | null;
}

/**
 * Carrega todos os dados relacionais necessários para o Raio-X e Score de um único devedor
 */
export const getDebtorRiskContextByIdSupabase = async (
  debtorId: string,
  userId: string
): Promise<DebtorRelationalRiskBundle | null> => {
  const supabase = internalSupabase();

  const [debtorRes, debtsRes, installmentsRes, paymentsRes, excusesRes, settingsRes] =
    await Promise.all([
      supabase
        .from("debtors")
        .select("*")
        .eq("id", debtorId)
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("debts")
        .select("*")
        .eq("debtor_id", debtorId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("installments")
        .select("*")
        .eq("debtor_id", debtorId)
        .eq("user_id", userId)
        .order("installment_number", { ascending: true }),
      supabase
        .from("debt_payments")
        .select("*")
        .eq("debtor_id", debtorId)
        .eq("user_id", userId)
        .order("paid_at", { ascending: false }),
      supabase
        .from("debt_excuses")
        .select("*")
        .eq("debtor_id", debtorId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("creditor_settings")
        .select("pix_key")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  if (debtorRes.error || !debtorRes.data) {
    return null;
  }

  const rawDebtor = debtorRes.data as DebtorItem;
  const debtor: DebtorItem = {
    ...rawDebtor,
    document: decryptSensitiveData(rawDebtor.document),
    pix_key: decryptSensitiveData(rawDebtor.pix_key),
  };

  return {
    debtor,
    debts: (debtsRes.data as DebtRow[]) || [],
    installments: (installmentsRes.data as InstallmentRow[]) || [],
    payments: (paymentsRes.data as DebtPaymentRow[]) || [],
    excuses: (excusesRes.data as DebtExcuseRow[]) || [],
    creditorPixKey: decryptSensitiveData(settingsRes.data?.pix_key) || null,
  };
};

/**
 * Carrega em lote (Zero N+1) os dados relacionais de todos os devedores (ou de uma lista de IDs) do Tubarão
 */
export const getBatchDebtorsRiskContextSupabase = async (
  userId: string,
  debtorIds?: string[]
): Promise<BatchDebtorsRelationalRiskBundle> => {
  const supabase = internalSupabase();

  let debtorsQuery = supabase
    .from("debtors")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  let debtsQuery = supabase.from("debts").select("*").eq("user_id", userId);
  let installmentsQuery = supabase.from("installments").select("*").eq("user_id", userId);
  let paymentsQuery = supabase.from("debt_payments").select("*").eq("user_id", userId);
  let excusesQuery = supabase.from("debt_excuses").select("*").eq("user_id", userId);

  if (debtorIds && debtorIds.length > 0) {
    debtorsQuery = debtorsQuery.in("id", debtorIds);
    debtsQuery = debtsQuery.in("debtor_id", debtorIds);
    installmentsQuery = installmentsQuery.in("debtor_id", debtorIds);
    paymentsQuery = paymentsQuery.in("debtor_id", debtorIds);
    excusesQuery = excusesQuery.in("debtor_id", debtorIds);
  }

  const [debtorsRes, debtsRes, installmentsRes, paymentsRes, excusesRes, settingsRes] =
    await Promise.all([
      debtorsQuery,
      debtsQuery,
      installmentsQuery,
      paymentsQuery,
      excusesQuery,
      supabase
        .from("creditor_settings")
        .select("pix_key")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  const rawDebtors = (debtorsRes.data as DebtorItem[]) || [];
  const debtors = rawDebtors.map((d) => ({
    ...d,
    document: decryptSensitiveData(d.document),
    pix_key: decryptSensitiveData(d.pix_key),
  }));

  return {
    debtors,
    debts: (debtsRes.data as DebtRow[]) || [],
    installments: (installmentsRes.data as InstallmentRow[]) || [],
    payments: (paymentsRes.data as DebtPaymentRow[]) || [],
    excuses: (excusesRes.data as DebtExcuseRow[]) || [],
    creditorPixKey: decryptSensitiveData(settingsRes.data?.pix_key) || null,
  };
};
