"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/ui/logo";
import { SignInForm } from "@/components/forms/auth/signin-form";
import { ForgotPasswordForm } from "@/components/forms/auth/forgot-password-form";
import { ConfirmEmailForm } from "@/components/forms/auth/confirm-email-form";
import { ResetPasswordForm } from "@/components/forms/auth/reset-password-form";
import {
  signInUserAction,
  sendForgotPasswordEmailAction,
  verifyOtpCodeAction,
  resendOtpCodeAction,
  resetPasswordAction,
} from "@/actions/auth";
import { HttpStatusEnum } from "@/commons/enums/http";
import type {
  UserSignInFormInputs,
  SendEmailFormInputs,
  ForgotPasswordFormInputs,
  OtpFormInputs,
} from "@/commons/models/user";

type SignInStep = "login" | "forgot-password" | "verify" | "reset-password";

export function SignInFlow() {
  const router = useRouter();
  const [step, setStep] = React.useState<SignInStep>("login");
  const [email, setEmail] = React.useState("");

  // Fluxo 1: Login de Usuário
  const handleSignIn = async (data: UserSignInFormInputs) => {
    try {
      const response = await signInUserAction(data);
      if (response.status === HttpStatusEnum.Ok) {
        toast.success(response.message || "Acesso autorizado ao cofre!");
        router.push(response.data?.redirectPath || "/painel");
        return;
      }
      toast.error(response.message);
    } catch {
      toast.error("Erro ao conectar à central. Tente novamente mais tarde.");
    }
  };

  // Fluxo 2: Envio de e-mail para recuperação
  const handleSendForgotPasswordEmail = async (data: SendEmailFormInputs) => {
    try {
      const response = await sendForgotPasswordEmailAction(data.email);
      if (response.status === HttpStatusEnum.Ok) {
        toast.success(response.message);
        setEmail(data.email);
        setStep("verify");
        return;
      }
      toast.error(response.message);
    } catch {
      toast.error("Erro ao solicitar código de recuperação.");
    }
  };

  // Fluxo 3: Validação de OTP
  const handleVerifyOtp = async (data: OtpFormInputs) => {
    try {
      const response = await verifyOtpCodeAction(email, data.code);
      if (response.status === HttpStatusEnum.Ok) {
        toast.success("Código confirmado com sucesso!");
        setStep("reset-password");
        return;
      }
      toast.error(response.message);
    } catch {
      toast.error("Código incorreto ou expirado.");
    }
  };

  // Fluxo 4: Reenviar código
  const handleResendCode = async () => {
    try {
      const response = await resendOtpCodeAction(email);
      if (response.status === HttpStatusEnum.Ok) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Não foi possível reenviar o código agora.");
    }
  };

  // Fluxo 5: Redefinir senha com o código
  const handleResetPassword = async (data: ForgotPasswordFormInputs) => {
    try {
      const response = await resetPasswordAction(email, data);
      if (response.status === HttpStatusEnum.Ok) {
        toast.success(response.message);
        setStep("login");
        return;
      }
      toast.error(response.message);
    } catch {
      toast.error("Erro ao redefinir senha.");
    }
  };

  return (
    <div className="relative min-h-svh w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-zinc-950 text-white overflow-hidden">
      {/* Background Decorativo Noturno */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/60 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a0f_1px,transparent_1px),linear-gradient(to_bottom,#27272a0f_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Container Principal */}
      <div className="relative z-10 w-full max-w-md space-y-6 animate-in fade-in duration-300">
        {/* Cabeçalho com Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo size="lg" showText />
        </div>

        {/* Card do Formulário */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Título do Card (Sem ícones nem emojis) */}
          <div className="space-y-1 text-center sm:text-left border-b border-zinc-800/80 pb-4">
            <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
              {step === "login" && "Central de Acesso"}
              {step === "forgot-password" && "Recuperação de Acesso"}
              {step === "verify" && "Confirmação de Identidade"}
              {step === "reset-password" && "Cadastrar Nova Senha"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              {step === "login" && "Entre para gerenciar suas pendências e cobrar o que é seu por direito."}
              {step === "forgot-password" && "Digite seu e-mail para enviarmos um código seguro de recuperação."}
              {step === "verify" && "Digite o código de 6 dígitos que enviamos para sua caixa de entrada."}
              {step === "reset-password" && "Crie uma senha forte para blindar seus registros de cobrança."}
            </p>
          </div>

          {/* Renderização de Etapas */}
          {step === "login" && (
            <SignInForm
              signInUser={handleSignIn}
              onForgotPasswordClick={() => setStep("forgot-password")}
            />
          )}

          {step === "forgot-password" && (
            <ForgotPasswordForm
              sendEmailUser={handleSendForgotPasswordEmail}
              onBackToLogin={() => setStep("login")}
            />
          )}

          {step === "verify" && (
            <ConfirmEmailForm
              email={email}
              verifyCode={handleVerifyOtp}
              onResendCode={handleResendCode}
              onBack={() => setStep("forgot-password")}
            />
          )}

          {step === "reset-password" && (
            <ResetPasswordForm
              forgotPassword={handleResetPassword}
              onBackToLogin={() => setStep("login")}
            />
          )}
        </div>

        {/* Rodapé Humorístico Caloteiro */}
        <div className="text-center text-[11px] font-mono text-zinc-500">
          <span>Caloteiro App • Cada centavo na pista tem seu dono</span>
        </div>
      </div>
    </div>
  );
}