"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { DebtDetailsFormatted } from "@/commons/models/debt";
import {
  updateDebtAgreementRulesAction,
  updateDebtBreachStatusAction,
} from "@/actions/debts";
import {
  FaScaleBalanced,
  FaTriangleExclamation,
  FaGavel,
  FaWhatsapp,
  FaCopy,
  FaCheck,
  FaPenToSquare,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaRotateLeft,
  FaXmark,
  FaSpinner,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AgreementRulesCardProps {
  debt: DebtDetailsFormatted;
  isFreePlan: boolean;
  onUpdated: () => void;
}

const QUICK_CLAUSE_TEMPLATES = [
  {
    label: "Quebra na 3ª parcela",
    text: "Se 2 parcelas não forem pagas (seguidas ou alternadas), na 3ª parcela vencida o acordo é quebrado, ocorrendo vencimento antecipado das demais com acréscimo de juros e encaminhamento ao fórum.",
    suggestedMaxLate: 3,
  },
  {
    label: "Acordo Judicial / Fórum",
    text: "Acordo Judicial homologado (Processo nº ___). O atraso ou descumprimento das parcelas acarretará multa contratual e execução imediata nos autos.",
    suggestedMaxLate: 2,
  },
  {
    label: "Perda de Desconto",
    text: "O pagamento pontual garante as condições deste acordo. Em caso de atraso acumulado, o desconto concedido será cancelado e o valor original reestabelecido.",
    suggestedMaxLate: 1,
  },
];

export function AgreementRulesCard({
  debt,
  isFreePlan,
  onUpdated,
}: AgreementRulesCardProps) {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [notes, setNotes] = React.useState(debt.notes || "");
  const [maxLate, setMaxLate] = React.useState<number | null>(
    debt.maxLateInstallments
  );
  const [showOnInvoice, setShowOnInvoice] = React.useState(
    debt.showNotesOnInvoice
  );
  const [isPending, startTransition] = React.useTransition();
  const [copiedAlertMsg, setCopiedAlertMsg] = React.useState(false);

  const handleOpenEdit = () => {
    setNotes(debt.notes || "");
    setMaxLate(debt.maxLateInstallments);
    setShowOnInvoice(debt.showNotesOnInvoice);
    setIsEditOpen(true);
  };

  const hasRulesConfigured =
    Boolean(debt.notes && debt.notes.trim().length > 0) ||
    debt.maxLateInstallments !== null;

  // Mensagem firme de cobrança para Zona de Risco ou Quebra de Acordo
  const breachWhatsAppMessage = React.useMemo(() => {
    const clausesSnippet =
      debt.notes && debt.notes.trim()
        ? ` Conforme as regras estabelecidas ("${debt.notes.trim()}"),`
        : "";

    if (debt.breachStatus === "breached") {
      return `Olá ${debt.debtor.formattedName}. Constam ${debt.lateInstallmentsCount} ${
        debt.lateInstallmentsCount === 1 ? "parcela vencida" : "parcelas vencidas"
      } no acordo "${debt.title}" (saldo pendente de ${debt.formattedRemainingAmount}).${clausesSnippet} o limite de tolerância do acordo foi atingido e o acordo entrou em quebra. Entre em contato imediatamente para regularizar antes do encaminhamento das medidas cabíveis.`;
    }

    return `Olá ${debt.debtor.formattedName}. Atenção ao acordo "${debt.title}": você já possui ${debt.lateInstallmentsCount} de ${debt.maxLateInstallments} parcelas toleradas em atraso.${clausesSnippet} se mais 1 parcela vencer sem pagamento, ocorrerá a quebra imediata do acordo. Regularize via Pix para manter o acordo ativo.`;
  }, [debt]);

  const cleanPhone = (debt.debtor.phone || "").replace(/\D/g, "");
  const whatsAppAlertUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(breachWhatsAppMessage)}`
    : null;

  const handleCopyAlertMessage = () => {
    navigator.clipboard.writeText(breachWhatsAppMessage);
    setCopiedAlertMsg(true);
    toast.success("Notificação de quebra/risco copiada!");
    setTimeout(() => setCopiedAlertMsg(false), 2000);
  };

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateDebtAgreementRulesAction({
        debtId: debt.id,
        notes: notes.trim() || null,
        maxLateInstallments: maxLate,
        showNotesOnInvoice: showOnInvoice,
      });

      if (!res.success) {
        toast.error(res.error || "Não foi possível salvar as regras do acordo.");
        return;
      }

      toast.success(
        res.message || "Cláusulas e gatilho de quebra salvos com sucesso!"
      );
      setIsEditOpen(false);
      onUpdated();
    });
  };

  const handleToggleBreachStatus = (isBreached: boolean) => {
    startTransition(async () => {
      const res = await updateDebtBreachStatusAction({
        debtId: debt.id,
        isBreached,
      });

      if (!res.success) {
        toast.error(res.error || "Não foi possível alterar o status do acordo.");
        return;
      }

      toast.success(
        res.message ||
          (isBreached
            ? "Quebra de acordo declarada!"
            : "Acordo reaberto com sucesso!")
      );
      onUpdated();
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. BANNER CRÍTICO DE QUEBRA DE ACORDO OU ZONA DE RISCO */}
      {!debt.isFullySettled && debt.breachStatus === "breached" && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4 sm:p-5 space-y-3 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <FaGavel className="size-4" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-rose-400">
                    Alerta Vermelho: Quebra de Acordo Atingida!
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {debt.status === "defaulted"
                      ? "Quebra Oficial Declarada"
                      : `${debt.lateInstallmentsCount}/${debt.maxLateInstallments} Parcelas Vencidas`}
                  </span>
                </div>

                <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                  {debt.status === "defaulted"
                    ? `Este acordo com ${debt.debtor.formattedName} foi marcado em Quebra de Acordo / Calote. Hora de mostrar os dentes ou encaminhar para execução no fórum.`
                    : `O limite de tolerância de ${debt.maxLateInstallments} ${
                        debt.maxLateInstallments === 1
                          ? "parcela em atraso"
                          : "parcelas em atraso"
                      } foi atingido (${debt.lateInstallmentsCount} vencidas atualmente). As condições de quebra previstas no acordo já podem ser acionadas!`}
                </p>
              </div>
            </div>

            {/* Ações Rápidas da Quebra */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {whatsAppAlertUrl && (
                <a
                  href={whatsAppAlertUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  <FaWhatsapp className="size-3.5" />
                  <span>Notificar Quebra no WhatsApp</span>
                </a>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyAlertMessage}
                className="h-9 text-xs font-mono border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
              >
                {copiedAlertMsg ? (
                  <FaCheck className="size-3 text-emerald-400" />
                ) : (
                  <FaCopy className="size-3" />
                )}
                <span>Copiar Aviso</span>
              </Button>

              {!isFreePlan &&
                (debt.status !== "defaulted" ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleToggleBreachStatus(true)}
                    className="h-9 bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold text-xs rounded-xl cursor-pointer"
                  >
                    <FaGavel className="size-3" />
                    <span>Declarar Quebra Oficial</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleToggleBreachStatus(false)}
                    className="h-9 text-xs font-mono border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                  >
                    <FaRotateLeft className="size-3" />
                    <span>Reabrir Acordo</span>
                  </Button>
                ))}
            </div>
          </div>
        </div>
      )}

      {!debt.isFullySettled && debt.breachStatus === "warning" && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <FaTriangleExclamation className="size-4" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-amber-400">
                    Zona de Risco: A 1 Parcela da Quebra do Acordo
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {debt.lateInstallmentsCount} de {debt.maxLateInstallments} vencidas
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                  {debt.debtor.formattedName} já acumulou{" "}
                  <strong>{debt.lateInstallmentsCount}</strong>{" "}
                  {debt.lateInstallmentsCount === 1
                    ? "parcela em atraso"
                    : "parcelas em atraso"}
                  . Se a próxima parcela vencer sem pagamento, atingirá o gatilho de{" "}
                  <strong>{debt.maxLateInstallments} parcelas</strong> e o acordo entrará em quebra!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {whatsAppAlertUrl && (
                <a
                  href={whatsAppAlertUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-heading text-xs font-bold transition-colors cursor-pointer"
                >
                  <FaWhatsapp className="size-3.5" />
                  <span>Mandar Aviso de Risco</span>
                </a>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyAlertMessage}
                className="h-9 text-xs font-mono border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              >
                {copiedAlertMsg ? (
                  <FaCheck className="size-3 text-emerald-400" />
                ) : (
                  <FaCopy className="size-3" />
                )}
                <span>Copiar Aviso</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CARD DE CLÁUSULAS, REGRAS E GATILHO DO ACORDO */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 text-amber-400">
              <FaScaleBalanced className="size-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-sm sm:text-base font-bold text-white">
                  Cláusulas e Gatilho de Quebra do Acordo
                </h3>
                {debt.maxLateInstallments !== null && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                    Tolerância: {debt.maxLateInstallments}{" "}
                    {debt.maxLateInstallments === 1 ? "parcela" : "parcelas"}
                  </span>
                )}
                {hasRulesConfigured && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 inline-flex items-center gap-1">
                    {debt.showNotesOnInvoice ? (
                      <>
                        <FaEye className="size-2.5 text-emerald-400" />
                        <span>Visível na fatura da presa</span>
                      </>
                    ) : (
                      <>
                        <FaEyeSlash className="size-2.5 text-zinc-400" />
                        <span>Apenas controle interno</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-zinc-400">
                Regras específicas, número de processo e condições de vencimento antecipado ou multa.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isFreePlan ? (
              <Link
                href="/painel/assinatura"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-mono font-semibold transition-colors"
              >
                <FaLock className="size-3" />
                <span>Liberar no Tubarão Branco</span>
              </Link>
            ) : (
              <>
                {!debt.isFullySettled &&
                  debt.breachStatus !== "breached" &&
                  debt.status !== "defaulted" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleToggleBreachStatus(true)}
                      className="h-8 text-xs font-mono border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <FaGavel className="size-3" />
                      <span>Marcar Quebra de Acordo</span>
                    </Button>
                  )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenEdit}
                  className="h-8 text-xs font-mono bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                >
                  <FaPenToSquare className="size-3" />
                  <span>
                    {hasRulesConfigured
                      ? "Editar Cláusulas"
                      : "Configurar Cláusulas"}
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>

        {debt.notes && debt.notes.trim().length > 0 ? (
          <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/90 p-3.5 text-xs font-mono text-zinc-200 leading-relaxed whitespace-pre-line">
            {debt.notes}
          </div>
        ) : (
          <p className="text-xs font-mono text-zinc-500 pt-1">
            Nenhuma cláusula específica ou condição jurídica foi anotada para este acordo ainda.
          </p>
        )}
      </div>

      {/* Modal de Edição de Cláusulas e Gatilho (Regra #7: Apenas botão principal branco no rodapé, sem botão redundante de cancelar) */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-white">
              Cláusulas e Gatilho de Quebra
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-zinc-400">
              Configure quantas parcelas vencidas disparam o alerta de quebra e descreva as regras deste acordo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRules} className="space-y-4 pt-2">
            {/* Gatilho de Parcelas Vencidas */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-300 block font-medium">
                Limite de Tolerância (Parcelas em Atraso):
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMaxLate(null)}
                  className={`text-xs font-mono px-3 h-9 rounded-xl border transition-colors cursor-pointer ${
                    maxLate === null
                      ? "bg-white text-zinc-950 font-bold border-white"
                      : "bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
                  }`}
                >
                  Sem gatilho
                </button>
                {[1, 2, 3, 4, 5]
                  .filter((n) => n <= Math.max(1, debt.totalInstallmentsCount))
                  .map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setMaxLate(count)}
                      className={`text-xs font-mono px-3 h-9 rounded-xl border transition-colors cursor-pointer ${
                        maxLate === count
                          ? "bg-amber-400 text-zinc-950 font-bold border-amber-400"
                          : "bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
                      }`}
                    >
                      {count} {count === 1 ? "parcela" : "parcelas"}
                    </button>
                  ))}
              </div>
            </div>

            {/* Texto das Cláusulas / Regras */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-zinc-300 font-medium">
                  Regras, Condições ou Nº do Processo:
                </label>
                <span className="text-[10px] font-mono text-zinc-500">
                  {notes.length}/1000
                </span>
              </div>

              <textarea
                rows={4}
                maxLength={1000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Se 2 parcelas não forem pagas (seguidas ou não), na 3ª as demais vencem com acréscimo de juros e o desfecho seguirá no fórum..."
                className="w-full rounded-xl bg-zinc-950/80 border border-zinc-800 p-3 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 resize-y"
              />

              <div className="flex flex-wrap items-center gap-1.5">
                {QUICK_CLAUSE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => {
                      setNotes(tpl.text);
                      setMaxLate(
                        Math.min(
                          tpl.suggestedMaxLate,
                          Math.max(1, debt.totalInstallmentsCount)
                        )
                      );
                    }}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
                  >
                    + {tpl.label}
                  </button>
                ))}
                {notes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setNotes("")}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <FaXmark className="size-2.5" />
                    <span>Limpar texto</span>
                  </button>
                )}
              </div>
            </div>

            {/* Checkbox Exibir na Fatura Pública */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnInvoice}
                onChange={(e) => setShowOnInvoice(e.target.checked)}
                className="mt-0.5 size-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 cursor-pointer"
              />
              <div className="space-y-0.5 text-xs font-mono">
                <span className="font-bold text-white block">
                  Exibir estas regras na Fatura Pública da presa (/fatura)
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  O devedor verá as condições acima destacadas quando abrir o link da fatura.
                </span>
              </div>
            </label>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl cursor-pointer"
              >
                {isPending ? (
                  <>
                    <FaSpinner className="size-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar Cláusulas do Acordo</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
