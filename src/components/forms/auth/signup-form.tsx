"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpSchema, type UserSignUpFormInputs } from "@/commons/models/user";
import { FaArrowRight, FaLock, FaEnvelope, FaUser, FaTag, FaEye, FaEyeSlash } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface SignupFormProps {
  signUpUser: (data: UserSignUpFormInputs) => Promise<void>;
}

export function SignupForm({ signUpUser }: SignupFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSignUpFormInputs>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      nickname: "",
      email: "",
      password: "",
      acceptedTerms: true,
    },
  });

  const onSubmit = async (data: UserSignUpFormInputs) => {
    try {
      setIsLoading(true);
      await signUpUser(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Grid Nome & Apelido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Campo Nome */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            Nome Completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <FaUser className="size-3.5" />
            </div>
            <Input
              type="text"
              placeholder="Ex: Zenon Barriga"
              autoComplete="name"
              disabled={isLoading}
              className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-400 font-mono mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Campo Apelido */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            Apelido / Vulgo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <FaTag className="size-3.5" />
            </div>
            <Input
              type="text"
              placeholder="Ex: Seu Barriga, Julius"
              autoComplete="nickname"
              disabled={isLoading}
              className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
              {...register("nickname")}
            />
          </div>
          {errors.nickname && (
            <p className="text-xs text-rose-400 font-mono mt-1">{errors.nickname.message}</p>
          )}
        </div>
      </div>

      {/* Campo E-mail */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
          E-mail Principal
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

      {/* Campo Senha com Alternador de Visibilidade */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
          Senha de Acesso
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <FaLock className="size-3.5" />
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo de 6 caracteres"
            autoComplete="new-password"
            disabled={isLoading}
            className="pl-9 pr-10 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={isLoading}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
          >
            {showPassword ? (
              <FaEyeSlash className="size-3.5" />
            ) : (
              <FaEye className="size-3.5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-rose-400 font-mono mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Checkbox de Aceite dos Termos e Políticas */}
      <div className="space-y-1 pt-1">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            disabled={isLoading}
            className="size-4 rounded-sm border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer shrink-0"
            {...register("acceptedTerms")}
          />
          <span className="text-xs font-mono text-zinc-400 leading-normal">
            Li e concordo com os{" "}
            <Link
              href="/termos"
              target="_blank"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              Termos de Serviço
            </Link>{" "}
            e a{" "}
            <Link
              href="/privacidade"
              target="_blank"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {errors.acceptedTerms && (
          <p className="text-xs text-rose-400 font-mono mt-0.5">
            {errors.acceptedTerms.message}
          </p>
        )}
      </div>

      {/* Box cômico de juramento */}
      <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 leading-relaxed">
        <span className="text-emerald-400 font-semibold">Juramento do Investigador: </span>
        Ao criar conta, prometo nunca mais aceitar &ldquo;na volta a gente acerta&rdquo; sem registrar data e juros.
      </div>

      {/* Botão Cadastrar */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold tracking-wide transition-all duration-200 shadow-lg shadow-emerald-950/50 cursor-pointer flex items-center justify-center gap-2 text-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Criando Acesso...</span>
          </>
        ) : (
          <>
            <span>Iniciar Investigação dos Calotes</span>
            <FaArrowRight className="size-3.5" />
          </>
        )}
      </Button>

      {/* Rodapé / Link de Login */}
      <div className="pt-2 text-center text-xs text-zinc-400 font-mono">
        <span>Já possui uma conta de investigador? </span>
        <Link
          href="/entrar"
          className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
        >
          Entrar agora
        </Link>
      </div>
    </form>
  );
}

