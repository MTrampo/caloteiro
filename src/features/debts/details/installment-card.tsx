"use client";

import * as React from "react";
import type { InstallmentFormatted } from "@/commons/models/debt";
import {
  FaHandHoldingDollar,
  FaCommentDots,
  FaCalendarDays,
  FaEye,
  FaPaperclip,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";

interface InstallmentCardProps {
  installment: InstallmentFormatted;
  totalInstallments: number;
  onPayInstallment: (installment: InstallmentFormatted) => void;
  onAddExcuse: (installment: InstallmentFormatted) => void;
  onViewReceipt?: (url: string) => void;
  onAttachReceipt?: (installment: InstallmentFormatted) => void;
}

export function InstallmentCard({
  installment,
  totalInstallments,
  onPayInstallment,
  onAddExcuse,
  onViewReceipt,
  onAttachReceipt,
}: InstallmentCardProps) {
  const isPaid = installment.status === "paid";
  const isLate = installment.isLate;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-4 ${
        isPaid
          ? "border-emerald-500/20 bg-card/60 opacity-90"
          : isLate
          ? "border-rose-500/30 bg-card shadow-xs"
          : "border-border bg-card shadow-xs"
      }`}
    >
      {/* Topo do Card da Parcela */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`size-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
              isPaid
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : isLate
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-zinc-800 text-zinc-300 border border-zinc-700"
            }`}
          >
            {installment.installment_number}ª
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
              <span className="font-heading font-bold text-sm text-white">
                Parcela {installment.installment_number} de {totalInstallments}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap w-fit ${installment.statusBadgeClass}`}
              >
                {installment.statusLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-mono text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1">
                <FaCalendarDays className="size-3 text-zinc-500 shrink-0" />
                <span>Vencimento: {installment.formattedDueDate}</span>
              </span>
              {isLate && (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  • {installment.lateDaysText}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botões de Ação da Parcela */}
        {!isPaid ? (
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onAddExcuse(installment)}
              className="w-full sm:w-auto h-9 font-mono text-[11px] sm:text-xs font-bold px-2 sm:px-3"
            >
              <FaCommentDots className="size-3 text-amber-400 shrink-0" />
              <span>Anotar Caô</span>
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onPayInstallment(installment)}
              className="w-full sm:w-auto h-9 font-mono text-[11px] sm:text-xs font-bold px-2 sm:px-3"
            >
              <FaHandHoldingDollar className="size-3 shrink-0" />
              <span>Baixar Parcela</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 justify-end">
            {installment.receiptUrl ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onViewReceipt?.(installment.receiptUrl!)}
                className="w-full sm:w-auto h-9 font-mono text-[11px] sm:text-xs font-bold border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
              >
                <FaEye className="size-3 shrink-0" />
                <span>Ver Comprovante</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAttachReceipt?.(installment)}
                className="w-full sm:w-auto h-9 font-mono text-[11px] sm:text-xs font-bold border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <FaPaperclip className="size-3 text-zinc-400 shrink-0" />
                <span>Anexar Comprovante</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Grid de Valores da Parcela */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 border-t border-border/40 text-xs font-mono">
        <div className="min-w-0">
          <span className="text-zinc-500 block text-[10px] sm:text-[11px]">Valor de Tabela</span>
          <span className="text-white font-bold text-xs sm:text-sm tabular-nums truncate block">
            {installment.formattedNominalAmount}
          </span>
        </div>

        <div className="min-w-0">
          <span className="text-zinc-500 block text-[10px] sm:text-[11px]">Valor Amortizado</span>
          <span
            className={`font-bold text-xs sm:text-sm tabular-nums truncate block ${
              Number(installment.paid_amount) > 0 ? "text-emerald-400" : "text-zinc-400"
            }`}
          >
            {installment.formattedPaidAmount}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 min-w-0">
          <span className="text-zinc-500 block text-[10px] sm:text-[11px]">Saldo em Aberto</span>
          <span
            className={`font-bold text-xs sm:text-sm tabular-nums truncate block ${
              isPaid ? "text-zinc-500 line-through" : "text-amber-400"
            }`}
          >
            {installment.formattedRemainingAmount}
          </span>
        </div>
      </div>

      {/* Histórico de Caôs / Desculpas Anotadas nesta Parcela */}
      {installment.excuses && installment.excuses.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="text-[11px] font-mono text-zinc-400 font-semibold flex items-center gap-1.5">
            <FaCommentDots className="size-3 text-amber-400" />
            <span>Histórico de Promessas e Caôs ({installment.excuses.length}):</span>
          </div>

          <div className="space-y-2">
            {installment.excuses.map((excuse) => (
              <div
                key={excuse.id}
                className="bg-background/80 border border-border/60 rounded-xl p-3 space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                  <span>Registrado em {excuse.formattedCreatedAt}</span>
                  <span className="text-amber-400 font-medium">
                    Nova promessa: {excuse.formattedPromisedDate}
                  </span>
                </div>
                <p className="text-zinc-200 italic">
                  &ldquo;{excuse.excuse_text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

