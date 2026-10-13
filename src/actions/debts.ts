'use server';

import { getUserLoggedApi } from '@/server/account/service/auth.api';
import {
  createDebtSchema,
  registerPaymentSchema,
  registerExcuseSchema,
} from '@/commons/validations/debt';
import {
  createDebtApi,
  getDebtDetailsApi,
  registerDebtPaymentApi,
  registerDebtExcuseApi,
} from '@/server/debts/service/debt.api';
import type { DebtDetailsFormatted } from '@/commons/models/debt';

/**
 * Consulta o dossiê detalhado de uma dívida
 */
export async function getDebtDetailsAction(
  debtId: string
): Promise<{ success: boolean; data?: DebtDetailsFormatted; error?: string }> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    if (!debtId || typeof debtId !== 'string') {
      return { success: false, error: 'Identificador de dívida inválido.' };
    }

    const result = await getDebtDetailsApi(debtId, userId);
    if (!result.data) {
      return { success: false, error: result.message || 'Dívida não encontrada.' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[getDebtDetailsAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao buscar os dados da dívida.' };
  }
}

/**
 * Criação de uma nova dívida com parcelas calculadas
 */
export async function createDebtAction(
  rawData: unknown
): Promise<{ success: boolean; data?: { debtId: string }; error?: string }> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = createDebtSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos para registrar a dívida.',
      };
    }

    const result = await createDebtApi(userId, validation.data);
    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Erro ao registrar a dívida.',
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[createDebtAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao criar a dívida.' };
  }
}

/**
 * Registra baixa / amortização em cascata (Pingou o Pix!)
 */
export async function registerDebtPaymentAction(
  debtId: string,
  rawData: unknown
): Promise<{
  success: boolean;
  data?: { settled: boolean; amortizedAmount: number };
  message?: string;
  error?: string;
}> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    if (!debtId) {
      return { success: false, error: 'Identificador de dívida inválido.' };
    }

    const validation = registerPaymentSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Valor ou dados do Pix inválidos.',
      };
    }

    const result = await registerDebtPaymentApi(debtId, userId, validation.data);
    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Não foi possível registrar o pagamento.',
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error('[registerDebtPaymentAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao registrar a baixa do Pix.' };
  }
}

/**
 * Anota um novo caô/desculpa para uma parcela
 */
export async function registerDebtExcuseAction(
  rawData: unknown
): Promise<{ success: boolean; data?: { excuseId: string }; message?: string; error?: string }> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = registerExcuseSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos ao registrar o caô.',
      };
    }

    const result = await registerDebtExcuseApi(userId, validation.data);
    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Não foi possível salvar a desculpa.',
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error('[registerDebtExcuseAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao salvar o caô.' };
  }
}

