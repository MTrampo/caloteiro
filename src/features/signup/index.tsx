"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/ui/logo";
import { SignupForm } from "@/components/forms/auth/signup-form";
import { ConfirmEmailForm } from "@/components/forms/auth/confirm-email-form";
import {
  signUpUserAction,
  verifyOtpCodeAction,
  resendOtpCodeAction,
} from "@/actions/auth";
import { HttpStatusEnum } from "@/commons/enums/http";
import type {
  UserSignUpFormInputs,
  OtpFormInputs,
} from "@/commons/models/user";

type SignUpStep = "register" | "verify";

export function SignUpFlow() {
  const router = useRouter();
  const [step, setStep] = React.useState<SignUpStep>("register");
  const [email, setEmail] = React.useState("");

  // Fluxo 1: Cadastro inicial de credenciais
  const handleSignUp = async (data: UserSignUpFormInputs) => {
    try {
      const response = await signUpUserAction(data);
      if (response.status === HttpStatusEnum.Ok) {
        toast.success(response.message);
        setEmail(data.email);
        setStep("verify");
        return;
      }
      toast.error(response.message);
    } catch {
      toast.error("Ocorreu um erro ao criar a conta. Tente novamente.");
    }
  };

  // Fluxo 2: Verificação do código OTP enviado no e-mail
  const handleVerifyOtp = async (data: OtpFormInputs) => {
    try {
      const response = await verifyOtpCodeAction(email, data.code);
      if (response.status === HttpStatusEnum.Ok) {
        toast.success("Conta confirmada com sucesso! Bem-vindo ao Caloteiro.");
        router.push("/painel");
        return;
      }
      toast.error(response.message);
    } catch {
      toast.error("Código inválido ou expirado.");
    }
  };

  // Fluxo 3: Reenviar código OTP
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
              {step === "register" ? "Cadastro de Tubarão" : "Confirmar E-mail"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              {step === "register"
                ? "Crie sua credencial de tubarão para marcar caloteiros e rastrear cada centavo na pista."
                : "Insira o código de 8 dígitos que enviamos para validar seu acesso."}
            </p>
          </div>

          {/* Renderização de Etapas */}
          {step === "register" ? (
            <SignupForm signUpUser={handleSignUp} />
          ) : (
            <ConfirmEmailForm
              email={email}
              verifyCode={handleVerifyOtp}
              onResendCode={handleResendCode}
              onBack={() => setStep("register")}
            />
          )}
        </div>

        {/* Rodapé Humorístico Caloteiro */}
        <div className="text-center text-[11px] font-mono text-zinc-500">
          <span>Caloteiro App • Nunca mais tome prejuízo em silêncio</span>
        </div>
      </div>
    </div>
  );
}