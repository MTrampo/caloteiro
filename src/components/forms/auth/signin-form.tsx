"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { signInSchema } from "@/commons/validations/user";
import type { UserSignInFormInputs, SendEmailFormInputs } from "@/commons/models/user";
import { FaArrowRight, FaLock, FaEnvelope } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface SignInFormProps {
  signInUser: (data: UserSignInFormInputs) => Promise<void>;
  sendEmailUser?: (data: SendEmailFormInputs) => Promise<void>;
  onForgotPasswordClick?: () => void;
  defaultEmail?: string;
}

export function SignInForm({
  signInUser,
  onForgotPasswordClick,
  defaultEmail = "",
}: SignInFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserSignInFormInputs>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: defaultEmail,
      password: "",
    },
  });

  React.useEffect(() => {
    if (defaultEmail) {
      setValue("email", defaultEmail);
    }
  }, [defaultEmail, setValue]);

  const onSubmit = (data: UserSignInFormInputs) => {
    startTransition(async () => {
      await signInUser(data);
    });
  };

  return (
    <form
      method="post"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }}
      className="space-y-4"
    >
      {/* Campo E-mail */}
      <Field>
        <FieldLabel>
          E-mail
        </FieldLabel>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <FaEnvelope className="size-3.5" />
          </div>
          <Input
            type="email"
            placeholder="seubarriga@caloteiro.com"
            autoComplete="email"
            disabled={isPending}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
            {...register("email")}
          />
        </div>
        <FieldError errors={errors.email ? [errors.email] : undefined} />
      </Field>

      {/* Campo Senha */}
      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel>
            Senha
          </FieldLabel>
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
            disabled={isPending}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
            {...register("password")}
          />
        </div>
        <FieldError errors={errors.password ? [errors.password] : undefined} />
      </Field>

      {/* Botão Entrar */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl transition-all duration-200 shadow-lg shadow-white/5 cursor-pointer flex items-center justify-center gap-2 text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin text-zinc-950" />
            <span>Acessando a Gruta...</span>
          </>
        ) : (
          <>
            <span>Entrar na Gruta</span>
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
          Criar conta
        </Link>
      </div>
    </form>
  );
}

