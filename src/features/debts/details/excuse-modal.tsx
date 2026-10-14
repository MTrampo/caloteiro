"use client";

import * as React from "react";
import { toast } from "sonner";
import { registerDebtExcuseAction } from "@/actions/debts";
import type { InstallmentFormatted } from "@/commons/models/debt";
import {
  FaCommentDots,
  FaXmark,
  FaCheck,
  FaCalendarDays,
} from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExcuseModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: InstallmentFormatted | null;
  onSuccess: () => void;
}

export function ExcuseModal({
  isOpen,
  onClose,
  installment,
  onSuccess,
}: ExcuseModalProps) {
  const [excuseText, setExcuseText] = React.useState("");
  const [promisedDate, setPromisedDate] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  if (!isOpen || !installment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!excuseText.trim()) {
      toast.error("Descreva o que o caloteiro alegou.");
      return;
    }

    if (!promisedDate) {
      toast.error("Informe a nova data prometida pelo caloteiro.");
      return;
    }

    startTransition(async () => {
      const res = await registerDebtExcuseAction({
        installment_id: installment.id,
        excuse_text: excuseText.trim(),
        promised_date: promisedDate,
      });

      if (!res.success) {
        toast.error(res.error || "Não foi possível anotar o caô.");
        return;
      }

      toast.success(res.message || "Caô devidamente registrado no dossiê!");
      setExcuseText("");
      setPromisedDate("");
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
              <FaCommentDots className="size-4 text-amber-400 shrink-0" />
              <span>Anotar Caô / Desculpa</span>
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Parcela {installment.installment_number} • Vencimento: {installment.formattedDueDate}
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-300 block">
              Qual foi o caô da vez? *
            </label>
            <textarea
              required
              rows={3}
              value={excuseText}
              onChange={(e) => setExcuseText(e.target.value)}
              placeholder="Ex: 'O banco bloqueou meu Pix por segurança', 'Recebo meu vale na sexta-feira sem falta'..."
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700 shadow-xs resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-300 block flex items-center gap-1.5">
              <FaCalendarDays className="size-3 text-zinc-400" />
              <span>Para quando ele prometeu que paga? *</span>
            </label>
            <input
              type="date"
              required
              value={promisedDate}
              onChange={(e) => setPromisedDate(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-hidden focus:border-zinc-700 shadow-xs"
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <FaCheck className="size-3" />
                  <span>Registrar no Dossiê</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

