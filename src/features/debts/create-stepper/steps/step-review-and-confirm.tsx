"use client";

import * as React from "react";
import { toast } from "sonner";
import { formatBRL, formatDate, getNameInitials } from "@/commons/utils/format";
import {
  DEBT_CATEGORY_LABELS,
  INTEREST_TYPE_LABELS,
  type DebtCategory,
} from "@/commons/models/debt";
import type { DebtorItemFormatted } from "@/commons/models/debtor";
import {
  calculateDebtTotals,
  projectInstallmentsSchedule,
} from "../utils/debt-calculator";
import type { DebtTermsFormData } from "./step-terms-and-interest";
import {
  FaArrowLeft,
  FaCheck,
  FaWhatsapp,
  FaCopy,
  FaHandshake,
  FaScaleBalanced,
  FaSpinner,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";

interface StepReviewAndConfirmProps {
  debtor: DebtorItemFormatted;
  formData: DebtTermsFormData;
  isSubmitting: boolean;
  onPrev: () => void;
  onConfirm: (totalAmount: number) => void;
}

export function StepReviewAndConfirm({
  debtor,
  formData,
  isSubmitting,
  onPrev,
  onConfirm,
}: StepReviewAndConfirmProps) {
  const [copiedWhatsapp, setCopiedWhatsapp] = React.useState(false);

  // Totais e Projeção das parcelas
  const calculation = calculateDebtTotals({
    principalAmount: formData.original_amount,
    interestType: formData.interest_type,
    interestRate: formData.interest_rate,
    installmentsCount: formData.installments_count,
  });

  const projectedInstallments = React.useMemo(() => {
    return projectInstallmentsSchedule(
      calculation.totalAmount,
      formData.installments_count,
      formData.first_due_date
    );
  }, [calculation.totalAmount, formData.installments_count, formData.first_due_date]);

  // Mensagem amigável e direta para enviar ao devedor no WhatsApp
  const whatsAppMessage = React.useMemo(() => {
    const installmentsText =
      formData.installments_count === 1
        ? `em parcela única de ${formatBRL(calculation.totalAmount)} com vencimento em ${formatDate(formData.first_due_date)}`
        : `em ${formData.installments_count}x de aprox. ${formatBRL(calculation.baseInstallmentNominal)}, com a 1ª parcela vencendo em ${formatDate(formData.first_due_date)}`;

    const tolerancePart = formData.max_late_installments
      ? ` Lembrando que o limite de tolerância deste acordo é de ${formData.max_late_installments} ${
          formData.max_late_installments === 1 ? "parcela em atraso" : "parcelas em atraso"
        }.`
      : "";

    const notesPart = formData.notes.trim()
      ? ` Condições do acordo: "${formData.notes.trim()}".`
      : "";

    return `Fala ${debtor.formattedName}! Passei pra confirmar nosso combinado sobre "${formData.title}": valor total de ${formatBRL(calculation.totalAmount)} ${installmentsText}.${tolerancePart}${notesPart} Segue o combinado! Valeu!`;
  }, [debtor.formattedName, formData, calculation]);

  const cleanPhone = (debtor.phone || "").replace(/\D/g, "");
  const whatsAppUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(whatsAppMessage)}`
    : null;

  const handleCopyWhatsapp = () => {
    navigator.clipboard.writeText(whatsAppMessage);
    setCopiedWhatsapp(true);
    toast.success("Mensagem do acordo copiada para a área de transferência!");
    setTimeout(() => setCopiedWhatsapp(false), 2000);
  };

  const initials = getNameInitials(debtor.name);

  return (
    <div className="space-y-6">
      {/* 1. Resumo do Alvo & Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card do Devedor */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-xs font-mono text-zinc-400">O Alvo Selecionado</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {debtor.relationshipLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-zinc-800 text-white font-mono font-bold flex items-center justify-center text-sm border border-zinc-700 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h4 className="font-heading text-sm sm:text-base font-bold text-white truncate">
                {debtor.formattedName}
              </h4>
              {debtor.formattedNickname && (
                <p className="text-xs font-mono text-zinc-400 truncate">
                  Conhecido como: &ldquo;{debtor.formattedNickname}&rdquo;
                </p>
              )}
              <p className="text-[11px] font-mono text-zinc-500 truncate">
                {debtor.displayPhone || "Sem telefone"}
              </p>
            </div>
          </div>
        </div>

        {/* Card Financeiro Consolidado */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-xs font-mono text-zinc-400">Total Consolidado</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              {INTEREST_TYPE_LABELS[formData.interest_type]}
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-emerald-400 tracking-tight">
              {formatBRL(calculation.totalAmount)}
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 mt-1">
              <span>Capital: {formatBRL(formData.original_amount)}</span>
              {calculation.interestAmount > 0 && (
                <span className="text-amber-400 font-medium">
                  + Juros: {formatBRL(calculation.interestAmount)}
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
              {formData.installments_count}x de aprox. {formatBRL(calculation.baseInstallmentNominal)} • {DEBT_CATEGORY_LABELS[formData.category as DebtCategory] || "Geral"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Projeção Individual das Parcelas (Cards Responsivos, Sem Tabelas) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-sm sm:text-base font-bold text-white">
              Cronograma de Parcelas Calculado ({projectedInstallments.length}x)
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Todas as parcelas geradas com exatidão de centavos no dia de vencimento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {projectedInstallments.map((inst) => (
            <div
              key={inst.number}
              className="rounded-xl border border-border bg-card/80 p-3 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-[11px] border border-zinc-700 shrink-0">
                  {inst.number}ª
                </div>
                <div>
                  <span className="text-white font-bold block">
                    {inst.formattedNominalAmount}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">
                    Vence: {inst.formattedDueDate}
                  </span>
                </div>
              </div>

              {inst.isFirstAdjusted && (
                <span
                  title="A primeira parcela absorve os centavos do arredondamento para fechar a soma exata"
                  className="text-[9px] px-1.5 py-0.5 rounded-sm bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0"
                >
                  Centavo ajustado
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2.5 Cláusulas e Gatilho de Quebra Configurados (se houver) */}
      {(formData.notes.trim().length > 0 || formData.max_late_installments !== null) && (
        <div className="rounded-2xl border border-amber-500/30 bg-card p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <FaScaleBalanced className="size-4 text-amber-400 shrink-0" />
              <h4 className="font-heading text-sm font-bold text-white">
                Cláusulas e Gatilho de Quebra do Acordo
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {formData.max_late_installments !== null && (
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  Quebra com {formData.max_late_installments}{" "}
                  {formData.max_late_installments === 1 ? "parcela vencida" : "parcelas vencidas"}
                </span>
              )}
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {formData.show_notes_on_invoice
                  ? "Visível na Fatura da Presa"
                  : "Apenas Controle Interno"}
              </span>
            </div>
          </div>

          {formData.notes.trim().length > 0 && (
            <p className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-line">
              {formData.notes.trim()}
            </p>
          )}
        </div>
      )}

      {/* 3. Termo do Acordo & Envio do WhatsApp */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <FaHandshake className="size-4 text-emerald-400" />
          <h4 className="font-heading text-sm font-bold text-white">
            Notificação do Acordo via WhatsApp
          </h4>
        </div>

        <p className="text-xs font-mono text-zinc-400">
          Envie o comprovante do combinado direto para o WhatsApp do devedor para ninguém fingir demência depois.
        </p>

        <div className="bg-background/80 border border-border rounded-xl p-3 text-xs font-mono text-zinc-300 italic">
          &ldquo;{whatsAppMessage}&rdquo;
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyWhatsapp}
          >
            {copiedWhatsapp ? <FaCheck className="size-3 text-emerald-400" /> : <FaCopy className="size-3" />}
            <span>Copiar Mensagem</span>
          </Button>

          {whatsAppUrl && (
            <Button
              variant="outline"
              size="sm"
              render={<a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" />}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
            >
              <FaWhatsapp className="size-3.5" />
              <span>Abrir no WhatsApp</span>
            </Button>
          )}
        </div>
      </div>

      {/* 4. Rodapé de Ações: Voltar e Confirmação de Sucesso (Verde) */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isSubmitting}
          onClick={onPrev}
          className="w-full sm:w-auto"
        >
          <FaArrowLeft className="size-3" />
          <span>Voltar ao Acordo</span>
        </Button>

        {/* BOTÃO DE SUCESSO NATIVO */}
        <Button
          type="button"
          variant="success"
          size="lg"
          disabled={isSubmitting}
          onClick={() => onConfirm(calculation.totalAmount)}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="size-4 animate-spin" />
              <span>Registrando Acordo...</span>
            </>
          ) : (
            <>
              <FaCheck className="size-3.5" />
              <span>Firmar Acordo e Ativar Cobrança</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

