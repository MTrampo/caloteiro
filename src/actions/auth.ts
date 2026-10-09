"use server";

import { HttpStatusEnum } from "@/commons/enums/http";
import {
  signInSchema,
  signUpSchema,
  sendEmailSchema,
  forgotPasswordSchema,
  type UserSignInFormInputs,
  type UserSignUpFormInputs,
  type ForgotPasswordFormInputs,
} from "@/commons/models/user";

import {
  signInUserApi,
  signUpUserApi,
  sendPasswordResetEmailApi,
  confirmUserEmailApi,
  resetUserPasswordApi,
  signOutApi,
} from "@/server/account/service/auth.api";

export interface AuthActionResult<T = unknown> {
  status: HttpStatusEnum;
  message: string;
  data?: T | null;
  error?: string;
}

/**
 * Server action para autenticar o usuário credor
 */
export async function signInUserAction(
  data: UserSignInFormInputs
): Promise<AuthActionResult<{ redirectPath: string }>> {
  const parsed = signInSchema.safeParse(data);
  if (!parsed.success) {
    return {
      status: HttpStatusEnum.BadRequest,
      message: parsed.error.issues[0]?.message || "Dados inválidos.",
    };
  }

  const result = await signInUserApi(parsed.data);

  if (result.status !== HttpStatusEnum.Ok || !result.data) {
    return {
      status: result.status,
      message: result.message,
      error: result.error || undefined,
    };
  }

  return {
    status: HttpStatusEnum.Ok,
    message: result.message,
    data: {
      redirectPath: result.data.redirectPath || "/painel",
    },
  };
}

/**
 * Server action para registrar um novo credor
 */
export async function signUpUserAction(
  data: UserSignUpFormInputs
): Promise<AuthActionResult<{ email: string }>> {
  const parsed = signUpSchema.safeParse(data);
  if (!parsed.success) {
    return {
      status: HttpStatusEnum.BadRequest,
      message: parsed.error.issues[0]?.message || "Dados inválidos.",
    };
  }

  const result = await signUpUserApi({
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
    nickname: parsed.data.nickname,
    accepted_terms: parsed.data.acceptedTerms ?? true,
  });

  if (result.status !== HttpStatusEnum.Ok) {
    return {
      status: result.status,
      message: result.message,
      error: result.error || undefined,
    };
  }

  return {
    status: HttpStatusEnum.Ok,
    message: result.message,
    data: {
      email: parsed.data.email,
    },
  };
}

/**
 * Server action para enviar e-mail de recuperação de senha
 */
export async function sendForgotPasswordEmailAction(
  email: string
): Promise<AuthActionResult<{ email: string }>> {
  const parsed = sendEmailSchema.safeParse({ email });
  if (!parsed.success) {
    return {
      status: HttpStatusEnum.BadRequest,
      message: parsed.error.issues[0]?.message || "E-mail inválido.",
    };
  }

  const result = await sendPasswordResetEmailApi(parsed.data.email);

  if (result.status !== HttpStatusEnum.Ok) {
    return {
      status: result.status,
      message: result.message,
      error: result.error || undefined,
    };
  }

  return {
    status: HttpStatusEnum.Ok,
    message: result.message,
    data: {
      email: parsed.data.email,
    },
  };
}

/**
 * Server action para validar o código OTP
 */
export async function verifyOtpCodeAction(
  email: string,
  code: string
): Promise<AuthActionResult<{ verified: boolean }>> {
  if (!code || code.length !== 6) {
    return {
      status: HttpStatusEnum.BadRequest,
      message: "O código deve ter 6 dígitos.",
    };
  }

  const result = await confirmUserEmailApi(email, code);

  if (result.status !== HttpStatusEnum.Ok) {
    return {
      status: result.status,
      message: result.message,
      error: result.error || undefined,
    };
  }

  return {
    status: HttpStatusEnum.Ok,
    message: result.message,
    data: {
      verified: true,
    },
  };
}

/**
 * Server action para reenviar código OTP
 */
export async function resendOtpCodeAction(
  email: string
): Promise<AuthActionResult<{ resent: boolean }>> {
  const result = await sendPasswordResetEmailApi(email);

  if (result.status !== HttpStatusEnum.Ok) {
    return {
      status: result.status,
      message: result.message,
      error: result.error || undefined,
    };
  }

  return {
    status: HttpStatusEnum.Ok,
    message: `Novo código enviado para ${email}`,
    data: {
      resent: true,
    },
  };
}

/**
 * Server action para redefinir senha com código
 */
export async function resetPasswordAction(
  email: string,
  data: ForgotPasswordFormInputs
): Promise<AuthActionResult<{ updated: boolean }>> {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      status: HttpStatusEnum.BadRequest,
      message: parsed.error.issues[0]?.message || "Dados inválidos.",
    };
  }

  const result = await resetUserPasswordApi({
    email,
    code: parsed.data.code,
    password: parsed.data.password,
  });

  if (result.status !== HttpStatusEnum.Ok) {
    return {
      status: result.status,
      message: result.message,
      error: result.error || undefined,
    };
  }

  return {
    status: HttpStatusEnum.Ok,
    message: result.message,
    data: {
      updated: true,
    },
  };
}

/**
 * Server action para logout do credor
 */
export async function signOutAction(): Promise<AuthActionResult<null>> {
  const result = await signOutApi();
  return {
    status: result.status,
    message: result.message,
    data: null,
  };
}

