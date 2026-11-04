"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FaLink,
  FaCopy,
  FaRotate,
  FaPen,
  FaPowerOff,
  FaArrowUpRightFromSquare,
  FaWhatsapp,
  FaLock,
  FaCrown,
  FaCheck,
  FaSpinner,
  FaChevronDown,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/commons/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateDebtPortalConfigAction } from "@/actions/debts";

interface DebtPortalMenuProps {
  debtId: string;
  debtTitle: string;
  debtorName: string;
  initialEnabled: boolean;
  initialAccessCode: string;
  canDebtorPortal: boolean;
  onUpdated?: () => void;
  isMobileDialogOpen?: boolean;
  onMobileDialogOpenChange?: (open: boolean) => void;
}

export function DebtPortalMenu({
  debtId,
  debtTitle,
  debtorName,
  initialEnabled,
  initialAccessCode,
  canDebtorPortal,
  onUpdated,
  isMobileDialogOpen: propsIsMobileDialogOpen,
  onMobileDialogOpenChange,
}: DebtPortalMenuProps) {
  const [enabled, setEnabled] = React.useState(initialEnabled);
  const [accessCode, setAccessCode] = React.useState(initialAccessCode);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [isCustomCodeOpen, setIsCustomCodeOpen] = React.useState(false);
  const [customCodeInput, setCustomCodeInput] = React.useState(initialAccessCode);
  const [internalMobileDialogOpen, setInternalMobileDialogOpen] = React.useState(false);

  // Sincroniza estados quando as props da dívida forem revalidadas
  React.useEffect(() => {
    setEnabled(initialEnabled);
  }, [initialEnabled]);

  React.useEffect(() => {
    setAccessCode(initialAccessCode);
    setCustomCodeInput(initialAccessCode);
  }, [initialAccessCode]);

  const isMobileDialogOpen =
    propsIsMobileDialogOpen !== undefined
      ? propsIsMobileDialogOpen
      : internalMobileDialogOpen;
  const setIsMobileDialogOpen =
    onMobileDialogOpenChange || setInternalMobileDialogOpen;

  const getInvoiceUrl = () => {
    if (typeof window === "undefined") return `/fatura/${debtId}`;
    return `${window.location.origin}/fatura/${debtId}`;
  };

  const handleToggleEnabled = () => {
    const nextState = !enabled;
    startTransition(async () => {
      const res = await updateDebtPortalConfigAction({
        debtId,
        publicLinkEnabled: nextState,
      });

      if (res.success && res.data) {
        setEnabled(res.data.publicLinkEnabled);
        setAccessCode(res.data.publicAccessCode);
        toast.success(
          res.data.publicLinkEnabled
            ? "Link da fatura habilitado! Agora você pode enviar para o devedor."
            : "Link da fatura desabilitado. O acesso externo foi trancado."
        );
        onUpdated?.();
      } else {
        toast.error(res.error || "Não foi possível alterar o status do link.");
      }
    });
  };

  const handleRegenerateCode = () => {
    startTransition(async () => {
      const res = await updateDebtPortalConfigAction({
        debtId,
        publicLinkEnabled: enabled,
        regenerateCode: true,
      });

      if (res.success && res.data) {
        setEnabled(res.data.publicLinkEnabled);
        setAccessCode(res.data.publicAccessCode);
        setCustomCodeInput(res.data.publicAccessCode);
        navigator.clipboard.writeText(res.data.publicAccessCode);
        toast.success(
          `Novo código gerado e copiado: ${res.data.publicAccessCode}`
        );
        onUpdated?.();
      } else {
        toast.error(res.error || "Não foi possível gerar novo código.");
      }
    });
  };

  const handleSaveCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customCodeInput.trim().toUpperCase();
    if (cleaned.length < 4 || cleaned.length > 16) {
      toast.error("O código deve ter entre 4 e 16 caracteres.");
      return;
    }

    startTransition(async () => {
      const res = await updateDebtPortalConfigAction({
        debtId,
        publicLinkEnabled: enabled,
        publicAccessCode: cleaned,
      });

      if (res.success && res.data) {
        setEnabled(res.data.publicLinkEnabled);
        setAccessCode(res.data.publicAccessCode);
        setIsCustomCodeOpen(false);
        toast.success(`Código de acesso atualizado para: ${res.data.publicAccessCode}`);
        onUpdated?.();
      } else {
        toast.error(res.error || "Não foi possível salvar o código personalizado.");
      }
    });
  };

  const handleCopyUrl = () => {
    const url = getInvoiceUrl();
    navigator.clipboard.writeText(url);
    toast.success("Link da fatura copiado para a área de transferência!");
  };

  const handleCopyCode = () => {
    if (!accessCode) return;
    navigator.clipboard.writeText(accessCode);
    setCopiedCode(true);
    toast.success(`Código copiado (${accessCode})!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInviteForWhatsApp = () => {
    const url = getInvoiceUrl();
    const firstName = debtorName.split(" ")[0] || debtorName;
    const message =
      `Olá, ${firstName}! Segue o link privado para você acompanhar os valores e parcelas do nosso acordo (${debtTitle}):\n\n` +
      `Link da fatura: ${url}\n` +
      `Código de acesso exclusivo: *${accessCode}*\n\n` +
      `Pode ficar tranquilo(a), a página é protegida por código e somente quem tem esse código consegue visualizar.`;

    navigator.clipboard.writeText(message);
    toast.success("Convite completo (Link + Código) copiado! Pronto para colar no WhatsApp.");
  };

  return (
    <>
      {/* 1. TRIGGER DESKTOP (DropdownMenu Padrão) */}
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isPending}
                className="bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white font-mono text-xs gap-2.5 cursor-pointer"
              />
            }
          >
            {isPending ? (
              <FaSpinner className="size-3.5 animate-spin text-zinc-400" />
            ) : !canDebtorPortal ? (
              <FaLock className="size-3.5 text-amber-400" />
            ) : (
              <span
                className={`size-2 rounded-full shrink-0 ${
                  enabled ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-zinc-600"
                }`}
              />
            )}
            <FaLink className="size-3.5 text-zinc-400" />
            <span>Link da Fatura</span>
            <FaChevronDown className="size-3 text-zinc-500 ml-0.5" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[calc(100vw-2rem)] max-w-xs sm:w-80 sm:min-w-72 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-200 p-1.5 shadow-xl max-h-[85vh] overflow-y-auto"
            align="end"
            sideOffset={6}
          >
            {/* Cabeçalho de Status no estilo nav-user */}
            <div className="px-2.5 py-2 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading text-xs font-bold text-white">
                  Fatura Pública (/fatura)
                </span>
                {!canDebtorPortal ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Bloqueado
                  </span>
                ) : enabled ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Habilitado
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Desabilitado
                  </span>
                )}
              </div>

              {canDebtorPortal ? (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Clique para copiar o código de acesso"
                  className="w-full flex items-center justify-between gap-2 rounded-lg bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1.5 text-xs font-mono transition-colors cursor-pointer group"
                >
                  <span className="text-zinc-400 text-[11px]">Código atual:</span>
                  {copiedCode ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                      <FaCheck className="size-3" />
                      <span>Código copiado!</span>
                    </span>
                  ) : (
                    <span className="font-bold text-white tracking-widest flex items-center gap-1.5">
                      <span>{accessCode || "------"}</span>
                      <FaCopy className="size-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </span>
                  )}
                </button>
              ) : (
                <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                  Disponível a partir do plano <strong className="text-white">Tubarão Branco</strong> e <strong className="text-white">Tubarão Cabeça Chato</strong>.
                </p>
              )}
            </div>

            <DropdownMenuSeparator className="bg-zinc-800" />

            {!canDebtorPortal ? (
              <DropdownMenuGroup>
                <DropdownMenuItem
                  render={<Link href="/painel/conta/assinatura" />}
                  className="flex items-center gap-2 cursor-pointer text-amber-400 hover:text-amber-300 font-mono text-xs py-2"
                >
                  <FaCrown className="size-3.5" />
                  <span>Fazer Upgrade para Liberar</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            ) : (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={handleToggleEnabled}
                    disabled={isPending}
                    className="flex items-center gap-2.5 cursor-pointer text-zinc-200 hover:text-white font-mono text-xs py-2"
                  >
                    <FaPowerOff
                      className={`size-3.5 ${
                        enabled ? "text-rose-400" : "text-emerald-400"
                      }`}
                    />
                    <span>
                      {enabled ? "Desabilitar Link Público" : "Habilitar Link Público"}
                    </span>
                  </DropdownMenuItem>

                  {enabled && (
                    <>
                      <DropdownMenuItem
                        onClick={handleCopyInviteForWhatsApp}
                        className="flex items-center gap-2.5 cursor-pointer text-emerald-400 hover:text-emerald-300 font-mono text-xs py-2"
                      >
                        <FaWhatsapp className="size-3.5" />
                        <span>Copiar Link + Código p/ WhatsApp</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={handleCopyUrl}
                        className="flex items-center gap-2.5 cursor-pointer text-zinc-300 hover:text-white font-mono text-xs py-2"
                      >
                        <FaCopy className="size-3.5 text-zinc-400" />
                        <span>Copiar Apenas o Link</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-zinc-800" />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={handleRegenerateCode}
                    disabled={isPending}
                    className="flex items-center gap-2.5 cursor-pointer text-zinc-300 hover:text-white font-mono text-xs py-2"
                  >
                    <FaRotate className="size-3.5 text-zinc-400" />
                    <span>Gerar Novo Código Aleatório</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      setCustomCodeInput(accessCode);
                      setIsCustomCodeOpen(true);
                    }}
                    className="flex items-center gap-2.5 cursor-pointer text-zinc-300 hover:text-white font-mono text-xs py-2"
                  >
                    <FaPen className="size-3.5 text-zinc-400" />
                    <span>Personalizar Código...</span>
                  </DropdownMenuItem>

                  {enabled && (
                    <DropdownMenuItem
                      render={
                        <a
                          href={`/fatura/${debtId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                      className="flex items-center gap-2.5 cursor-pointer text-zinc-300 hover:text-white font-mono text-xs py-2"
                    >
                      <FaArrowUpRightFromSquare className="size-3.5 text-zinc-400" />
                      <span>Abrir Página da Fatura</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. TRIGGER MOBILE (Abre Direto o Modal de Gestão da Fatura) */}
      <div className="sm:hidden w-full">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isPending}
          onClick={() => setIsMobileDialogOpen(true)}
          className="w-full bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white font-mono text-xs gap-2.5 cursor-pointer justify-between h-10 px-3 rounded-xl"
        >
          <div className="flex items-center gap-2 truncate">
            {isPending ? (
              <FaSpinner className="size-3.5 animate-spin text-zinc-400 shrink-0" />
            ) : !canDebtorPortal ? (
              <FaLock className="size-3.5 text-amber-400 shrink-0" />
            ) : (
              <span
                className={`size-2 rounded-full shrink-0 ${
                  enabled ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-zinc-600"
                }`}
              />
            )}
            <FaLink className="size-3.5 text-zinc-400 shrink-0" />
            <span className="font-bold text-white">Link da Fatura</span>
            {enabled ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0">
                Habilitado
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                Desabilitado
              </span>
            )}
          </div>
          <FaChevronDown className="size-3 text-zinc-500 ml-1 shrink-0" />
        </Button>
      </div>

      {/* 3. MODAL COMPLETO DE GESTÃO DO LINK DA FATURA NO MOBILE */}
      <Dialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100 p-4 sm:p-6 space-y-3.5 max-h-[calc(100dvh-2.5rem)] overflow-y-auto">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <FaLink className="size-4 text-emerald-400" />
              <span>Link da Fatura Pública</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-zinc-400 leading-relaxed">
              Página privada para a presa acompanhar parcelas e Pix do acordo com segurança.
            </DialogDescription>
          </DialogHeader>

          {/* Status do Link com Toggle */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`size-2.5 rounded-full shrink-0 ${
                  !canDebtorPortal
                    ? "bg-amber-400"
                    : enabled
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    : "bg-zinc-600"
                }`}
              />
              <div className="min-w-0">
                <span className="font-heading text-xs font-bold text-white block">
                  Status da Fatura
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 truncate block">
                  {!canDebtorPortal
                    ? "Bloqueado no Plano"
                    : enabled
                    ? "Acesso Liberado com Código"
                    : "Acesso Trancado"}
                </span>
              </div>
            </div>

            {canDebtorPortal && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={handleToggleEnabled}
                className={cn(
                  "h-7 sm:h-8 px-2.5 text-[11px] sm:text-xs font-mono font-bold cursor-pointer shrink-0 w-full sm:w-auto justify-center",
                  enabled
                    ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                )}
              >
                <FaPowerOff className="size-3 mr-1" />
                <span>{enabled ? "Desabilitar" : "Habilitar"}</span>
              </Button>
            )}
          </div>

          {!canDebtorPortal ? (
            /* Bloqueio de Plano Free */
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3 text-center">
              <p className="text-xs font-mono text-amber-300 leading-relaxed">
                O portal de acompanhamento público da presa é exclusivo para os planos <strong>Tubarão Branco</strong> e <strong>Tubarão Cabeça Chata</strong>.
              </p>
              <Button
                render={<Link href="/painel/conta/assinatura" />}
                size="sm"
                className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl h-10"
              >
                <FaCrown className="size-3.5 mr-1.5 text-amber-500" />
                <span>Evoluir Espécie de Tubarão</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Caixa de Código de Acesso */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 sm:p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Código de Acesso:</span>
                  {copiedCode ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <FaCheck className="size-3" /> Copiado!
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 min-w-0">
                  <span className="font-mono text-base sm:text-lg font-black tracking-widest text-white truncate min-w-0">
                    {accessCode || "------"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="h-8 px-2.5 text-xs font-mono font-bold bg-zinc-950 border-zinc-700 text-zinc-200 hover:bg-zinc-800 cursor-pointer shrink-0"
                  >
                    <FaCopy className="size-3 mr-1" />
                    <span>Copiar</span>
                  </Button>
                </div>

                {/* Ações do Código: Gerar Novo ou Personalizar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={handleRegenerateCode}
                    className="h-8 text-xs px-2 font-mono border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer justify-center"
                  >
                    <FaRotate className="size-3 mr-1.5 shrink-0 text-zinc-400" />
                    <span>Novo Aleatório</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCustomCodeInput(accessCode);
                      setIsCustomCodeOpen(true);
                    }}
                    className="h-8 text-xs px-2 font-mono border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer justify-center"
                  >
                    <FaPen className="size-3 mr-1.5 shrink-0 text-zinc-400" />
                    <span>Personalizar</span>
                  </Button>
                </div>
              </div>

              {/* Compartilhamento no WhatsApp (Se habilitado) */}
              {enabled && (
                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    size="default"
                    onClick={handleCopyInviteForWhatsApp}
                    className="w-full min-h-10 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono text-[11px] sm:text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 leading-tight text-center"
                  >
                    <FaWhatsapp className="size-3.5 shrink-0" />
                    <span>Copiar Convite (WhatsApp)</span>
                  </Button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyUrl}
                      className="h-8 text-xs font-mono border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer justify-center"
                    >
                      <FaCopy className="size-3 mr-1.5 text-zinc-400 shrink-0" />
                      <span>Copiar Link</span>
                    </Button>

                    <Button
                      render={
                        <a
                          href={`/fatura/${debtId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-mono border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer justify-center"
                    >
                      <FaArrowUpRightFromSquare className="size-3 mr-1.5 text-zinc-400 shrink-0" />
                      <span>Ver Fatura</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 4. MODAL PARA PERSONALIZAR O CÓDIGO DE ACESSO */}
      <Dialog open={isCustomCodeOpen} onOpenChange={setIsCustomCodeOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-md bg-zinc-900 border-zinc-800 p-4 sm:p-6 space-y-4 max-h-[calc(100dvh-2.5rem)] overflow-y-auto">
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="font-heading text-lg font-bold text-white">
              Personalizar Código da Fatura
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-zinc-400 leading-relaxed">
              Defina um código exclusivo (de 4 a 16 caracteres) para proteger o acesso à fatura desta dívida.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCustomCode} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="custom-access-code"
                className="text-xs font-mono text-zinc-300 block"
              >
                Novo Código de Acesso
              </label>
              <Input
                id="custom-access-code"
                type="text"
                maxLength={16}
                value={customCodeInput}
                onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                placeholder="Ex: PIX2026 ou 849201"
                disabled={isPending}
                className="bg-zinc-950 border-zinc-800 text-white font-mono text-sm tracking-widest uppercase h-11"
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-mono font-bold text-xs rounded-xl h-10 px-5 cursor-pointer"
              >
                {isPending ? (
                  <FaSpinner className="size-3.5 animate-spin" />
                ) : (
                  <FaCheck className="size-3.5" />
                )}
                <span>Salvar Código</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

