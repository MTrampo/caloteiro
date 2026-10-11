"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { forgotPasswordSchema } from "@/commons/validations/user";
import type { ForgotPasswordFormInputs } from "@/commons/models/user";
import { FaLock, FaShieldHalved } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { ResendCodeButton } from "./resend-code-button";

interface ResetPasswordFormProps {
  email?: string;
  forgotPassword: (data: ForgotPasswordFormInputs) => Promise<void>;
  onResendCode?: () => Promise<void>;
  onBackToLogin?: () => void;
}

export function ResetPasswordForm({
  email,
  forgotPassword,
  onResendCode,
  onBackToLogin,
}: ResetPasswordFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const passwordInputRef = React.useRef<HTMLInputElement | null>(null);

  const [codeValue, setCodeValue] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleOtpChange = (val: string) => {
    setCodeValue(val);
    setValue("code", val, { shouldValidate: val.length === 8 });
    if (val.length === 8) {
      passwordInputRef.current?.focus();
    }
  };

  const { ref: formPasswordRef, ...passwordRegisterRest } = register("password");

  const onSubmit = (data: ForgotPasswordFormInputs) => {
    startTransition(async () => {
      await forgotPassword(data);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campo Código OTP 8 dígitos */}
      <div className="space-y-2 flex flex-col items-center">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 self-start">
          Código de 8 dígitos recebido
        </label>
        <InputOTP
          maxLength={8}
          value={codeValue}
          onChange={handleOtpChange}
          disabled={isPending}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <InputOTPGroup className="gap-1 sm:gap-1.5">
              <InputOTPSlot index={0} className="size-9 sm:size-10 text-sm font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={1} className="size-9 sm:size-10 text-sm font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={2} className="size-9 sm:size-10 text-sm font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={3} className="size-9 sm:size-10 text-sm font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
            </InputOTPGroup>
            <InputOTPSeparator className="text-zinc-600" />
            <InputOTPGroup className="gap-1 sm:gap-1.5">
              <InputOTPSlot index={4} className="size-9 sm:size-10 text-sm font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={5} className="size-9 sm:size-10 text-sm font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={6} className="size-9 sm:size-10 text-sm font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={7} className="size-9 sm:size-10 text-sm font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
            </InputOTPGroup>
          </div>
        </InputOTP>
        {errors.code && (
          <p className="text-xs text-rose-400 font-mono self-start mt-1">{errors.code.message}</p>
        )}
      </div>

      {/* Campo Nova Senha */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
          Nova Senha
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <FaLock className="size-3.5" />
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            disabled={isPending}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
            {...passwordRegisterRest}
            ref={(e) => {
              formPasswordRef(e);
              passwordInputRef.current = e;
            }}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-rose-400 font-mono mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Campo Confirmar Nova Senha */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
          Confirmar Nova Senha
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <FaShieldHalved className="size-3.5" />
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            disabled={isPending}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-rose-400 font-mono mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold tracking-wide transition-all duration-200 shadow-lg shadow-emerald-950/50 cursor-pointer flex items-center justify-center gap-2 text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Atualizando Senha...</span>
          </>
        ) : (
          <>
            <span>Redefinir e Acessar</span>
            <FaShieldHalved className="size-3.5" />
          </>
        )}
      </Button>

      {(onBackToLogin || onResendCode) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-mono text-zinc-400">
          {onBackToLogin ? (
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <span>Voltar para o Login</span>
            </button>
          ) : (
            <div />
          )}

          {onResendCode && (
            <ResendCodeButton
              onResend={onResendCode}
              initialSeconds={300}
              storageKey={`resend_reset_${email || "default"}`}
            />
          )}
        </div>
      )}
    </form>
  );
}
