'use server';

import { revalidatePath } from 'next/cache';
import { getUserLoggedApi } from '@/server/account/service/auth.api';
import {
  createDebtorSchema,
  updateDebtorSchema,
  getDebtorsQuerySchema,
} from '@/commons/validations/debtor';
import {
  getDebtorsApi,
  createDebtorApi,
  updateDebtorApi,
  deleteDebtorApi,
} from '@/server/debtors/service/debtor.api';
import { presentDebtorsList, presentDebtorItem } from '@/commons/utils/format';
import type {
  CreateDebtorPayload,
  UpdateDebtorPayload,
  PaginatedDebtorsFormatted,
  DebtorItemFormatted,
} from '@/commons/models/debtor';

export type CreateDebtorActionResult = {
  success: boolean;
  data?: DebtorItemFormatted;
  error?: string;
  code?: string;
  isLimitReached?: boolean;
};

/**
 * Consulta devedores com paginação, busca e formatação antecipada no servidor
 */
export async function getDebtorsAction(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ success: boolean; data?: PaginatedDebtorsFormatted; error?: string }> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = getDebtorsQuerySchema.safeParse(params || {});
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Parâmetros de consulta inválidos.',
      };
    }

    const result = await getDebtorsApi({
      userId,
      page: validation.data.page,
      limit: validation.data.limit,
      search: validation.data.search,
    });

    const formattedData: PaginatedDebtorsFormatted = {
      items: presentDebtorsList(result.items),
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
      totalCount: result.totalCount,
    };

    return { success: true, data: formattedData };
  } catch (error) {
    console.error('[getDebtorsAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao carregar os devedores.' };
  }
}

/**
 * Cadastra um novo devedor no tanque com validação de limite de plano e formatação antecipada
 */
export async function createDebtorAction(
  rawData: unknown
): Promise<CreateDebtorActionResult> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = createDebtorSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos no formulário.',
      };
    }

    const payload: CreateDebtorPayload = {
      name: validation.data.name,
      nickname: validation.data.nickname || null,
      relationship: validation.data.relationship,
      phone: validation.data.phone,
      document: validation.data.document || null,
      address: validation.data.address || null,
      pix_key: validation.data.pix_key || null,
      pix_key_type: validation.data.pix_key_type || null,
      notes: validation.data.notes || null,
    };

    const res = await createDebtorApi(userId, payload);

    if (res.error === 'LIMIT_REACHED') {
      return {
        success: false,
        code: 'LIMIT_REACHED',
        isLimitReached: true,
        error: res.message || 'Limite de devedores atingido no seu plano atual.',
      };
    }

    if (res.error || !res.data) {
      return { success: false, error: res.message || 'Falha ao cadastrar devedor.' };
    }

    revalidatePath('/painel/devedores');
    revalidatePath('/painel/dividas/nova');
    revalidatePath('/painel');

    return { success: true, data: presentDebtorItem(res.data) };
  } catch (error) {
    console.error('[createDebtorAction] Erro inesperado:', error);
    return { success: false, error: 'Erro inesperado ao cadastrar devedor.' };
  }
}

/**
 * Atualiza um devedor existente
 */
export async function updateDebtorAction(
  id: string,
  rawData: unknown
): Promise<{ success: boolean; data?: DebtorItemFormatted; error?: string }> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = updateDebtorSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos.',
      };
    }

    const payload: UpdateDebtorPayload = {
      name: validation.data.name,
      nickname: validation.data.nickname || null,
      relationship: validation.data.relationship,
      phone: validation.data.phone,
      document: validation.data.document || null,
      address: validation.data.address || null,
      pix_key: validation.data.pix_key || null,
      pix_key_type: validation.data.pix_key_type || null,
      notes: validation.data.notes || null,
      is_archived: validation.data.is_archived,
    };

    const res = await updateDebtorApi(id, userId, payload);

    if (res.error || !res.data) {
      return { success: false, error: res.message || 'Falha ao atualizar devedor.' };
    }

    revalidatePath('/painel/devedores');
    revalidatePath('/painel');

    return { success: true, data: presentDebtorItem(res.data) };
  } catch (error) {
    console.error('[updateDebtorAction] Erro inesperado:', error);
    return { success: false, error: 'Erro inesperado ao atualizar devedor.' };
  }
}

/**
 * Remove um devedor
 */
export async function deleteDebtorAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const res = await deleteDebtorApi(id, userId);

    if (res.error) {
      return { success: false, error: res.message || 'Falha ao excluir devedor.' };
    }

    revalidatePath('/painel/devedores');
    revalidatePath('/painel');

    return { success: true };
  } catch (error) {
    console.error('[deleteDebtorAction] Erro inesperado:', error);
    return { success: false, error: 'Erro inesperado ao excluir devedor.' };
  }
}

