"use client";

import * as React from "react";
import type { DebtPaymentFormatted } from "@/commons/models/debt";
import { FaReceipt, FaMoneyBillWave } from "react-icons/fa6";

interface PaymentsHistoryProps {
  payments: DebtPaymentFormatted[];
}

export function PaymentsHistory({ payments }: PaymentsHistoryProps) {
  return (
    <div className="space-y-4 pt-1">
      {/* Cabeçalho do Extrato de Pix */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-heading text-lg font-bold text-white">
            Extrato de Pix Recebidos
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Histórico das vezes em que o dinheiro caiu na conta e a mordida foi dada.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-400">
          <span>{payments.length} {payments.length === 1 ? "registro de Pix" : "registros de Pix"}</span>
        </div>
      </div>

      {payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <FaMoneyBillWave className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-emerald-400">
                      +{payment.formattedAmount}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Pix Confirmado
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">
                    Recebido em: {payment.formattedPaidAt}
                  </p>
                </div>
              </div>

              {payment.notes && (
                <div className="text-xs font-mono text-zinc-300 bg-background/60 px-3 py-1.5 rounded-xl border border-border/50 max-w-sm">
                  <span className="text-zinc-500">Nota:</span> &ldquo;{payment.notes}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State Limpo e Sem Pontilhado */
        <div className="py-12 text-center space-y-2 max-w-md mx-auto">
          <FaReceipt className="size-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-mono text-zinc-300 font-medium">
            Nenhum Pix pingou ainda nesta dívida.
          </p>
          <p className="text-xs font-mono text-zinc-500">
            Quando o devedor transferir o dinheiro, registre o valor para amortizar o cronograma.
          </p>
        </div>
      )}
    </div>
  );
}

