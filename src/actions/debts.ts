'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getUserLoggedApi } from '@/server/account/service/auth.api';
import {
  createDebtSchema,
  registerPaymentSchema,
  registerExcuseSchema,
  updateDebtPortalConfigSchema,
  updateDebtAgreementRulesSchema,
  updateDebtBreachStatusSchema,
  verifyDebtInvoiceAccessSchema,
} from '@/commons/validations/debt';
import {
  createDebtApi,
  getDebtDetailsApi,
  registerDebtPaymentApi,
  registerDebtExcuseApi,
  updateDebtPortalConfigApi,
  updateDebtAgreementRulesApi,
  updateDebtBreachStatusApi,
  getPublicDebtInvoiceDataApi,
} from '@/server/debts/service/debt.api';
import {
  DEBT_INVOICE_COOKIE_PREFIX,
  DEBT_INVOICE_COOKIE_MAX_AGE_SECONDS,
} from '@/commons/constants';
import {
  signSecureCookie,
  getDebtInvoiceCookieSecret,
} from '@/commons/lib/crypto/secure-cookie';
import type {
  DebtDetailsFormatted,
  PublicDebtInvoiceViewData,
} from '@/commons/models/debt';

/**
 * Consulta os detalhes completos de uma dívida
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

    revalidatePath('/painel/dividas');
    revalidatePath('/painel/dividas/acompanhamento');
    revalidatePath('/painel');

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

    revalidatePath(`/painel/dividas/${debtId}`);
    revalidatePath('/painel/dividas');
    revalidatePath('/painel/dividas/acompanhamento');
    revalidatePath('/painel');
    revalidatePath(`/fatura/${debtId}`);

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

/**
 * Configura o Link Público da Fatura (/fatura/[id]) e o Código de Acesso pelo Tubarão
 */
export async function updateDebtPortalConfigAction(
  rawData: unknown
): Promise<{
  success: boolean;
  data?: { publicLinkEnabled: boolean; publicAccessCode: string };
  message?: string;
  error?: string;
}> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = updateDebtPortalConfigSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados inválidos para configurar o link da fatura.',
      };
    }

    const result = await updateDebtPortalConfigApi({
      debtId: validation.data.debtId,
      userId,
      publicLinkEnabled: validation.data.publicLinkEnabled,
      publicAccessCode: validation.data.publicAccessCode,
      regenerateCode: validation.data.regenerateCode,
    });

    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Não foi possível atualizar a configuração da fatura.',
      };
    }

    revalidatePath(`/painel/dividas/${validation.data.debtId}`);
    revalidatePath(`/fatura/${validation.data.debtId}`);

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error('[updateDebtPortalConfigAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao atualizar o link da fatura.' };
  }
}

/**
 * Valida o código de acesso informado pelo devedor e libera a visualização da fatura (/fatura/[id])
 */
export async function verifyDebtInvoiceAccessAction(
  rawData: unknown
): Promise<{
  success: boolean;
  data?: PublicDebtInvoiceViewData;
  error?: string;
}> {
  try {
    const validation = verifyDebtInvoiceAccessSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Informe um código de acesso válido.',
      };
    }

    const { debtId, accessCode } = validation.data;
    const normalizedCode = accessCode.trim().toUpperCase();

    const result = await getPublicDebtInvoiceDataApi({
      debtId,
      accessCode: normalizedCode,
    });

    if (result.status !== 200 || !result.data) {
      return {
        success: false,
        error: result.message || 'Código de acesso incorreto.',
      };
    }

    // Assina e grava cookie temporário httpOnly para manter a sessão da fatura destrancada por 2h
    try {
      const secret = getDebtInvoiceCookieSecret(debtId);
      const token = await signSecureCookie(
        { debtId, accessCode: normalizedCode },
        secret
      );
      const cookieStore = await cookies();
      cookieStore.set(`${DEBT_INVOICE_COOKIE_PREFIX}${debtId}`, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: DEBT_INVOICE_COOKIE_MAX_AGE_SECONDS,
        path: `/fatura/${debtId}`,
      });
    } catch (cookieErr) {
      console.error('[verifyDebtInvoiceAccessAction] Aviso ao gravar cookie:', cookieErr);
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('[verifyDebtInvoiceAccessAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao validar o código de acesso.' };
  }
}

/**
 * Tranca novamente a fatura pública removendo o cookie temporário de acesso
 */
export async function lockDebtInvoiceAction(
  debtId: string
): Promise<{ success: boolean }> {
  try {
    if (debtId && typeof debtId === 'string') {
      const cookieStore = await cookies();
      cookieStore.delete({
        name: `${DEBT_INVOICE_COOKIE_PREFIX}${debtId}`,
        path: `/fatura/${debtId}`,
      });
    }
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Atualiza as cláusulas/regras do acordo (notes), gatilho de tolerância e visibilidade na fatura pública
 */
export async function updateDebtAgreementRulesAction(
  rawData: unknown
): Promise<{
  success: boolean;
  data?: {
    notes: string | null;
    maxLateInstallments: number | null;
    showNotesOnInvoice: boolean;
  };
  message?: string;
  error?: string;
}> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = updateDebtAgreementRulesSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          'Dados inválidos para atualizar as cláusulas do acordo.',
      };
    }

    const result = await updateDebtAgreementRulesApi({
      debtId: validation.data.debtId,
      userId,
      notes: validation.data.notes ?? null,
      maxLateInstallments: validation.data.maxLateInstallments ?? null,
      showNotesOnInvoice: validation.data.showNotesOnInvoice,
    });

    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Não foi possível salvar as cláusulas do acordo.',
      };
    }

    revalidatePath(`/painel/dividas/${validation.data.debtId}`);
    revalidatePath(`/fatura/${validation.data.debtId}`);

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error('[updateDebtAgreementRulesAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao atualizar as regras do acordo.' };
  }
}

/**
 * Declara ou reverte a Quebra de Acordo (status 'defaulted' <-> 'pending')
 */
export async function updateDebtBreachStatusAction(
  rawData: unknown
): Promise<{
  success: boolean;
  data?: { status: string };
  message?: string;
  error?: string;
}> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = updateDebtBreachStatusSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          'Dados inválidos para atualizar o status do acordo.',
      };
    }

    const result = await updateDebtBreachStatusApi({
      debtId: validation.data.debtId,
      userId,
      isBreached: validation.data.isBreached,
    });

    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Não foi possível alterar o status de quebra do acordo.',
      };
    }

    revalidatePath(`/painel/dividas/${validation.data.debtId}`);
    revalidatePath('/painel/dividas');
    revalidatePath('/painel');
    revalidatePath(`/fatura/${validation.data.debtId}`);

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error('[updateDebtBreachStatusAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao atualizar o status de quebra do acordo.' };
  }
}


