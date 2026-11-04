"use client";

import * as React from "react";
import { toast } from "sonner";
import { attachLoanReceiptAction } from "@/actions/debts";
import {
  FaXmark,
  FaCheck,
  FaSpinner,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { ReceiptAttachmentField } from "@/components/forms/receipt-attachment-field";

interface AttachLoanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
  debtTitle: string;
  formattedOriginalAmount: string;
  hasExistingReceipt?: boolean;
  isReceiptLocked?: boolean;
  onSuccess: () => void;
  onPreviewReceipt?: (url: string) => void;
}

export function AttachLoanReceiptModal({
  isOpen,
  onClose,
  debtId,
  debtTitle,
  formattedOriginalAmount,
  hasExistingReceipt = false,
  isReceiptLocked = false,
  onSuccess,
  onPreviewReceipt,
}: AttachLoanReceiptModalProps) {
  const [receiptPath, setReceiptPath] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (isOpen) {
      setReceiptPath(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiptPath) {
      toast.error("Selecione e envie um comprovante antes de salvar.");
      return;
    }

    startTransition(async () => {
      const res = await attachLoanReceiptAction({
        debtId,
        receipt_path: receiptPath,
      });

      if (!res.success) {
        toast.error(
          res.error || "Não foi possível anexar o comprovante de transferência."
        );
        return;
      }

      toast.success(
        res.message ||
          "Comprovante de transferência do Tubarão salvo com sucesso!"
      );
      setReceiptPath(null);
      onSuccess();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-[calc(100vw-1.5rem)] sm:w-full max-w-md p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[calc(100dvh-2.5rem)] overflow-y-auto overscroll-contain">
        {/* Cabeçalho do Modal (Sem ícone no h3 conforme Diretriz 7) */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-white">
              {hasExistingReceipt
                ? "Substituir Comprovante do Tubarão"
                : "Anexar Comprovante do Tubarão"}
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              {debtTitle} •{" "}
              <strong className="text-emerald-400 whitespace-nowrap">
                {formattedOriginalAmount}
              </strong>
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

        {/* Formulário de Anexo */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <ReceiptAttachmentField
            label="Comprovante Pix de Transferência Inicial"
            description="Guarde na sua gruta a prova do Pix ou transferência que você enviou para o devedor."
            folder="loan"
            isLocked={isReceiptLocked}
            value={receiptPath}
            onChange={setReceiptPath}
            onPreviewClick={onPreviewReceipt}
          />

          {/* Botão de Ação Único Padronizado em Branco */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={isPending || !receiptPath}
              className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isPending ? (
                <>
                  <FaSpinner className="size-3.5 animate-spin" />
                  <span>Salvando Comprovante...</span>
                </>
              ) : (
                <>
                  <FaCheck className="size-3" />
                  <span>Salvar Comprovante</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

