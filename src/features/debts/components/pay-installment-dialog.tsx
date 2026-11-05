"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerDebtPaymentAction } from "@/actions/debts";
import {
  FaXmark,
  FaBolt,
  FaCheck,
  FaSpinner,
  FaHandHoldingDollar,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { ReceiptAttachmentField } from "@/components/forms/receipt-attachment-field";
import { ReceiptViewerDialog } from "@/features/debts/details/receipt-viewer-dialog";
import { maskCurrency, parseCurrencyToNumber } from "@/commons/utils/masks";
import { cn } from "@/commons/lib/utils";

export interface PayInstallmentDialogProps {
  debtId: string;
  defaultAmount?: number;
  remainingDebtAmount?: string;
  contextSubtitle?: string;
  isReceiptLocked?: boolean;
  onSuccess?: () => void;
  onPreviewReceipt?: (url: string) => void;
  /** Disparador customizado opcional. Se omitido, renderiza o botão padrão 'Pingou o Pix?' */
  trigger?: React.ReactNode;
  /** Controle de abertura externo opcional */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function PayInstallmentDialog({
  debtId,
  defaultAmount,
  remainingDebtAmount,
  contextSubtitle,
  isReceiptLocked = false,
  onSuccess,
  onPreviewReceipt,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  className,
}: PayInstallmentDialogProps) {
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

  const getTodayDateStr = () => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  };

  const [amountInput, setAmountInput] = React.useState<string>(
    defaultAmount ? maskCurrency(defaultAmount) : ""
  );
  const [paidDate, setPaidDate] = React.useState<string>(getTodayDateStr());
  const [notes, setNotes] = React.useState<string>("");
  const [receiptPath, setReceiptPath] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [internalPreviewUrl, setInternalPreviewUrl] = React.useState<string | null>(null);

  const [prevDefaultAmount, setPrevDefaultAmount] = React.useState<number | undefined>(defaultAmount);
  if (defaultAmount !== prevDefaultAmount) {
    setPrevDefaultAmount(defaultAmount);
    setAmountInput(defaultAmount ? maskCurrency(defaultAmount) : "");
  }

  const handleClose = () => {
    if (isPending) return;
    handleOpenChange(false);
  };

  const handlePreviewReceipt = (url: string) => {
    if (onPreviewReceipt) {
      onPreviewReceipt(url);
    } else {
      setInternalPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseCurrencyToNumber(amountInput);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Informe um valor de Pix válido e maior que zero.");
      return;
    }

    startTransition(async () => {
      const paidAtIso = paidDate
        ? new Date(`${paidDate}T12:00:00.000Z`).toISOString()
        : undefined;

      const res = await registerDebtPaymentAction(debtId, {
        amount: numericAmount,
        notes: notes.trim() || null,
        paid_at: paidAtIso,
        receipt_path: receiptPath || null,
      });

      if (!res.success) {
        toast.error(res.error || "Não foi possível registrar o pagamento.");
        return;
      }

      toast.success(res.message || "Pingou o Pix! Parcela amortizada com sucesso!");
      setReceiptPath(null);
      setPaidDate(getTodayDateStr());
      handleOpenChange(false);
      onSuccess?.();
      router.refresh();
    });
  };

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
          onClick={() => handleOpenChange(true)}
          className={cn(
            "h-9 sm:h-8.5 px-3 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl cursor-pointer justify-center min-w-0 transition-all shadow-xs",
            className
          )}
        >
          <FaHandHoldingDollar className="size-3.5 mr-1.5 text-zinc-950 shrink-0" />
          <span className="whitespace-nowrap">Pingou o Pix?</span>
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
                  <FaHandHoldingDollar className="size-4 text-emerald-400 shrink-0" />
                  <span>Pingou o Pix! (Dar Baixa)</span>
                </h3>
                {contextSubtitle ? (
                  <p className="text-xs font-mono text-zinc-400">
                    {contextSubtitle}
                  </p>
                ) : remainingDebtAmount ? (
                  <p className="text-xs font-mono text-zinc-400">
                    Saldo total devedor:{" "}
                    <strong className="text-zinc-200">{remainingDebtAmount}</strong>
                  </p>
                ) : null}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleClose}
                disabled={isPending}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <FaXmark className="size-4" />
              </Button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field>
                <FieldLabel>
                  Quanto caiu na conta? <span className="text-rose-400">*</span>
                </FieldLabel>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400 select-none">
                    R$
                  </span>
                  <Input
                    required
                    type="text"
                    inputMode="numeric"
                    value={amountInput}
                    onChange={(e) => setAmountInput(maskCurrency(e.target.value))}
                    placeholder="0,00"
                    disabled={isPending}
                    className="pl-10 text-emerald-400 font-mono font-bold text-base bg-zinc-950/60 border-zinc-800 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] font-mono text-zinc-500 mt-1">
                  Se o valor for menor que o total da parcela, o saldo restante continuará em aberto.
                </p>
              </Field>

              <Field>
                <FieldLabel>Quando o dinheiro pingou?</FieldLabel>
                <Input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  disabled={isPending}
                  className="bg-zinc-950/60 border-zinc-800 text-white font-mono text-xs sm:text-sm focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 scheme-dark"
                />
              </Field>

              <Field>
                <FieldLabel>Observação ou Recado (Opcional)</FieldLabel>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: 'Pagou metade adiantado', 'Pix do irmão'..."
                  disabled={isPending}
                  maxLength={120}
                  className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 font-mono text-xs sm:text-sm focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                />
              </Field>

              {/* Anexo de Comprovante de Pagamento */}
              <ReceiptAttachmentField
                label="Comprovante Pix do Recebimento (Opcional)"
                folder="payment"
                value={receiptPath}
                onChange={setReceiptPath}
                isLocked={isReceiptLocked}
                onPreviewClick={handlePreviewReceipt}
              />

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
                      <FaSpinner className="size-3.5 animate-spin" />
                      <span>Registrando Baixa...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck className="size-3" />
                      <span>Confirmar Baixa do Pix</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visualizador de Comprovante Embutido */}
      {internalPreviewUrl && (
        <ReceiptViewerDialog
          open={Boolean(internalPreviewUrl)}
          onOpenChange={(open) => {
            if (!open) setInternalPreviewUrl(null);
          }}
          imageUrl={internalPreviewUrl}
        />
      )}
    </>
  );
}
