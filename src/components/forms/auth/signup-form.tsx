"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { signUpSchema } from "@/commons/validations/user";
import type { UserSignUpFormInputs } from "@/commons/models/user";
import { FaArrowRight, FaLock, FaEnvelope, FaUser, FaTag, FaEye, FaEyeSlash } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { formatProperName } from "@/commons/utils/format";

interface SignupFormProps {
  signUpUser: (data: UserSignUpFormInputs) => Promise<void>;
}

export function SignupForm({ signUpUser }: SignupFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserSignUpFormInputs>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      nickname: "",
      email: "",
      password: "",
      acceptedTerms: false,
    },
  });

  const onSubmit = (data: UserSignUpFormInputs) => {
    startTransition(async () => {
      await signUpUser({
        ...data,
        name: formatProperName(data.name),
        nickname: data.nickname ? formatProperName(data.nickname) : data.nickname,
      });
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
      {/* Grid Nome & Apelido */}
      <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Campo Nome */}
        <Field>
          <FieldLabel>
            Nome e Sobrenome
          </FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <FaUser className="size-3.5" />
            </div>
            <Input
              type="text"
              placeholder="Ex: Zenon Barriga"
              autoComplete="name"
              disabled={isPending}
              className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
              {...register("name", {
                onBlur: (e) => {
                  if (e.target.value) setValue("name", formatProperName(e.target.value));
                },
              })}
            />
          </div>
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>

        {/* Campo Apelido */}
        <Field>
          <FieldLabel>
            Apelido / Vulgo
          </FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <FaTag className="size-3.5" />
            </div>
            <Input
              type="text"
              placeholder="Ex: Seu Barriga"
              autoComplete="nickname"
              disabled={isPending}
              className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
              {...register("nickname", {
                onBlur: (e) => {
                  if (e.target.value) setValue("nickname", formatProperName(e.target.value));
                },
              })}
            />
          </div>
          <FieldError errors={errors.nickname ? [errors.nickname] : undefined} />
        </Field>
      </FieldGroup>

      {/* Campo E-mail */}
      <Field>
        <FieldLabel>
          E-mail Principal
        </FieldLabel>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <FaEnvelope className="size-3.5" />
          </div>
          <Input
            type="email"
            placeholder="tubarao@central.com"
            autoComplete="email"
            disabled={isPending}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
            {...register("email")}
          />
        </div>
        <FieldError errors={errors.email ? [errors.email] : undefined} />
      </Field>

      {/* Campo Senha com Alternador de Visibilidade */}
      <Field>
        <FieldLabel>
          Senha de Acesso
        </FieldLabel>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <FaLock className="size-3.5" />
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo de 6 caracteres"
            autoComplete="new-password"
            disabled={isPending}
            className="pl-9 pr-10 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-sm h-11"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={isPending}
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
        <FieldError errors={errors.password ? [errors.password] : undefined} />
      </Field>

      {/* Checkbox de Aceite dos Termos e Políticas */}
      <div className="space-y-1 pt-1">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            disabled={isPending}
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
        <span className="text-emerald-400 font-semibold">Juramento do Tubarão: </span>
        Ao criar conta, prometo nunca mais aceitar &ldquo;na volta a gente acerta&rdquo; sem registrar data e juros.
      </div>

      {/* Botão Cadastrar */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl transition-all duration-200 shadow-lg shadow-white/5 cursor-pointer flex items-center justify-center gap-2 text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin text-zinc-950" />
            <span>Criando Acesso...</span>
          </>
        ) : (
          <>
            <span>Criar Conta</span>
            <FaArrowRight className="size-3.5" />
          </>
        )}
      </Button>

      {/* Rodapé / Link de Login */}
      <div className="pt-2 text-center text-xs text-zinc-400 font-mono">
        <span>Já possui uma conta de tubarão? </span>
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

