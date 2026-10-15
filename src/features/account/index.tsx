"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/commons/models/user";
import {
  updateProfileAccountAction,
  updateEmailAccountAction,
  confirmEmailChangeOtpAction,
  requestPasswordChangeOtpAction,
  confirmUpdatePasswordOtpAction,
} from "@/actions/account";
import { maskPhone } from "@/commons/utils/masks";
import { getNameInitials, formatDate } from "@/commons/utils/format";
import {
  FaUser,
  FaEnvelope,
  FaKey,
  FaCheck,
  FaShieldHalved,
  FaArrowRight,
  FaRotateRight,
} from "react-icons/fa6";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AccountFeatureProps {
  profile: Profile | null;
  accountCreatedAt?: string | null;
}

export function AccountFeature({
  profile,
  accountCreatedAt,
}: AccountFeatureProps) {
  const router = useRouter();

  // Estados do formulário de Perfil
  const [name, setName] = React.useState(profile?.name || "");
  const [nickname, setNickname] = React.useState(profile?.nickname || "");
  const [phone, setPhone] = React.useState(profile?.phone ? maskPhone(profile.phone) : "");
  const [isPendingProfile, startTransitionProfile] = useTransition();

  // Estados do formulário de E-mail
  const [currentEmail, setCurrentEmail] = React.useState(profile?.email || "");
  const [newEmail, setNewEmail] = React.useState("");
  const [emailStep, setEmailStep] = React.useState<"idle" | "awaiting_code">("idle");
  const [emailOtpCode, setEmailOtpCode] = React.useState("");
  const [isPendingEmailRequest, startTransitionEmailRequest] = useTransition();
  const [isPendingEmailConfirm, startTransitionEmailConfirm] = useTransition();

  // Estados do formulário de Senha
  const [passwordStep, setPasswordStep] = React.useState<"idle" | "awaiting_code">("idle");
  const [passwordOtpCode, setPasswordOtpCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isPendingPasswordRequest, startTransitionPasswordRequest] = useTransition();
  const [isPendingPasswordConfirm, startTransitionPasswordConfirm] = useTransition();

  const initials = getNameInitials(name || profile?.name || "Tubarão");

  // Atualização dos dados de perfil
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    startTransitionProfile(async () => {
      const res = await updateProfileAccountAction({
        name,
        nickname: nickname.trim() || null,
        phone: phone.trim() ? phone.replace(/\D/g, "") : null,
      });

      if (res.success) {
        toast.success(res.message || "Perfil atualizado com sucesso!");
        router.refresh();
      } else {
        toast.error(res.error || "Não foi possível atualizar o perfil.");
      }
    });
  };

  // Solicitação de alteração de e-mail (envio do OTP)
  const handleRequestEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error("Informe o novo e-mail.");
      return;
    }

    if (cleanEmail === currentEmail.toLowerCase()) {
      toast.error("O novo e-mail não pode ser igual ao atual.");
      return;
    }

    startTransitionEmailRequest(async () => {
      const res = await updateEmailAccountAction({ newEmail: cleanEmail });

      if (res.success) {
        toast.success(
          res.message || "Código de confirmação enviado para o novo e-mail!"
        );
        setEmailStep("awaiting_code");
      } else {
        toast.error(res.error || "Não foi possível solicitar a alteração de e-mail.");
      }
    });
  };

  // Confirmação do código OTP de e-mail
  const handleConfirmEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOtpCode.length !== 8) {
      toast.error("Digite o código de 8 dígitos completo.");
      return;
    }

    startTransitionEmailConfirm(async () => {
      const res = await confirmEmailChangeOtpAction({
        newEmail: newEmail.trim().toLowerCase(),
        code: emailOtpCode,
      });

      if (res.success) {
        toast.success(res.message || "E-mail atualizado com sucesso!");
        setCurrentEmail(newEmail.trim().toLowerCase());
        setNewEmail("");
        setEmailOtpCode("");
        setEmailStep("idle");
        router.refresh();
      } else {
        toast.error(res.error || "Código de confirmação inválido ou expirado.");
      }
    });
  };

  // Reenvio de código de e-mail
  const handleResendEmailCode = () => {
    if (!newEmail.trim()) return;

    startTransitionEmailRequest(async () => {
      const res = await updateEmailAccountAction({
        newEmail: newEmail.trim().toLowerCase(),
      });

      if (res.success) {
        toast.success("Novo código de confirmação enviado para o novo e-mail!");
      } else {
        toast.error(res.error || "Não foi possível reenviar o código.");
      }
    });
  };

  // Cancelamento da alteração de e-mail
  const handleCancelEmailChange = () => {
    setEmailStep("idle");
    setEmailOtpCode("");
  };

  // Solicitação do código OTP para alteração de senha
  const handleRequestPasswordCode = () => {
    startTransitionPasswordRequest(async () => {
      const res = await requestPasswordChangeOtpAction();

      if (res.success) {
        toast.success(
          res.message || "Código de segurança enviado para o seu e-mail cadastrado!"
        );
        setPasswordStep("awaiting_code");
      } else {
        toast.error(res.error || "Não foi possível enviar o código de segurança.");
      }
    });
  };

  // Confirmação do código OTP e nova senha
  const handleConfirmPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordOtpCode.length !== 8) {
      toast.error("Digite o código de segurança de 8 dígitos.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    startTransitionPasswordConfirm(async () => {
      const res = await confirmUpdatePasswordOtpAction({
        code: passwordOtpCode,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        toast.success(res.message || "Senha atualizada com sucesso!");
        setPasswordStep("idle");
        setPasswordOtpCode("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error || "Não foi possível atualizar a senha.");
      }
    });
  };

  // Reenvio do código OTP de senha
  const handleResendPasswordCode = () => {
    startTransitionPasswordRequest(async () => {
      const res = await requestPasswordChangeOtpAction();

      if (res.success) {
        toast.success("Novo código de segurança enviado para seu e-mail cadastrado!");
      } else {
        toast.error(res.error || "Não foi possível reenviar o código.");
      }
    });
  };

  // Cancelamento da alteração de senha
  const handleCancelPasswordChange = () => {
    setPasswordStep("idle");
    setPasswordOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full min-w-0">
      {/* Cabeçalho da Página Solto (sem card e sem ícones no título) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Minha Conta
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Dados cadastrais do tubarão, credenciais de acesso e segurança da conta.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Formulários de Alteração */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seção 1: Edição de Perfil */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FaUser className="size-3.5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-white">
                  Identificação do Tubarão
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Seu nome de apresentação e contato no sistema
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-300">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome oficial"
                    required
                    className="w-full h-11 bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm rounded-xl px-3.5 outline-none focus:border-zinc-500 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-300">
                    Apelido na Praça (Vulgo)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ex: Vini, Chefe, etc."
                    className="w-full h-11 bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm rounded-xl px-3.5 outline-none focus:border-zinc-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-300">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full h-11 bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm rounded-xl px-3.5 outline-none focus:border-zinc-500 transition-colors font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isPendingProfile}
                  className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl h-11 px-6 text-xs sm:text-sm cursor-pointer shadow-xs transition-all"
                >
                  {isPendingProfile ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Seção 2: Alteração de E-mail de Acesso com Confirmação OTP */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FaEnvelope className="size-3.5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-white">
                  E-mail de Acesso
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Endereço utilizado para login e recebimento de alertas com confirmação OTP
                </p>
              </div>
            </div>

            {emailStep === "idle" ? (
              <form onSubmit={handleRequestEmailChange} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-zinc-400">
                      E-mail Atual
                    </label>
                    <input
                      type="email"
                      value={currentEmail}
                      disabled
                      className="w-full h-11 bg-zinc-950/30 border border-zinc-800/60 text-zinc-400 text-xs sm:text-sm rounded-xl px-3.5 outline-none font-mono cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-zinc-300">
                      Novo E-mail
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="novo.email@exemplo.com"
                      required
                      className="w-full h-11 bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm rounded-xl px-3.5 outline-none focus:border-zinc-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Por medidas de segurança, um código de verificação OTP de 8 dígitos será enviado ao novo endereço antes da confirmação.
                </p>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={isPendingEmailRequest || !newEmail.trim()}
                    className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl h-11 px-6 text-xs sm:text-sm cursor-pointer shadow-xs transition-all"
                  >
                    {isPendingEmailRequest ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Enviando código...</span>
                      </div>
                    ) : (
                      "Solicitar Alteração de E-mail"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmEmailChange} className="space-y-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
                  <p className="text-xs font-mono font-bold text-emerald-300">
                    Código de verificação enviado!
                  </p>
                  <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                    Enviamos um código de 8 dígitos para o e-mail:{" "}
                    <span className="text-white font-bold">{newEmail}</span>.
                    Você também pode clicar no link de confirmação recebido diretamente na sua caixa de entrada.
                  </p>
                </div>

                <div className="space-y-2 flex flex-col items-center sm:items-start py-2">
                  <label className="text-xs font-mono font-bold text-zinc-300">
                    Código de 8 dígitos
                  </label>
                  <InputOTP
                    maxLength={8}
                    value={emailOtpCode}
                    onChange={setEmailOtpCode}
                    disabled={isPendingEmailConfirm}
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
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleResendEmailCode}
                      disabled={isPendingEmailRequest}
                      className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <FaRotateRight className={`size-3 ${isPendingEmailRequest ? "animate-spin" : ""}`} />
                      <span>Reenviar código</span>
                    </button>
                    <span className="text-zinc-700">|</span>
                    <button
                      type="button"
                      onClick={handleCancelEmailChange}
                      className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      Corrigir e-mail
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPendingEmailConfirm || emailOtpCode.length !== 8}
                    className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl h-11 px-6 text-xs sm:text-sm cursor-pointer shadow-xs transition-all"
                  >
                    {isPendingEmailConfirm ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Validando código...</span>
                      </div>
                    ) : (
                      "Confirmar Novo E-mail"
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Alerta de Segurança e Suporte Meu Trampo para E-mail */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <FaShieldHalved className="size-4" />
              </div>
              <div className="flex-1 space-y-1 text-xs font-mono text-zinc-300">
                <p className="font-bold text-amber-300">
                  Perdeu o acesso ao seu e-mail cadastrado?
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Para garantir a segurança da conta e evitar invasões, caso tenha perdido o acesso definitivo ao seu endereço atual, entre em contato imediatamente com nosso suporte oficial pelos canais do{" "}
                  <a
                    href="https://meutrampo.dev.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 underline font-bold transition-colors inline-flex items-center gap-1"
                  >
                    Meu Trampo (meutrampo.dev.br)
                  </a>{" "}
                  para validação manual da titularidade.
                </p>
              </div>
            </div>
          </div>

          {/* Seção 3: Troca de Senha com Confirmação OTP */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FaKey className="size-3.5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-white">
                  Troca de Senha
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Defina uma nova credencial protegida por confirmação de segurança via OTP
                </p>
              </div>
            </div>

            {passwordStep === "idle" ? (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed">
                  Para proteger seu cofre contra acessos não autorizados, a alteração de senha requer um código de segurança de uso único enviado para o seu e-mail cadastrado (
                  <span className="text-white font-bold">{currentEmail}</span>).
                </p>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    onClick={handleRequestPasswordCode}
                    disabled={isPendingPasswordRequest}
                    className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl h-11 px-6 text-xs sm:text-sm cursor-pointer shadow-xs transition-all"
                  >
                    {isPendingPasswordRequest ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Enviando código...</span>
                      </div>
                    ) : (
                      "Solicitar Código por E-mail"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmPasswordChange} className="space-y-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
                  <p className="text-xs font-mono font-bold text-emerald-300">
                    Código de segurança enviado!
                  </p>
                  <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                    Insira o código de 8 dígitos enviado para{" "}
                    <span className="text-white font-bold">{currentEmail}</span>{" "}
                    e defina sua nova senha abaixo.
                  </p>
                </div>

                {/* Campo de Código OTP */}
                <div className="space-y-2 flex flex-col items-center sm:items-start py-2">
                  <label className="text-xs font-mono font-bold text-zinc-300">
                    Código de Segurança (8 dígitos)
                  </label>
                  <InputOTP
                    maxLength={8}
                    value={passwordOtpCode}
                    onChange={setPasswordOtpCode}
                    disabled={isPendingPasswordConfirm}
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-zinc-300">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="w-full h-11 bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm rounded-xl px-3.5 outline-none focus:border-zinc-500 transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-zinc-300">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      required
                      minLength={6}
                      className="w-full h-11 bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm rounded-xl px-3.5 outline-none focus:border-zinc-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleResendPasswordCode}
                      disabled={isPendingPasswordRequest}
                      className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <FaRotateRight className={`size-3 ${isPendingPasswordRequest ? "animate-spin" : ""}`} />
                      <span>Reenviar código</span>
                    </button>
                    <span className="text-zinc-700">|</span>
                    <button
                      type="button"
                      onClick={handleCancelPasswordChange}
                      className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      isPendingPasswordConfirm ||
                      passwordOtpCode.length !== 8 ||
                      !newPassword ||
                      !confirmPassword
                    }
                    className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl h-11 px-6 text-xs sm:text-sm cursor-pointer shadow-xs transition-all"
                  >
                    {isPendingPasswordConfirm ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Atualizando senha...</span>
                      </div>
                    ) : (
                      "Confirmar Nova Senha"
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Alerta de Segurança e Suporte Meu Trampo para Senha */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <FaShieldHalved className="size-4" />
              </div>
              <div className="flex-1 space-y-1 text-xs font-mono text-zinc-300">
                <p className="font-bold text-amber-300">
                  Perdeu o acesso ao seu e-mail cadastrado?
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Por medidas rigorosas de proteção contra invasão de contas e fraudes, caso não consiga acessar sua caixa postal, entre em contato imediatamente com o suporte através dos canais oficiais do{" "}
                  <a
                    href="https://meutrampo.dev.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 underline font-bold transition-colors inline-flex items-center gap-1"
                  >
                    Meu Trampo (meutrampo.dev.br)
                  </a>{" "}
                  para auxílio com verificação manual de titularidade.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 3: Card de Identificação e Segurança */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="size-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-lg text-white shadow-xs">
                {initials}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-heading text-base font-bold text-white truncate">
                  {name || "Tubarão"}
                </h4>
                <p className="text-xs font-mono text-zinc-400 truncate">
                  {currentEmail}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-zinc-800 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Status da Conta</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <FaCheck className="size-3" />
                  Ativa &amp; Segura
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400">
                <span>No comando desde</span>
                <span className="text-zinc-200">
                  {accountCreatedAt ? formatDate(accountCreatedAt) : "Data de cadastro"}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400">
                <span>Termos de Uso</span>
                <span className="text-emerald-400">Aceitos</span>
              </div>
            </div>
          </div>

          {/* Dica de Segurança e Proteção de Dados */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-2 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <FaShieldHalved className="size-3.5 text-emerald-400" />
              <span>Privacidade &amp; Proteção</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Seus dados de cobrança e informações de devedores são isolados com Row Level Security (RLS) e criptografia de ponta a ponta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
