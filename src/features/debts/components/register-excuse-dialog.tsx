"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerDebtExcuseAction } from "@/actions/debts";
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
import { cn } from "@/commons/lib/utils";

export interface RegisterExcuseDialogProps {
  installmentId: string;
  installmentText?: string;
  dueDateText?: string;
  debtorName?: string;
  contextSubtitle?: string;
  onSuccess?: () => void;
  /** Disparador customizado opcional. Se omitido, renderiza o botão padrão 'Anotar Caô' */
  trigger?: React.ReactNode;
  /** Controle de abertura externo opcional */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function RegisterExcuseDialog({
  installmentId,
  installmentText,
  dueDateText,
  debtorName,
  contextSubtitle,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  className,
}: RegisterExcuseDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (setControlledOpen) {
        setControlledOpen(nextOpen);
      } else {
        setInternalOpen(nextOpen);
      }
    },
    [setControlledOpen]
  );

  const [excuseText, setExcuseText] = React.useState("");
  const [promisedDate, setPromisedDate] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const handleClose = () => {
    if (isPending) return;
    handleOpenChange(false);
  };

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
        installment_id: installmentId,
        excuse_text: excuseText.trim(),
        promised_date: promisedDate,
      });

      if (!res.success) {
        toast.error(res.error || "Não foi possível anotar o caô.");
        return;
      }

      toast.success(res.message || "Caô devidamente registrado na Gruta!");
      setExcuseText("");
      setPromisedDate("");
      handleOpenChange(false);
      onSuccess?.();
      router.refresh();
    });
  };

  const computedSubtitle =
    contextSubtitle ||
    [
      debtorName,
      installmentText || "Parcela",
      dueDateText ? `Vencimento: ${dueDateText}` : undefined,
    ]
      .filter(Boolean)
      .join(" • ");

  return (
    <>
      {/* Botão Disparador */}
      {trigger ? (
        React.isValidElement(trigger) ? (
          React.cloneElement(trigger as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
            onClick: (e: React.MouseEvent) => {
              (trigger as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>).props.onClick?.(e);
              handleOpenChange(true);
            },
          })
        ) : (
          <span onClick={() => handleOpenChange(true)} className="cursor-pointer inline-flex">
            {trigger}
          </span>
        )
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleOpenChange(true)}
          className={cn(
            "h-9 sm:h-8.5 px-3 text-xs font-mono font-bold bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white cursor-pointer justify-center min-w-0 transition-all",
            className
          )}
        >
          <FaCommentDots className="size-3 text-amber-400 mr-1.5 shrink-0" />
          <span className="whitespace-nowrap">Anotar Caô</span>
        </Button>
      )}

      {/* Modal Autônomo */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-[calc(100vw-1.5rem)] sm:w-full max-w-md p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[calc(100dvh-2.5rem)] overflow-y-auto overscroll-contain">
            {/* Cabeçalho do Modal */}
            <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <FaCommentDots className="size-4 text-amber-400 shrink-0" />
                  <span>Anotar Caô / Desculpa</span>
                </h3>
                {computedSubtitle && (
                  <p className="text-xs font-mono text-zinc-400">
                    {computedSubtitle}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleClose}
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
      )}
    </>
  );
}

