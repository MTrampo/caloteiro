import "server-only";

import { serverSupabase } from "@/commons/lib/supabase/server";
import type {
  DebtorItem,
  DebtorUpdate,
  CreateDebtorPayload,
  UpdateDebtorPayload,
  GetDebtorsParams,
  PaginatedDebtors,
} from "@/commons/models/debtor";

/**
 * Consulta devedores paginados com suporte a termo de busca
 */
export const getDebtorsPaginatedSupabase = async (
  params: GetDebtorsParams
): Promise<PaginatedDebtors> => {
  const { userId, page = 1, limit = 12, search } = params;
  const supabase = await serverSupabase();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("debtors")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(
      `name.ilike.%${term}%,nickname.ilike.%${term}%,phone.ilike.%${term}%,document.ilike.%${term}%`
    );
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[getDebtorsPaginatedSupabase] Erro ao buscar devedores:", error);
    return {
      items: [],
      page,
      limit,
      hasMore: false,
      totalCount: 0,
    };
  }

  const items = (data as DebtorItem[]) || [];
  const totalCount = count || 0;
  const hasMore = from + items.length < totalCount;

  return {
    items,
    page,
    limit,
    hasMore,
    totalCount,
  };
};

/**
 * Busca devedor por ID garantindo isolamento por userId
 */
export const getDebtorByIdSupabase = async (
  id: string,
  userId: string
): Promise<DebtorItem | null> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debtors")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as DebtorItem;
};

/**
 * Insere um novo devedor vinculado ao userId
 */
export const createDebtorSupabase = async (
  userId: string,
  payload: CreateDebtorPayload
): Promise<{ data: DebtorItem | null; error: string | null }> => {
  const supabase = await serverSupabase();

  const { data, error } = await supabase
    .from("debtors")
    .insert({
      user_id: userId,
      name: payload.name,
      nickname: payload.nickname || null,
      relationship: payload.relationship,
      document: payload.document || null,
      address: payload.address || null,
      phone: payload.phone,
      pix_key: payload.pix_key || null,
      pix_key_type: payload.pix_key_type || null,
      notes: payload.notes || null,
      is_archived: false,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[createDebtorSupabase] Erro ao criar devedor:", error);
    return { data: null, error: error.message };
  }

  return { data: data as DebtorItem, error: null };
};

/**
 * Atualiza os dados de um devedor existente
 */
export const updateDebtorSupabase = async (
  id: string,
  userId: string,
  payload: UpdateDebtorPayload
): Promise<{ data: DebtorItem | null; error: string | null }> => {
  const supabase = await serverSupabase();

  const updateData: DebtorUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.nickname !== undefined) updateData.nickname = payload.nickname;
  if (payload.relationship !== undefined) updateData.relationship = payload.relationship;
  if (payload.document !== undefined) updateData.document = payload.document;
  if (payload.address !== undefined) updateData.address = payload.address;
  if (payload.phone !== undefined) updateData.phone = payload.phone;
  if (payload.pix_key !== undefined) updateData.pix_key = payload.pix_key;
  if (payload.pix_key_type !== undefined) updateData.pix_key_type = payload.pix_key_type;
  if (payload.notes !== undefined) updateData.notes = payload.notes;
  if (payload.is_archived !== undefined) updateData.is_archived = payload.is_archived;

  const { data, error } = await supabase
    .from("debtors")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    console.error("[updateDebtorSupabase] Erro ao atualizar devedor:", error);
    return { data: null, error: error.message };
  }

  return { data: data as DebtorItem, error: null };
};

/**
 * Remove fisicamente ou arquiva um devedor
 */
export const deleteDebtorSupabase = async (
  id: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> => {
  const supabase = await serverSupabase();

  const { error } = await supabase
    .from("debtors")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[deleteDebtorSupabase] Erro ao deletar devedor:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Retorna o número total de devedores ativos (não arquivados) de um usuário
 */
export const countDebtorsByUserIdSupabase = async (
  userId: string
): Promise<number> => {
  const supabase = await serverSupabase();
  const { count, error } = await supabase
    .from("debtors")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_archived", false);

  if (error) {
    console.error("[countDebtorsByUserIdSupabase] Erro ao contar devedores:", error);
    return 0;
  }

  return count || 0;
};

/**
 * Retorna o número de dívidas ativas vinculadas a um devedor específico
 */
export const countActiveDebtsByDebtorIdSupabase = async (
  debtorId: string,
  userId: string
): Promise<number> => {
  const supabase = await serverSupabase();
  const { count, error } = await supabase
    .from("debts")
    .select("*", { count: "exact", head: true })
    .eq("debtor_id", debtorId)
    .eq("user_id", userId)
    .neq("status", "settled");

  if (error) {
    console.error("[countActiveDebtsByDebtorIdSupabase] Erro ao contar dívidas ativas:", error);
    return 0;
  }

  return count || 0;
};


