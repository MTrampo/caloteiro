"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInSchema, type UserSignInFormInputs, type SendEmailFormInputs } from "@/commons/models/user";
import { FaArrowRight, FaLock, FaEnvelope, FaKey } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface SignInFormProps {
  signInUser: (data: UserSignInFormInputs) => Promise<void>;
  sendEmailUser?: (data: SendEmailFormInputs) => Promise<void>;
  onForgotPasswordClick?: () => void;
}

export function SignInForm({ signInUser, onForgotPasswordClick }: SignInFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSignInFormInputs>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: UserSignInFormInputs) => {
    try {
      setIsLoading(true);
      await signInUser(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campo E-mail */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center justify-between">
          <span>Seu E-mail</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <FaEnvelope className="size-3.5" />
          </div>
          <Input
            type="email"
            placeholder="investigador@radar.com"
            autoComplete="email"
            disabled={isLoading}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-rose-400 font-mono mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Campo Senha */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            Senha Secreta
          </label>
          {onForgotPasswordClick && (
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Esqueceu a senha?
            </button>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <FaLock className="size-3.5" />
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-rose-400 font-mono mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Botão Entrar */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold tracking-wide transition-all duration-200 shadow-lg shadow-emerald-950/50 cursor-pointer flex items-center justify-center gap-2 text-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Consultando Cofre...</span>
          </>
        ) : (
          <>
            <span>Entrar na Central</span>
            <FaArrowRight className="size-3.5" />
          </>
        )}
      </Button>

      {/* Rodapé / Link de Cadastro */}
      <div className="pt-2 text-center text-xs text-zinc-400 font-mono">
        <span>Ainda não investiga seus devedores? </span>
        <Link
          href="/cadastrar"
          className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
        >
          Criar conta de Investigador
        </Link>
      </div>
    </form>
  );
}

