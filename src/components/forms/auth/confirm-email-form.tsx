"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import type { OtpFormInputs } from "@/commons/models/user";
import { FaArrowLeft, FaCheck } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { ResendCodeButton } from "./resend-code-button";

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
  const [isPending, startTransition] = React.useTransition();
  const submittingRef = React.useRef(false);

  const handleVerify = React.useCallback(
    (otpCode: string) => {
      if (otpCode.length !== 8 || isPending || submittingRef.current) return;
      submittingRef.current = true;
      startTransition(async () => {
        try {
          await verifyCode({ code: otpCode });
        } finally {
          submittingRef.current = false;
        }
      });
    },
    [isPending, verifyCode]
  );

  const handleOtpChange = (val: string) => {
    setCode(val);
    if (val.length === 8) {
      handleVerify(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 8) return;
    handleVerify(code);
  };

  return (
    <form method="post" noValidate onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-xs font-mono text-zinc-400">
          Código de 8 dígitos enviado para:
        </p>
        <p className="text-sm font-mono font-bold text-emerald-400 break-all">
          {email || "seu e-mail"}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-2">
        <InputOTP
          maxLength={8}
          value={code}
          onChange={handleOtpChange}
          disabled={isPending}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <InputOTPGroup className="gap-1 sm:gap-1.5">
              <InputOTPSlot index={0} className="size-9 sm:size-11 text-sm sm:text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={1} className="size-9 sm:size-11 text-sm sm:text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={2} className="size-9 sm:size-11 text-sm sm:text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={3} className="size-9 sm:size-11 text-sm sm:text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
            </InputOTPGroup>
            <InputOTPSeparator className="text-zinc-600" />
            <InputOTPGroup className="gap-1 sm:gap-1.5">
              <InputOTPSlot index={4} className="size-9 sm:size-11 text-sm sm:text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={5} className="size-9 sm:size-11 text-sm sm:text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={6} className="size-9 sm:size-11 text-sm sm:text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
              <InputOTPSlot index={7} className="size-9 sm:size-11 text-sm sm:text-base font-mono bg-zinc-950/80 border-zinc-800 text-white rounded-lg focus-visible:ring-emerald-500/30" />
            </InputOTPGroup>
          </div>
        </InputOTP>
        <span className="text-[11px] font-mono text-zinc-500">
          Digite os 8 números recebidos no e-mail
        </span>
      </div>

      <Button
        type="submit"
        disabled={isPending || code.length !== 8}
        className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl transition-all duration-200 shadow-lg shadow-white/5 cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin text-zinc-950" />
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

        {onResendCode && (
          <ResendCodeButton
            onResend={onResendCode}
            initialSeconds={300}
            storageKey={`resend_confirm_${email || "default"}`}
          />
        )}
      </div>
    </form>
  );
}
