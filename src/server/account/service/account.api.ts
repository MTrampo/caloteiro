import "server-only";

import {
  updateProfileByUserIdSupabase,
  updateUserEmailSupabase,
  updatePassword,
  sendPasswordResetEmail,
  confirmCodePasswordReset,
  verifyEmailChangeCodeSupabase,
  updateProfileEmailByUserIdSupabase,
  deleteUserAccountSupabase,
  killAuthSupabase,
} from "../repository/auth.supabase";
import {
  getInvoicesByUserIdSupabase,
  getSubscriptionByUserIdSupabase,
} from "../repository/subscription.supabase";
import { cancelPreApprovalApi } from "@/server/payment/service/payment.api";
import { clearCookieSubscription } from "@/commons/lib/auth/subscription";
import type {
  UpdateProfilePayload,
  UpdateEmailPayload,
  UpdatePasswordPayload,
  ConfirmUpdatePasswordOtpPayload,
  ConfirmEmailChangeOtpPayload,
  InvoiceFormatted,
} from "@/commons/models/account";
import { ApiResponse } from "@/commons/lib/http/responses";
import type { ResponseProps } from "@/commons/models/api";
import { formatBRL, formatDate } from "@/commons/utils/format";

/**
 * Atualiza os dados de identificação do Tubarão (Nome, Apelido, Telefone)
 */
export const updateProfileApi = async (
  userId: string,
  payload: UpdateProfilePayload
): Promise<ResponseProps<{ name: string }>> => {
  const { data, error } = await updateProfileByUserIdSupabase(userId, payload);

  if (error || !data) {
    return ApiResponse.BadRequest({
      message: "Não foi possível atualizar o perfil.",
      error: error?.message,
    });
  }

  return ApiResponse.Ok({
    data: { name: data.name || payload.name },
    message: "Perfil do Tubarão atualizado com sucesso!",
  });
};

/**
 * Solicita a alteração do e-mail de acesso via Supabase Auth
 */
export const updateEmailApi = async (
  payload: UpdateEmailPayload
): Promise<ResponseProps<{ email: string }>> => {
  const { data, error } = await updateUserEmailSupabase(payload.newEmail);

  if (error || !data) {
    return ApiResponse.BadRequest({
      message: error?.message || "Erro ao solicitar alteração de e-mail.",
      error: error?.message,
    });
  }

  return ApiResponse.Ok({
    data: { email: payload.newEmail },
    message:
      "Código de confirmação enviado! Verifique o novo e-mail para validar a alteração.",
  });
};

/**
 * Confirma a alteração do e-mail de acesso usando o código OTP recebido
 */
export const confirmEmailChangeOtpApi = async (
  userId: string,
  payload: ConfirmEmailChangeOtpPayload
): Promise<ResponseProps<{ email: string }>> => {
  const { data, error } = await verifyEmailChangeCodeSupabase(
    payload.newEmail,
    payload.code
  );

  if (error || !data) {
    return ApiResponse.BadRequest({
      message: error?.message || "Código de confirmação do e-mail inválido ou expirado.",
      error: error?.message,
    });
  }

  // Atualiza o e-mail no perfil público do usuário
  await updateProfileEmailByUserIdSupabase(userId, payload.newEmail);

  return ApiResponse.Ok({
    data: { email: payload.newEmail },
    message: "E-mail de acesso atualizado com sucesso! Seu novo endereço está confirmado.",
  });
};

/**
 * Solicita o envio do código OTP de segurança para alteração de senha
 */
export const requestPasswordChangeOtpApi = async (
  email: string
): Promise<ResponseProps<{ email: string }>> => {
  const { data, error } = await sendPasswordResetEmail(email);

  if (error || !data) {
    return ApiResponse.BadRequest({
      message: error?.message || "Não foi possível enviar o código de segurança.",
      error: error?.message,
    });
  }

  return ApiResponse.Ok({
    data: { email },
    message: `Código de segurança de 8 dígitos enviado para ${email}.`,
  });
};

/**
 * Valida o código OTP de segurança e aplica a nova senha
 */
export const confirmUpdatePasswordOtpApi = async (
  email: string,
  payload: ConfirmUpdatePasswordOtpPayload
): Promise<ResponseProps<{ success: boolean }>> => {
  // 1. Confirma o código OTP de recuperação
  const { error: otpError } = await confirmCodePasswordReset(
    email,
    payload.code
  );

  if (otpError) {
    return ApiResponse.BadRequest({
      message: "Código de segurança inválido ou expirado. Solicite um novo código.",
      error: otpError.message,
    });
  }

  // 2. Aplica a nova senha na conta
  const { data, error: passError } = await updatePassword(payload.newPassword);

  if (passError || !data) {
    return ApiResponse.BadRequest({
      message: passError?.message || "Erro ao salvar a nova senha.",
      error: passError?.message,
    });
  }

  return ApiResponse.Ok({
    data: { success: true },
    message: "Senha alterada com sucesso! Suas credenciais foram atualizadas.",
  });
};

/**
 * Atualiza a senha de acesso da conta diretamente (legado/fallback)
 */
export const updatePasswordApi = async (
  payload: UpdatePasswordPayload
): Promise<ResponseProps<{ success: boolean }>> => {
  const { data, error } = await updatePassword(payload.newPassword);

  if (error || !data) {
    return ApiResponse.BadRequest({
      message: error?.message || "Erro ao atualizar a senha.",
      error: error?.message,
    });
  }

  return ApiResponse.Ok({
    data: { success: true },
    message: "Senha alterada com sucesso! Suas credenciais foram atualizadas.",
  });
};


/**
 * Busca e formata o histórico de faturas/pagamentos da assinatura
 */
export const getAccountInvoicesApi = async (
  userId: string
): Promise<InvoiceFormatted[]> => {
  const rawInvoices = await getInvoicesByUserIdSupabase(userId);

  return rawInvoices.map((inv) => {
    const amount = Number(inv.amount || 0);
    const isApproved = inv.status === "approved" || inv.status === "paid";
    const isPending = inv.status === "pending" || inv.status === "in_process";

    let statusLabel = "Aprovado";
    let statusBadgeClass =
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

    if (isPending) {
      statusLabel = "Pendente";
      statusBadgeClass =
        "bg-amber-500/10 text-amber-400 border-amber-500/20";
    } else if (!isApproved) {
      statusLabel = "Recusado / Falhou";
      statusBadgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }

    return {
      id: inv.id,
      amount,
      formattedAmount: formatBRL(amount),
      status: inv.status,
      statusLabel,
      statusBadgeClass,
      paidAt: inv.paid_at,
      formattedPaidAt: inv.paid_at ? formatDate(inv.paid_at) : "—",
      mpInvoiceId: inv.mp_invoice_id,
      createdAt: inv.created_at || new Date().toISOString(),
      formattedCreatedAt: inv.created_at ? formatDate(inv.created_at) : "—",
    };
  });
};

/**
 * Exclui definitivamente a conta do usuário, cancelando assinatura ativa no MP e expurgando todos os dados
 */
export const deleteUserAccountApi = async (
  userId: string
): Promise<ResponseProps<null>> => {
  // 1. Cancela assinatura no Mercado Pago se houver
  const sub = await getSubscriptionByUserIdSupabase(userId);
  if (sub?.mp_subscription_id) {
    try {
      await cancelPreApprovalApi(sub.mp_subscription_id);
    } catch (err) {
      console.error("[deleteUserAccountApi] Erro ao cancelar preapproval no MP:", err);
    }
  }

  // 2. Apaga registros do banco (perfil e cascata completa + auth.users)
  const { error } = await deleteUserAccountSupabase(userId);
  if (error) {
    console.error("[deleteUserAccountApi] Erro ao excluir usuário:", error);
    return ApiResponse.InternalError({
      message: "Não foi possível excluir a conta. Tente novamente mais tarde.",
      error: error.message,
    });
  }

  // 3. Limpa cookies de assinatura e encerra sessão
  await clearCookieSubscription();
  await killAuthSupabase();

  return ApiResponse.Ok({
    message: "Conta excluída com sucesso.",
    data: null,
  });
};

