"use client";

import * as React from "react";
import type { DebtDetailsFormatted } from "@/commons/models/debt";
import {
  FaCoins,
  FaCheckDouble,
  FaClockRotateLeft,
  FaArrowTrendUp,
} from "react-icons/fa6";
import { cn } from "@/commons/lib/utils";

interface DebtKpisProps {
  debt: DebtDetailsFormatted;
}

export function DebtKpis({ debt }: DebtKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Combinado (com Juros) */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">Total Combinado</span>
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300">
            <FaCoins className="size-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {debt.formattedTotalAmount}
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-0.5 truncate">
            Capital: {debt.formattedOriginalAmount} • {debt.totalInstallmentsCount}x no {debt.categoryLabel}
          </p>
        </div>
      </div>

      {/* 2. Já Recuperado (Amortizado + Cronograma Pago) */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">Já Recuperado</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <FaCheckDouble className="size-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {debt.formattedPaidAmount}
          </div>
          {/* Barra de Progresso da Dívida e Cronograma Absorvido */}
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${debt.progressPercentage}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-zinc-400 text-right">
              {debt.paidInstallmentsCount} de {debt.totalInstallmentsCount} parcelas ({debt.progressPercentage}% honrado)
            </p>
          </div>
        </div>
      </div>

      {/* 3. Saldo na Pista (Restante a Resgatar + Alerta de Atraso) */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">Saldo na Pista</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <FaClockRotateLeft className="size-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {debt.formattedRemainingAmount}
          </div>
          <p className="text-xs font-mono mt-0.5">
            {debt.isFullySettled ? (
              <span className="text-emerald-400 font-semibold">Conta zerada!</span>
            ) : debt.hasLateInstallments ? (
              <span className="text-rose-400 font-semibold">
                {debt.lateInstallmentsCount} {debt.lateInstallmentsCount === 1 ? "parcela em atraso" : "parcelas em atraso"}!
              </span>
            ) : (
              <span className="text-zinc-400">
                {debt.remainingInstallmentsCount} {debt.remainingInstallmentsCount === 1 ? "parcela restante no prazo" : "parcelas restantes no prazo"}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 4. Juros do Tubarão (Retorno da Operação em R$ e %) */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">Juros do Tubarão</span>
          <div className={cn(
            "p-2 rounded-xl",
            debt.hasInterest ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-400"
          )}>
            <FaArrowTrendUp className="size-4" />
          </div>
        </div>
        <div>
          <div className={cn(
            "text-xl sm:text-2xl font-bold font-mono tracking-tight",
            debt.hasInterest ? "text-emerald-400" : "text-zinc-300"
          )}>
            {debt.formattedTotalInterestAmount}
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-0.5 truncate">
            {debt.interestLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
