"use client";

import * as React from "react";
import { toast } from "sonner";
import { registerDebtExcuseAction } from "@/actions/debts";
import type { InstallmentFormatted } from "@/commons/models/debt";
import {
  FaCommentDots,
  FaXmark,
  FaCheck,
} from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";

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

      toast.success(res.message || "Caô devidamente registrado!");
      setExcuseText("");
      setPromisedDate("");
      onSuccess();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
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
          <Field>
            <FieldLabel>
              Qual foi o caô da vez? <span className="text-rose-400">*</span>
            </FieldLabel>
            <Textarea
              required
              rows={3}
              value={excuseText}
              onChange={(e) => setExcuseText(e.target.value)}
              placeholder="Ex: 'O banco bloqueou meu Pix por segurança', 'Recebo meu vale na sexta-feira sem falta'..."
              className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm resize-none"
            />
          </Field>

          <Field>
            <FieldLabel>
              Para quando ele prometeu que paga? <span className="text-rose-400">*</span>
            </FieldLabel>
            <DatePicker
              value={promisedDate}
              onChange={setPromisedDate}
              placeholder="Selecione a nova data prometida"
            />
          </Field>

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
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <FaCheck className="size-3" />
                  <span>Anotar Promessa</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

