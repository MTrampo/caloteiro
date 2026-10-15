'use server';

import { getUserLoggedApi } from '@/server/account/service/auth.api';
import { getPromisesQuerySchema } from '@/commons/validations/acompanhamento';
import { getAcompanhamentoDataApi } from '@/server/debts/service/acompanhamento.api';
import type {
  PaginatedPromisesResult,
  AcompanhamentoSummaryData,
} from '@/commons/models/acompanhamento';

/**
 * Consulta de dados completos do acompanhamento (KPIs + Lista de Promessas paginada)
 */
export async function getAcompanhamentoDataAction(params?: {
  page?: number;
  limit?: number;
  tab?: string;
  search?: string;
  sortBy?: string;
}): Promise<{
  success: boolean;
  data?: {
    summary: AcompanhamentoSummaryData;
    paginated: PaginatedPromisesResult;
  };
  error?: string;
}> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = getPromisesQuerySchema.safeParse(params || {});
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Parâmetros de consulta inválidos.',
      };
    }

    const result = await getAcompanhamentoDataApi({
      userId,
      page: validation.data.page,
      limit: validation.data.limit,
      tab: validation.data.tab,
      search: validation.data.search,
      sortBy: validation.data.sortBy,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('[getAcompanhamentoDataAction] Erro inesperado:', error);
    return {
      success: false,
      error: 'Ocorreu um erro ao carregar os dados de acompanhamento.',
    };
  }
}

