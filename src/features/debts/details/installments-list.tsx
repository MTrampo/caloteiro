"use client";

import * as React from "react";
import type { InstallmentFormatted } from "@/commons/models/debt";
import { InstallmentCard } from "./installment-card";

interface InstallmentsListProps {
  installments: InstallmentFormatted[];
  onPayInstallment: (installment: InstallmentFormatted) => void;
  onAddExcuse: (installment: InstallmentFormatted) => void;
}

export function InstallmentsList({
  installments,
  onPayInstallment,
  onAddExcuse,
}: InstallmentsListProps) {
  return (
    <div className="space-y-4 pt-1">
      {/* Cabeçalho da Seção (Solto no layout, sem card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-heading text-lg font-bold text-white">
            Cronograma de Parcelas
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Acompanhamento individual de vencimentos, saldos e histórico de desculpas.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-400">
          <span>{installments.length} {installments.length === 1 ? "parcela calculada" : "parcelas calculadas"}</span>
        </div>
      </div>

      {/* Lista Solta de Cards de Parcelas (Zero Card Inception) */}
      <div className="space-y-3">
        {installments.map((installment) => (
          <InstallmentCard
            key={installment.id}
            installment={installment}
            totalInstallments={installments.length}
            onPayInstallment={onPayInstallment}
            onAddExcuse={onAddExcuse}
          />
        ))}
      </div>
    </div>
  );
}

