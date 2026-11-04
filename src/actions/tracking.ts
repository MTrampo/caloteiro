'use server';

import { getUserLoggedApi } from '@/server/account/service/auth.api';
import { getPromisesQuerySchema } from '@/commons/validations/tracking';
import { getTrackingDataApi } from '@/server/debts/service/tracking.api';
import type {
  PaginatedPromisesResult,
  TrackingSummaryData,
} from '@/commons/models/tracking';

/**
 * Consulta de dados completos do acompanhamento de promessas (KPIs + Lista paginada)
 */
export async function getTrackingDataAction(params?: {
  page?: number;
  limit?: number;
  tab?: string;
  search?: string;
  sortBy?: string;
}): Promise<{
  success: boolean;
  data?: {
    summary: TrackingSummaryData;
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

    const result = await getTrackingDataApi({
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
    console.error('[getTrackingDataAction] Erro inesperado:', error);
    return {
      success: false,
      error: 'Ocorreu um erro ao carregar os dados de acompanhamento.',
    };
  }
}

// Alias de transição para compatibilidade retroativa
export const getAcompanhamentoDataAction = getTrackingDataAction;

