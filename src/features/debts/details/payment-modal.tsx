"use client";

import * as React from "react";
import { toast } from "sonner";
import { registerDebtPaymentAction } from "@/actions/debts";
import {
  FaHandHoldingDollar,
  FaXmark,
  FaBolt,
  FaCheck,
} from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
  defaultAmount?: number;
  remainingDebtAmount: string;
  onSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  debtId,
  defaultAmount,
  remainingDebtAmount,
  onSuccess,
}: PaymentModalProps) {
  const [amountInput, setAmountInput] = React.useState<string>(
    defaultAmount ? String(defaultAmount) : ""
  );
  const [notes, setNotes] = React.useState<string>("");
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (defaultAmount) {
      setAmountInput(String(defaultAmount));
    }
  }, [defaultAmount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amountInput.replace(",", "."));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Informe um valor de Pix válido e maior que zero.");
      return;
    }

    startTransition(async () => {
      const res = await registerDebtPaymentAction(debtId, {
        amount: numericAmount,
        notes: notes.trim() || null,
      });

      if (!res.success) {
        toast.error(res.error || "Não foi possível registrar o pagamento.");
        return;
      }

      toast.success(res.message || "Pingou o Pix! Parcela(s) amortizada(s) com sucesso!");
      onSuccess();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <FaHandHoldingDollar className="size-4 text-emerald-400 shrink-0" />
              <span>Pingou o Pix! (Dar Baixa)</span>
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Saldo total restante desta dívida:{" "}
              <strong className="text-amber-400">{remainingDebtAmount}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
          >
            <FaXmark className="size-4" />
          </button>
        </div>

        {/* Formulário de Baixa */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-300 block">
              Quanto pingou na conta? (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="Ex: 350.00"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700 shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-300 block">
              Observação / Comentário (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pagou adiantado / Pix pelo Nubank"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700 shadow-xs"
            />
          </div>

          {/* Dica da Amortização em Cascata */}
          <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <FaBolt className="size-3 text-amber-400 shrink-0" />
              <span>Amortização em Cascata</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Se o valor for menor que a parcela, ele abate parcialmente. Se for maior, o excedente escorre automaticamente para quitar as próximas parcelas em sequência!
            </p>
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-10 px-4 text-xs font-mono font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center h-10 px-5 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Amortizando...</span>
                </>
              ) : (
                <>
                  <FaCheck className="size-3" />
                  <span>Confirmar Recebimento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

