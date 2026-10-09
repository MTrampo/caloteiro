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
  getProfileByUserIdSupabase,
} from "../repository/auth.supabase";
import { getSubscriptionByUserIdSupabase } from "../repository/subscription.supabase";
import { resolveAuthError } from "@/commons/errors/auth";
import { ApiResponse } from "@/commons/lib/http/responses";
import type { SubscriptionPayloadCookie } from "@/commons/models/subscription";
import { clearCookieSubscription, setCookieSubscription } from "@/commons/lib/auth/subscription";
import { isSubscriptionActive } from "@/commons/lib/http/security";

export const signInUserApi = async (body: SignInRequestBody) => {
  const { data, error } = await signInWithEmail(body.email, body.password);

  if (error) {
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

  const userId = data.user.id;

  // 1. Buscar perfil do credor
  const { data: profile } = await getProfileByUserIdSupabase(userId);

  // 2. Buscar dados da assinatura (1:1 direto por user_id)
  const subscription = await getSubscriptionByUserIdSupabase(userId);

  let redirectPath = "/assinatura";
  let subscriptionPayload: SubscriptionPayloadCookie | null = null;

  if (subscription) {
    subscriptionPayload = {
      subscriptionId: subscription.id,
      status: subscription.mp_status,
      currentPeriodEnd: subscription.current_period_end,
      userId: data.user.id,
      planSlug: subscription.plan?.slug || null,
    };

    // Se estiver ativo ou no ciclo pago, manda para a central de comando
    if (isSubscriptionActive(subscriptionPayload)) {
      redirectPath = "/painel";
    }

    // Grava cookie seguro de assinatura para o proxy.ts
    await setCookieSubscription(subscriptionPayload);
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
      message: "Erro inesperado ao criar conta do investigador.",
      error: "Usuário autenticado, mas ID não encontrado.",
    });
  }

  // Criação explícita do perfil no servidor (sem triggers mágicos)
  await createProfileSupabase(
    userId,
    body.name,
    body.email,
    body.nickname,
    null,
    null
  );

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

  if (error) {
    return ApiResponse.Unauthorized({
      message: "Erro ao buscar usuário logado.",
      error: error.message,
    });
  }

  return ApiResponse.Ok({
    message: "Usuário obtido com sucesso.",
    data: data,
  });
};