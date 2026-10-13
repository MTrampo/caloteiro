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
  FaCoins,
  FaCalendarDays,
  FaUser,
  FaWhatsapp,
  FaCopy,
  FaHandshake,
  FaShieldHalved,
  FaBolt,
} from "react-icons/fa6";
import { Loader2 } from "lucide-react";

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

    return `Fala ${debtor.formattedName}! Passei pra confirmar nosso combinado sobre "${formData.title}": valor total de ${formatBRL(calculation.totalAmount)} ${installmentsText}. Segue o combinado! Valeu!`;
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
                  Conhecido como: "{debtor.formattedNickname}"
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
          "{whatsAppMessage}"
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopyWhatsapp}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-mono font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
          >
            {copiedWhatsapp ? <FaCheck className="size-3 text-emerald-400" /> : <FaCopy className="size-3" />}
            <span>Copiar Mensagem</span>
          </button>

          {whatsAppUrl && (
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-mono font-semibold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
            >
              <FaWhatsapp className="size-3.5" />
              <span>Abrir no WhatsApp</span>
            </a>
          )}
        </div>
      </div>

      {/* 4. Rodapé de Ações: Voltar e Confirmação de Sucesso (Verde) */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onPrev}
          className="inline-flex items-center justify-center h-11 px-5 text-xs font-mono font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all gap-2 cursor-pointer disabled:opacity-50"
        >
          <FaArrowLeft className="size-3" />
          <span>Voltar ao Acordo</span>
        </button>

        {/* BOTÃO VERDE DE SUCESSO (Conforme instrução expressa do usuário) */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onConfirm(calculation.totalAmount)}
          className="inline-flex items-center justify-center h-11 px-6 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl shadow-md gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Registrando Acordo...</span>
            </>
          ) : (
            <>
              <FaCheck className="size-3.5" />
              <span>Firmar Acordo e Ativar Cobrança</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

