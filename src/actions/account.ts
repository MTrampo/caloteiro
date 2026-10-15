'use server';

import { getUserLoggedApi } from '@/server/account/service/auth.api';
import {
  updateProfileSchema,
  updateEmailSchema,
  updatePasswordSchema,
  confirmUpdatePasswordOtpSchema,
  confirmEmailChangeOtpSchema,
} from '@/commons/validations/account';
import {
  updateProfileApi,
  updateEmailApi,
  updatePasswordApi,
  requestPasswordChangeOtpApi,
  confirmUpdatePasswordOtpApi,
  confirmEmailChangeOtpApi,
} from '@/server/account/service/account.api';

/**
 * Atualiza os dados de perfil do Tubarão (Nome, Apelido, Telefone)
 */
export async function updateProfileAccountAction(
  rawData: unknown
): Promise<{ success: boolean; data?: { name: string }; message?: string; error?: string }> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = updateProfileSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados de perfil inválidos.',
      };
    }

    const result = await updateProfileApi(userId, validation.data);
    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Erro ao atualizar dados do perfil.',
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error('[updateProfileAccountAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao atualizar o perfil.' };
  }
}

/**
 * Solicita alteração de e-mail de acesso (dispara OTP/link para o novo e-mail)
 */
export async function updateEmailAccountAction(
  rawData: unknown
): Promise<{ success: boolean; data?: { email: string }; message?: string; error?: string }> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = updateEmailSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'E-mail informado é inválido.',
      };
    }

    const result = await updateEmailApi(validation.data);
    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Erro ao atualizar o e-mail.',
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error('[updateEmailAccountAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao solicitar a alteração de e-mail.' };
  }
}

/**
 * Confirma a alteração do e-mail de acesso via código OTP
 */
export async function confirmEmailChangeOtpAction(
  rawData: unknown
): Promise<{ success: boolean; data?: { email: string }; message?: string; error?: string }> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = confirmEmailChangeOtpSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Código de confirmação inválido.',
      };
    }

    const result = await confirmEmailChangeOtpApi(userId, validation.data);
    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Erro ao confirmar a alteração do e-mail.',
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error('[confirmEmailChangeOtpAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao confirmar o novo e-mail.' };
  }
}

/**
 * Solicita o código OTP de segurança para alterar a senha
 */
export async function requestPasswordChangeOtpAction(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const userRes = await getUserLoggedApi();
    const email = userRes.data?.user?.email;
    if (!email) {
      return { success: false, error: 'Acesso não autorizado ou e-mail não identificado.' };
    }

    const result = await requestPasswordChangeOtpApi(email);
    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Erro ao enviar código de segurança.',
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('[requestPasswordChangeOtpAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao solicitar o código de segurança.' };
  }
}

/**
 * Valida o código OTP de segurança e aplica a nova senha
 */
export async function confirmUpdatePasswordOtpAction(
  rawData: unknown
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const userRes = await getUserLoggedApi();
    const email = userRes.data?.user?.email;
    if (!email) {
      return { success: false, error: 'Acesso não autorizado ou e-mail não identificado.' };
    }

    const validation = confirmUpdatePasswordOtpSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Dados de redefinição inválidos.',
      };
    }

    const result = await confirmUpdatePasswordOtpApi(email, validation.data);
    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Erro ao alterar a senha.',
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('[confirmUpdatePasswordOtpAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao atualizar a senha.' };
  }
}

/**
 * Atualiza a senha da conta diretamente (legado/fallback)
 */
export async function updatePasswordAccountAction(
  rawData: unknown
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const userRes = await getUserLoggedApi();
    const userId = userRes.data?.user?.id;
    if (!userId) {
      return { success: false, error: 'Acesso não autorizado. Faça login novamente.' };
    }

    const validation = updatePasswordSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Nova senha inválida.',
      };
    }

    const result = await updatePasswordApi({
      newPassword: validation.data.newPassword,
    });

    if (!result.data) {
      return {
        success: false,
        error: result.message || 'Erro ao alterar a senha.',
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('[updatePasswordAccountAction] Erro inesperado:', error);
    return { success: false, error: 'Ocorreu um erro ao atualizar a senha.' };
  }
}


