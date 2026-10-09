"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import type { OtpFormInputs } from "@/commons/models/user";
import { FaArrowLeft, FaCheck, FaRotateRight } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface ConfirmEmailFormProps {
  email?: string;
  verifyCode: (data: OtpFormInputs) => Promise<void>;
  onResendCode?: () => Promise<void>;
  onBack?: () => void;
}

export function ConfirmEmailForm({
  email,
  verifyCode,
  onResendCode,
  onBack,
}: ConfirmEmailFormProps) {
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [timer, setTimer] = React.useState(45);

  React.useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    try {
      setIsLoading(true);
      await verifyCode({ code });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !onResendCode) return;
    try {
      setIsResending(true);
      await onResendCode();
      setTimer(60);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-xs font-mono text-zinc-400">
          Código de 6 dígitos enviado para:
        </p>
        <p className="text-sm font-mono font-bold text-emerald-400 break-all">
          {email || "seu e-mail"}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-2">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(val) => setCode(val)}
          disabled={isLoading}
        >
          <InputOTPGroup className="gap-2">
            <InputOTPSlot index={0} className="size-11 sm:size-12 text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
            <InputOTPSlot index={1} className="size-11 sm:size-12 text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
            <InputOTPSlot index={2} className="size-11 sm:size-12 text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
            <InputOTPSlot index={3} className="size-11 sm:size-12 text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
            <InputOTPSlot index={4} className="size-11 sm:size-12 text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
            <InputOTPSlot index={5} className="size-11 sm:size-12 text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
          </InputOTPGroup>
        </InputOTP>
        <span className="text-[11px] font-mono text-zinc-500">
          Digite os 6 números recebidos no e-mail
        </span>
      </div>

      <Button
        type="submit"
        disabled={isLoading || code.length !== 6}
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold tracking-wide transition-all duration-200 shadow-lg shadow-emerald-950/50 cursor-pointer flex items-center justify-center gap-2 text-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Validando Código...</span>
          </>
        ) : (
          <>
            <span>Confirmar e Entrar</span>
            <FaCheck className="size-3.5" />
          </>
        )}
      </Button>

      {/* Reenvio e Voltar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-mono text-zinc-400">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <FaArrowLeft className="size-3" />
            <span>Voltar</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0 || isResending}
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 disabled:opacity-50 disabled:hover:text-zinc-400 transition-colors cursor-pointer"
        >
          {isResending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <FaRotateRight className="size-3" />
          )}
          <span>
            {timer > 0 ? `Reenviar código em ${timer}s` : "Reenviar código"}
          </span>
        </button>
      </div>
    </form>
  );
}

