import "server-only";

import { serverSupabase } from "@/commons/lib/supabase/server";
import { internalSupabase } from "@/commons/lib/supabase/internal";
import type {
  DebtRow,
  InstallmentRow,
  InstallmentInsert,
  InstallmentUpdate,
  DebtPaymentRow,
  DebtPaymentInsert,
  DebtExcuseRow,
  DebtExcuseInsert,
  CreateDebtPayload,
  UpdateDebtAgreementRulesPayload,
  DebtStatus,
} from "@/commons/models/debt";

/**
 * Cria a dívida principal (acordo/contrato)
 */
export const createDebtSupabase = async (
  userId: string,
  payload: CreateDebtPayload & { public_access_code?: string; public_link_enabled?: boolean }
): Promise<{ data: DebtRow | null; error: string | null }> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: userId,
      debtor_id: payload.debtor_id,
      title: payload.title,
      category: payload.category || "personal_loan",
      original_amount: payload.original_amount,
      installments_count: payload.installments_count,
      payment_method: payload.payment_method || "pix",
      loan_date: payload.loan_date || new Date().toISOString().split("T")[0],
      first_due_date: payload.first_due_date,
      interest_type: payload.interest_type || "none",
      interest_rate: payload.interest_rate || 0,
      total_amount: payload.total_amount || payload.original_amount,
      notes: payload.notes || null,
      max_late_installments: payload.max_late_installments ?? null,
      show_notes_on_invoice: payload.show_notes_on_invoice ?? false,
      status: "pending",
      public_link_enabled: payload.public_link_enabled ?? false,
      ...(payload.public_access_code ? { public_access_code: payload.public_access_code } : {}),
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[createDebtSupabase] Erro ao criar dívida:", error);
    return { data: null, error: error?.message || "Erro ao salvar contrato de dívida." };
  }

  return { data: data as DebtRow, error: null };
};

/**
 * Insere em lote as parcelas calculadas do cronograma
 */
export const createInstallmentsSupabase = async (
  installments: InstallmentInsert[]
): Promise<{ data: InstallmentRow[] | null; error: string | null }> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("installments")
    .insert(installments)
    .select("*");

  if (error || !data) {
    console.error("[createInstallmentsSupabase] Erro ao criar parcelas:", error);
    return { data: null, error: error?.message || "Erro ao gerar parcelas." };
  }

  return { data: data as InstallmentRow[], error: null };
};

/**
 * Busca uma dívida por ID com isolamento por usuário
 */
export const getDebtByIdSupabase = async (
  debtId: string,
  userId: string
): Promise<DebtRow | null> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("id", debtId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as DebtRow;
};

/**
 * Busca parcelas de uma dívida ordenadas pelo número da parcela
 */
export const getInstallmentsByDebtIdSupabase = async (
  debtId: string,
  userId: string
): Promise<InstallmentRow[]> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("installments")
    .select("*")
    .eq("debt_id", debtId)
    .eq("user_id", userId)
    .order("installment_number", { ascending: true });

  if (error || !data) {
    console.error("[getInstallmentsByDebtIdSupabase] Erro ao buscar parcelas:", error);
    return [];
  }

  return data as InstallmentRow[];
};

/**
 * Busca uma parcela específica por ID
 */
export const getInstallmentByIdSupabase = async (
  installmentId: string,
  userId: string
): Promise<InstallmentRow | null> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("installments")
    .select("*")
    .eq("id", installmentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as InstallmentRow;
};

/**
 * Atualiza valores e status de uma parcela
 */
export const updateInstallmentSupabase = async (
  installmentId: string,
  userId: string,
  updateData: InstallmentUpdate
): Promise<{ success: boolean; error: string | null }> => {
  const supabase = await serverSupabase();

  const { error } = await supabase
    .from("installments")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", installmentId)
    .eq("user_id", userId);

  if (error) {
    console.error("[updateInstallmentSupabase] Erro ao atualizar parcela:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Atualiza o status geral da dívida (ex: settled quando todas as parcelas são quitadas)
 */
export const updateDebtStatusSupabase = async (
  debtId: string,
  userId: string,
  status: DebtStatus,
  settledAt?: string | null
): Promise<{ success: boolean; error: string | null }> => {
  const supabase = await serverSupabase();

  const { error } = await supabase
    .from("debts")
    .update({
      status,
      settled_at: settledAt || (status === "settled" ? new Date().toISOString() : null),
      updated_at: new Date().toISOString(),
    })
    .eq("id", debtId)
    .eq("user_id", userId);

  if (error) {
    console.error("[updateDebtStatusSupabase] Erro ao atualizar status da dívida:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Registra um pagamento (Pix recebido)
 */
export const createPaymentSupabase = async (
  payload: DebtPaymentInsert
): Promise<{ data: DebtPaymentRow | null; error: string | null }> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debt_payments")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[createPaymentSupabase] Erro ao registrar pagamento:", error);
    return { data: null, error: error?.message || "Erro ao registrar Pix." };
  }

  return { data: data as DebtPaymentRow, error: null };
};

/**
 * Busca histórico de pagamentos de uma dívida
 */
export const getPaymentsByDebtIdSupabase = async (
  debtId: string,
  userId: string
): Promise<DebtPaymentRow[]> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debt_payments")
    .select("*")
    .eq("debt_id", debtId)
    .eq("user_id", userId)
    .order("paid_at", { ascending: false });

  if (error || !data) {
    console.error("[getPaymentsByDebtIdSupabase] Erro ao buscar pagamentos:", error);
    return [];
  }

  return data as DebtPaymentRow[];
};

/**
 * Registra uma desculpa/caô para uma parcela
 */
export const createExcuseSupabase = async (
  payload: DebtExcuseInsert
): Promise<{ data: DebtExcuseRow | null; error: string | null }> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debt_excuses")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[createExcuseSupabase] Erro ao registrar desculpa:", error);
    return { data: null, error: error?.message || "Erro ao anotar caô." };
  }

  return { data: data as DebtExcuseRow, error: null };
};

/**
 * Busca desculpas vinculadas a parcelas
 */
export const getExcusesByInstallmentIdsSupabase = async (
  installmentIds: string[]
): Promise<DebtExcuseRow[]> => {
  if (installmentIds.length === 0) return [];
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debt_excuses")
    .select("*")
    .in("installment_id", installmentIds)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[getExcusesByInstallmentIdsSupabase] Erro ao buscar caôs:", error);
    return [];
  }

  return data as DebtExcuseRow[];
};

/**
 * Busca todas as dívidas de um usuário
 */
export const getDebtsByUserIdSupabase = async (
  userId: string
): Promise<DebtRow[]> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[getDebtsByUserIdSupabase] Erro ao buscar dívidas:", error);
    return [];
  }

  return data as DebtRow[];
};

/**
 * Conta as dívidas ativas (não quitadas) de um usuário para travas de plano
 */
export const countActiveDebtsByUserIdSupabase = async (
  userId: string
): Promise<number> => {
  const supabase = await serverSupabase();

  const { count, error } = await supabase
    .from("debts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .neq("status", "settled");

  if (error) {
    console.error("[countActiveDebtsByUserIdSupabase] Erro ao contar dívidas ativas:", error);
    return 0;
  }

  return count || 0;
};

/**
 * Atualiza a configuração do link público e código de acesso de uma dívida
 */
export const updateDebtPortalConfigSupabase = async (payload: {
  debtId: string;
  userId: string;
  publicLinkEnabled: boolean;
  publicAccessCode: string;
}): Promise<{ data: DebtRow | null; error: string | null }> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debts")
    .update({
      public_link_enabled: payload.publicLinkEnabled,
      public_access_code: payload.publicAccessCode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.debtId)
    .eq("user_id", payload.userId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[updateDebtPortalConfigSupabase] Erro ao atualizar link da fatura:", error);
    return { data: null, error: error?.message || "Erro ao atualizar configuração da fatura." };
  }

  return { data: data as DebtRow, error: null };
};

/**
 * Atualiza as cláusulas/regras do acordo (notes), o gatilho de tolerância (max_late_installments) e visibilidade na fatura
 */
export const updateDebtAgreementRulesSupabase = async (
  payload: UpdateDebtAgreementRulesPayload
): Promise<{ data: DebtRow | null; error: string | null }> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debts")
    .update({
      notes: payload.notes,
      max_late_installments: payload.maxLateInstallments,
      show_notes_on_invoice: payload.showNotesOnInvoice,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.debtId)
    .eq("user_id", payload.userId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[updateDebtAgreementRulesSupabase] Erro ao atualizar regras do acordo:", error);
    return { data: null, error: error?.message || "Erro ao salvar regras do acordo." };
  }

  return { data: data as DebtRow, error: null };
};

/**
 * Busca os dados básicos da dívida pelo ID (para validação de portão da fatura pública)
 */
export const getPublicDebtByIdSupabase = async (
  debtId: string
): Promise<DebtRow | null> => {
  const supabase = internalSupabase();

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("id", debtId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as DebtRow;
};

/**
 * Busca os dados relacionados da fatura pública apenas após validação do código de acesso
 */
export const getPublicDebtContextByIdSupabase = async (
  debt: DebtRow
): Promise<{
  debtorName: string;
  debtorNickname: string | null;
  creditorName: string | null;
  creditorNickname: string | null;
  creditorPhone: string | null;
  pixKey: string | null;
  pixKeyType: string | null;
  pixHolderName: string | null;
  pixBankName: string | null;
  installments: InstallmentRow[];
  payments: Pick<DebtPaymentRow, "id" | "amount" | "paid_at" | "created_at">[];
} | null> => {
  const supabase = internalSupabase();

  const [debtorRes, profileRes, settingsRes, installmentsRes, paymentsRes] =
    await Promise.all([
      supabase
        .from("debtors")
        .select("name, nickname")
        .eq("id", debt.debtor_id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("name, nickname, phone")
        .eq("id", debt.user_id)
        .maybeSingle(),
      supabase
        .from("creditor_settings")
        .select("pix_key, pix_key_type, pix_holder_name, pix_bank_name")
        .eq("user_id", debt.user_id)
        .maybeSingle(),
      supabase
        .from("installments")
        .select("*")
        .eq("debt_id", debt.id)
        .order("installment_number", { ascending: true }),
      supabase
        .from("debt_payments")
        .select("id, amount, paid_at, created_at")
        .eq("debt_id", debt.id)
        .order("paid_at", { ascending: false }),
    ]);

  if (debtorRes.error || !debtorRes.data) {
    return null;
  }

  return {
    debtorName: debtorRes.data.name,
    debtorNickname: debtorRes.data.nickname,
    creditorName: profileRes.data?.name || null,
    creditorNickname: profileRes.data?.nickname || null,
    creditorPhone: profileRes.data?.phone || null,
    pixKey: settingsRes.data?.pix_key || null,
    pixKeyType: settingsRes.data?.pix_key_type || null,
    pixHolderName: settingsRes.data?.pix_holder_name || null,
    pixBankName: settingsRes.data?.pix_bank_name || null,
    installments: (installmentsRes.data as InstallmentRow[]) || [],
    payments: paymentsRes.data || [],
  };
};

