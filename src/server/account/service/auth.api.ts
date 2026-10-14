import "server-only";

import type {
  ResetPasswordRequestBody,
  SignInRequestBody,
  UserRequestBody,
} from "@/commons/models/user";
import {
  confirmCodePasswordReset,
  createAuthSupabase,
  createProfileSupabase,
  getUserLogged,
  killAuthSupabase,
  sendPasswordResetEmail,
  signInWithEmail,
  updatePassword,
  verifyCode,
  resendOtpCode,
  getProfileByUserIdSupabase,
} from "../repository/auth.supabase";
import {
  getSubscriptionByUserIdSupabase,
  getUserPermissionsByUserIdSupabase,
} from "../repository/subscription.supabase";
import { getUserPermissionsOrCacheApi } from "./subscription.api";
import { resolveAuthError } from "@/commons/errors/auth";
import { ApiResponse } from "@/commons/lib/http/responses";
import { HttpStatusEnum } from "@/commons/enums/http";
import type { SubscriptionPayloadCookie, UserPermissions } from "@/commons/models/subscription";
import { clearCookieSubscription, setCookieSubscription } from "@/commons/lib/auth/subscription";
import { isSubscriptionActive } from "@/commons/lib/http/security";
import { formatProperName } from "@/commons/utils/format";

export const signInUserApi = async (body: SignInRequestBody) => {
  const { data, error } = await signInWithEmail(body.email, body.password);

  if (error) {
    if (
      error.code === "email_not_confirmed" ||
      error.message?.toLowerCase().includes("email not confirmed")
    ) {
      return {
        status: HttpStatusEnum.Forbidden,
        message: "Seu e-mail ainda não foi confirmado. Digite o código de 8 dígitos para validar seu acesso.",
        data: {
          needsEmailVerification: true,
          email: body.email,
        },
        error: "email_not_confirmed",
      };
    }

    const { message, status } = resolveAuthError(error.code);
    return {
      status,
      message,
      data: null,
      error: error.message,
    };
  }

  if (!data.user || !data.session) {
    return ApiResponse.Unauthorized({
      message: "Falha na autenticação.",
      error: "Sessão ou usuário não retornados.",
    });
  }

  if (!data.user.email_confirmed_at) {
    return {
      status: HttpStatusEnum.Forbidden,
      message: "Seu e-mail ainda não foi confirmado. Digite o código de 8 dígitos para validar seu acesso.",
      data: {
        needsEmailVerification: true,
        email: body.email,
      },
      error: "email_not_confirmed",
    };
  }

  const userId = data.user.id;

  // 1. Buscar perfil do credor
  const { data: profile } = await getProfileByUserIdSupabase(userId);

  // 2. Buscar dados da assinatura (1:1 direto por user_id)
  const subscription = await getSubscriptionByUserIdSupabase(userId);

  let redirectPath = "/assinatura";
  let subscriptionPayload: SubscriptionPayloadCookie | null = null;

  if (subscription) {
    const permissions = await getUserPermissionsByUserIdSupabase(userId);

    subscriptionPayload = {
      subscriptionId: subscription.id,
      status: subscription.mp_status,
      currentPeriodEnd: subscription.current_period_end,
      userId: data.user.id,
      planSlug: subscription.plan?.slug || null,
      planName: subscription.plan?.name || "Tubarão Lixa",
      permissions,
    };

    // Se estiver ativo ou no ciclo pago, manda para a central de comando
    if (isSubscriptionActive(subscriptionPayload)) {
      redirectPath = "/painel";
    }

    // Grava cookie seguro de assinatura para o proxy.ts
    await setCookieSubscription(subscriptionPayload, data.user.id);
  }

  return ApiResponse.Ok({
    message: "Login realizado com sucesso. Acesso autorizado ao cofre!",
    data: {
      ...data,
      subscription: subscriptionPayload,
      profile: profile || null,
      redirectPath,
    },
  });
};

export const signUpUserApi = async (body: UserRequestBody) => {
  const { data, error } = await createAuthSupabase(body);

  if (error) {
    const { message, status } = resolveAuthError(error.code);
    return {
      status,
      message,
      data: null,
      error: error.message,
    };
  }

  const userId = data?.user?.id;
  if (!userId) {
    return ApiResponse.InternalError({
      message: "Erro inesperado ao criar conta do tubarão.",
      error: "Usuário autenticado, mas ID não encontrado.",
    });
  }

  await createProfileSupabase({
    userId,
    name: formatProperName(body.name),
    email: body.email,
    nickname: body.nickname?.trim() ? formatProperName(body.nickname) : null,
  });

  return ApiResponse.Ok({
    message: `Código de verificação enviado para ${body.email}`,
    data: data,
  });
};

export const signOutApi = async () => {
  const error = await killAuthSupabase();

  if (error) {
    console.warn("[signOutApi] Erro ao deslogar no Supabase:", error.message);
  }

  await clearCookieSubscription();

  return ApiResponse.Ok({
    message: "Usuário deslogado com sucesso.",
    data: null,
  });
};

export const sendPasswordResetEmailApi = async (email: string) => {
  const { data, error } = await sendPasswordResetEmail(email);

  if (error) {
    const { message, status } = resolveAuthError(error.code);
    return {
      status,
      message,
      data: null,
      error: error.message,
    };
  }

  return ApiResponse.Ok({
    message: `E-mail de recuperação enviado para ${email}.`,
    data: data,
  });
};

export const resendOtpCodeApi = async (
  email: string,
  type: "signup" | "recovery" = "signup"
) => {
  if (type === "recovery") {
    return await sendPasswordResetEmailApi(email);
  }

  const error = await resendOtpCode(email);

  if (error) {
    const { message, status } = resolveAuthError(error.code);
    return {
      status,
      message,
      data: null,
      error: error.message,
    };
  }

  return ApiResponse.Ok({
    message: `Novo código de confirmação enviado para ${email}.`,
    data: { resent: true },
  });
};

export const confirmUserEmailApi = async (email: string, code: string) => {
  const { data, error } = await verifyCode(email, code);
  if (error) {
    return ApiResponse.Unauthorized({
      message: "Erro ao confirmar código do usuário.",
      error: error.message,
    });
  }

  const userName = data?.user?.user_metadata?.display_name || email;

  return ApiResponse.Ok({
    message: `Bem-vindo ao Caloteiro, ${userName}! Seu e-mail foi confirmado com sucesso.`,
    data: data,
  });
};

export const resetUserPasswordApi = async (body: ResetPasswordRequestBody) => {
  const { error } = await confirmCodePasswordReset(body.email, body.code);

  if (error) {
    const { message, status } = resolveAuthError(error.code);
    return {
      status,
      message,
      data: null,
      error: error.message,
    };
  }

  const { data, error: updateError } = await updatePassword(body.password);

  if (updateError) {
    const { message, status } = resolveAuthError(updateError.code);
    return {
      status,
      message,
      data: null,
      error: updateError.message,
    };
  }

  return ApiResponse.Ok({
    message: "Senha alterada com sucesso! Acesse sua conta.",
    data: data,
  });
};

export const getUserLoggedApi = async () => {
  const { data, error } = await getUserLogged();

  if (error || !data?.user) {
    return ApiResponse.Unauthorized({
      message: "Erro ao buscar usuário logado.",
      error: error?.message || "Usuário não autenticado.",
    });
  }

  return ApiResponse.Ok({
    message: "Usuário obtido com sucesso.",
    data: data,
  });
};

/**
 * Retorna os dados completos do usuário logado, incluindo perfil e assinatura/plano ativo
 * para consumo limpo em componentes como NavUser e cabeçalhos.
 */
export const getCurrentUserSessionProfileApi = async () => {
  const authResponse = await getUserLoggedApi();
  const user = authResponse.data?.user;

  const fallbackPermissions: UserPermissions = {
    maxDebtors: 2,
    canCustomTemplates: false,
    canExportReports: false,
    canAccessFinancial: false,
    canDebtorPortal: false,
    canRiskScore: false,
    canAttachReceipts: false,
    isFreePlan: true,
    isSubscriptionActive: false,
  };

  if (!user) {
    return {
      user: null,
      profile: null,
      subscription: null,
      planName: "Tubarão Lixa",
      permissions: fallbackPermissions,
    };
  }

  // Busca permissões prioritariamente do cookie assinado HMAC-SHA256 (0 queries de permissão)
  const [{ data: profile }, subscription, permissions] = await Promise.all([
    getProfileByUserIdSupabase(user.id),
    getSubscriptionByUserIdSupabase(user.id),
    getUserPermissionsOrCacheApi(user.id),
  ]);

  return {
    user,
    profile: profile || null,
    subscription: subscription || null,
    planName: subscription?.plan?.name || "Tubarão Lixa",
    permissions: permissions || fallbackPermissions,
  };
};