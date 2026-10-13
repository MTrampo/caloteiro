"use client";

import * as React from "react";
import type { DebtDetailsFormatted } from "@/commons/models/debt";
import {
  FaCoins,
  FaCheckDouble,
  FaClockRotateLeft,
  FaTriangleExclamation,
  FaCalendarDays,
} from "react-icons/fa6";

interface DebtKpisProps {
  debt: DebtDetailsFormatted;
}

export function DebtKpis({ debt }: DebtKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Contratado */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">Total Combinado</span>
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300">
            <FaCoins className="size-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {debt.formattedOriginalAmount}
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            {debt.totalInstallmentsCount}x no {debt.categoryLabel}
          </p>
        </div>
      </div>

      {/* 2. Já Recuperado (Amortizado) */}
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
          {/* Barra de Progresso da Dívida */}
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${debt.progressPercentage}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-zinc-400 text-right">
              {debt.progressPercentage}% honrado
            </p>
          </div>
        </div>
      </div>

      {/* 3. Saldo na Pista */}
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
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            {debt.isFullySettled ? (
              <span className="text-emerald-400 font-semibold">Conta zerada!</span>
            ) : (
              <span>Restante a ser resgatado</span>
            )}
          </p>
        </div>
      </div>

      {/* 4. Situação do Cronograma */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">Cronograma</span>
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300">
            {debt.hasLateInstallments ? (
              <FaTriangleExclamation className="size-4 text-rose-400" />
            ) : (
              <FaCalendarDays className="size-4" />
            )}
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {debt.paidInstallmentsCount} / {debt.totalInstallmentsCount}
          </div>
          <p className="text-xs font-mono mt-0.5">
            {debt.hasLateInstallments ? (
              <span className="text-rose-400 font-semibold">
                {debt.lateInstallmentsCount} {debt.lateInstallmentsCount === 1 ? "parcela em atraso" : "parcelas em atraso"}!
              </span>
            ) : debt.isFullySettled ? (
              <span className="text-emerald-400 font-semibold">Todas as parcelas pagas</span>
            ) : (
              <span className="text-zinc-400">Parcelas em dia</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

