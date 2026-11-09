"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteDebtorAction } from "@/actions/debtors";
import type { DebtorItemFormatted } from "../types";
import { FaTriangleExclamation, FaSpinner, FaTrashCan } from "react-icons/fa6";

interface DeleteDebtorDialogProps {
  debtor: DebtorItemFormatted | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (deletedDebtorId: string) => void;
  redirectTo?: string;
}

export function DeleteDebtorDialog({
  debtor,
  open,
  onOpenChange,
  onSuccess,
  redirectTo,
}: DeleteDebtorDialogProps) {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setIsConfirmed(false);
      setIsDeleting(false);
    }
  }

  if (!debtor) return null;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);

    try {
      const res = await deleteDebtorAction(debtor.id);

      if (!res.success) {
        toast.error(res.error || "Não foi possível remover esta presa.");
        setIsDeleting(false);
        return;
      }

      toast.success("Presa removida da sua gruta com sucesso!");
      onOpenChange(false);
      onSuccess?.(debtor.id);

      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (err) {
      console.error("[DeleteDebtorDialog] Erro inesperado:", err);
      toast.error("Ocorreu um erro ao excluir a presa.");
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-md bg-zinc-900 border-zinc-800 p-4 sm:p-6 space-y-4">
        <DialogHeader className="text-left space-y-2">
          <div className="size-11 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
            <FaTriangleExclamation className="size-5" />
          </div>

          <DialogTitle className="font-heading text-lg sm:text-xl font-bold text-white">
            Remover presa da sua gruta?
          </DialogTitle>
          <DialogDescription className="text-xs font-mono text-zinc-400">
            Você está prestes a remover permanentemente{" "}
            <strong className="text-white">&ldquo;{debtor.formattedName}&rdquo;</strong> do seu tanque de cobrança.
          </DialogDescription>
        </DialogHeader>

        {/* Alerta de Perigo de Integridade Financeira */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 space-y-1.5 text-xs font-mono text-rose-300">
          <div className="flex items-center gap-1.5 font-bold text-rose-400 uppercase text-[10px]">
            <FaTriangleExclamation className="size-3 shrink-0" />
            <span>Atenção: Ação Irreversível</span>
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-300">
            A exclusão desta presa removerá definitivamente todo o histórico financeiro, acordos, parcelas e promessas vinculadas a este devedor.
          </p>
        </div>

        {/* Checkbox de Proteção Contra Cliques Acidentais */}
        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-950/50 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="size-4 rounded border-zinc-700 bg-zinc-900 text-rose-600 focus:ring-0 mt-0.5 cursor-pointer"
          />
          <span className="text-xs font-mono text-zinc-300 leading-snug">
            Estou ciente de que a remoção é definitiva e apagará todos os dados desta presa na gruta.
          </span>
        </label>

        {/* Rodapé: Botão Destrutivo de Ação Principal Alinhado à Direita */}
        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <Button
            type="button"
            disabled={!isConfirmed || isDeleting}
            onClick={handleDelete}
            className="w-full sm:w-auto h-10 px-5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed justify-center"
          >
            {isDeleting ? (
              <>
                <FaSpinner className="size-3.5 animate-spin mr-1.5" />
                <span>Excluindo presa...</span>
              </>
            ) : (
              <>
                <FaTrashCan className="size-3.5 mr-1.5" />
                <span>Excluir Presa Definitivamente</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

