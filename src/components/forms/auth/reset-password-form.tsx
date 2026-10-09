"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormInputs,
} from "@/commons/models/user";
import { FaLock, FaKey, FaShieldHalved } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface ResetPasswordFormProps {
  forgotPassword: (data: ForgotPasswordFormInputs) => Promise<void>;
  onBackToLogin?: () => void;
}

export function ResetPasswordForm({
  forgotPassword,
  onBackToLogin,
}: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    try {
      setIsLoading(true);
      await forgotPassword(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campo Código */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
          Código de 6 dígitos recebido
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <FaKey className="size-3.5" />
          </div>
          <Input
            type="text"
            placeholder="123456"
            maxLength={6}
            disabled={isLoading}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11 tracking-widest"
            {...register("code")}
          />
        </div>
        {errors.code && (
          <p className="text-xs text-rose-400 font-mono mt-1">{errors.code.message}</p>
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
            disabled={isLoading}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
            {...register("password")}
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
            disabled={isLoading}
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
        disabled={isLoading}
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold tracking-wide transition-all duration-200 shadow-lg shadow-emerald-950/50 cursor-pointer flex items-center justify-center gap-2 text-sm"
      >
        {isLoading ? (
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

      {onBackToLogin && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Voltar para o Login
          </button>
        </div>
      )}
    </form>
  );
}
