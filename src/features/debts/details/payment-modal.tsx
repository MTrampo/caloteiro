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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { maskCurrency, parseCurrencyToNumber } from "@/commons/utils/masks";

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
    defaultAmount ? maskCurrency(defaultAmount) : ""
  );
  const [notes, setNotes] = React.useState<string>("");
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (defaultAmount) {
      setAmountInput(maskCurrency(defaultAmount));
    }
  }, [defaultAmount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseCurrencyToNumber(amountInput);
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
        <div className="flex items-start justify-between gap-3">
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

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            disabled={isPending}
            className="text-zinc-500 hover:text-white"
          >
            <FaXmark className="size-4" />
          </Button>
        </div>

        {/* Formulário de Baixa */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>
              Quanto pingou na conta? <span className="text-rose-400">*</span>
            </FieldLabel>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 font-mono text-xs">
                R$
              </span>
              <Input
                type="text"
                required
                value={amountInput}
                onChange={(e) => setAmountInput(maskCurrency(e.target.value))}
                placeholder="0,00"
                disabled={isPending}
                className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
              />
            </div>
          </Field>

          <Field>
            <FieldLabel>
              Observação / Comentário (Opcional)
            </FieldLabel>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pagou adiantado / Pix pelo Nubank"
              disabled={isPending}
              className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
            />
          </Field>

          {/* Dica da Amortização em Cascata */}
          <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-800/80 text-xs font-mono text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <FaBolt className="size-3 text-amber-400 shrink-0" />
              <span>Amortização em Cascata</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Se o valor for menor que a parcela, ele abate parcialmente. Se for maior, o excedente escorre automaticamente para quitar as próximas parcelas em sequência!
            </p>
          </div>

          {/* Botão de Ação */}
          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl shadow-xs transition-all cursor-pointer"
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
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

