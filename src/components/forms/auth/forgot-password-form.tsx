"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendEmailSchema } from "@/commons/validations/user";
import type {
  SendEmailFormInputs,
  ForgotPasswordFormInputs,
} from "@/commons/models/user";
import { FaEnvelope, FaArrowLeft, FaPaperPlane } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface ForgotPasswordFormProps {
  sendEmailUser?: (data: SendEmailFormInputs) => Promise<void>;
  forgotPassword?: (data: ForgotPasswordFormInputs) => Promise<void>;
  onBackToLogin?: () => void;
}

export function ForgotPasswordForm({
  sendEmailUser,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SendEmailFormInputs>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: SendEmailFormInputs) => {
    if (!sendEmailUser) return;
    startTransition(async () => {
      await sendEmailUser(data);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 font-mono leading-relaxed">
        <p>
          Esqueceu a senha? Relaxa. O importante é não esquecer de quem te deve nem do prazo da parcela.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
          E-mail Cadastrado
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <FaEnvelope className="size-3.5" />
          </div>
          <Input
            type="email"
            placeholder="tubarao@radar.com"
            autoComplete="email"
            disabled={isPending}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-rose-400 font-mono mt-1">{errors.email.message}</p>
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
            <span>Enviando Código...</span>
          </>
        ) : (
          <>
            <span>Enviar Código de Resgate</span>
            <FaPaperPlane className="size-3.5" />
          </>
        )}
      </Button>

      {onBackToLogin && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <FaArrowLeft className="size-3" />
            <span>Voltar para o Login</span>
          </button>
        </div>
      )}
    </form>
  );
}

