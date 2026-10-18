import "server-only";

import { ApiResponse } from "@/commons/lib/http/responses";
import { formatProperName } from "@/commons/utils/format";
import type {
  CreateDebtorPayload,
  UpdateDebtorPayload,
  GetDebtorsParams,
  PaginatedDebtors,
  DebtorItem,
} from "@/commons/models/debtor";
import type { ResponseProps } from "@/commons/models/api";
import {
  getDebtorsPaginatedSupabase,
  getDebtorByIdSupabase,
  createDebtorSupabase,
  updateDebtorSupabase,
  deleteDebtorSupabase,
  countDebtorsByUserIdSupabase,
} from "../repository/debtor.supabase";
import { getUserPermissionsOrCacheApi } from "@/server/account/service/subscription.api";


/**
 * Sanitiza telefone mantendo apenas números
 */
function sanitizeDigits(val?: string | null): string {
  if (!val) return "";
  return val.replace(/\D/g, "");
}

/**
 * Consulta devedores com paginação e busca
 */
export const getDebtorsApi = async (
  params: GetDebtorsParams
): Promise<PaginatedDebtors> => {
  return await getDebtorsPaginatedSupabase(params);
};

/**
 * Busca detalhada de um devedor
 */
export const getDebtorByIdApi = async (
  id: string,
  userId: string
): Promise<ResponseProps<DebtorItem>> => {
  const debtor = await getDebtorByIdSupabase(id, userId);
  if (!debtor) {
    return ApiResponse.NotFound({
      message: "Devedor não encontrado ou não pertence a este Tubarão.",
    });
  }

  return ApiResponse.Ok({
    data: debtor,
    message: "Devedor localizado com sucesso.",
  });
};

/**
 * Cadastra um novo devedor aplicando sanitizações
 */
export const createDebtorApi = async (
  userId: string,
  payload: CreateDebtorPayload
): Promise<ResponseProps<DebtorItem>> => {
  // 1. Verificação de trava do plano (Zero Trust)
  const permissions = await getUserPermissionsOrCacheApi(userId);
  if (permissions.maxDebtors !== null) {
    const currentCount = await countDebtorsByUserIdSupabase(userId);
    if (currentCount >= permissions.maxDebtors) {
      return ApiResponse.Forbidden({
        message: `Sua gruta encheu! Seu plano permite manter até ${permissions.maxDebtors} ${
          permissions.maxDebtors === 1 ? "presa marcada" : "presas marcadas"
        } simultaneamente. Chega de amadorismo, hora de evoluir para o próximo nível de Tubarão!`,
        error: "LIMIT_REACHED",
      });
    }
  }

  // 2. Sanitizações de dados para persistência limpa
  const cleanPhone = sanitizeDigits(payload.phone);
  if (!cleanPhone || cleanPhone.length < 8) {
    return ApiResponse.BadRequest({
      message: "Número de telefone inválido. Informe o DDD e os dígitos.",
    });
  }

  const cleanDocument = payload.document ? sanitizeDigits(payload.document) : null;

  const sanitizedPayload: CreateDebtorPayload = {
    name: formatProperName(payload.name),
    nickname: payload.nickname?.trim() ? formatProperName(payload.nickname) : null,
    relationship: payload.relationship,
    phone: cleanPhone,
    document: cleanDocument || null,
    address: payload.address?.trim() || null,
    pix_key: payload.pix_key?.trim() || null,
    pix_key_type: payload.pix_key_type?.trim() || null,
    notes: payload.notes?.trim() || null,
  };

  const { data, error } = await createDebtorSupabase(userId, sanitizedPayload);

  if (error || !data) {
    return ApiResponse.BadRequest({
      message: "Não foi possível cadastrar o devedor no momento.",
      error: error || undefined,
    });
  }

  return ApiResponse.Created({
    data,
    message: "Devedor cadastrado com sucesso!",
  });
};

/**
 * Atualiza um devedor
 */
export const updateDebtorApi = async (
  id: string,
  userId: string,
  payload: UpdateDebtorPayload
): Promise<ResponseProps<DebtorItem>> => {
  const sanitizedPayload: UpdateDebtorPayload = {
    ...payload,
    name: payload.name ? formatProperName(payload.name) : undefined,
    nickname: payload.nickname !== undefined ? (payload.nickname?.trim() ? formatProperName(payload.nickname) : null) : undefined,
    phone: payload.phone ? sanitizeDigits(payload.phone) : undefined,
    document: payload.document !== undefined ? (payload.document ? sanitizeDigits(payload.document) : null) : undefined,
    address: payload.address !== undefined ? (payload.address?.trim() || null) : undefined,
    pix_key: payload.pix_key !== undefined ? (payload.pix_key?.trim() || null) : undefined,
    pix_key_type: payload.pix_key_type !== undefined ? (payload.pix_key_type?.trim() || null) : undefined,
    notes: payload.notes !== undefined ? (payload.notes?.trim() || null) : undefined,
  };

  const { data, error } = await updateDebtorSupabase(id, userId, sanitizedPayload);

  if (error || !data) {
    return ApiResponse.BadRequest({
      message: "Não foi possível atualizar os dados do devedor.",
      error: error || undefined,
    });
  }

  return ApiResponse.Ok({
    data,
    message: "Dados do devedor atualizados com sucesso.",
  });
};

/**
 * Remove um devedor
 */
export const deleteDebtorApi = async (id: string, userId: string) => {
  const { success, error } = await deleteDebtorSupabase(id, userId);

  if (!success) {
    return ApiResponse.BadRequest({
      message: "Não foi possível remover este devedor.",
      error: error || undefined,
    });
  }

  return ApiResponse.Ok({
    data: true,
    message: "Devedor removido do tanque.",
  });
};
