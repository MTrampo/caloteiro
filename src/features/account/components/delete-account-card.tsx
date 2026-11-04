"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteAccountAction } from "@/actions/account";
import { FaTrashCan, FaTriangleExclamation } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

export function DeleteAccountCard() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [confirmationWord, setConfirmationWord] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const isConfirmed = confirmationWord.trim().toUpperCase() === "EXCLUIR";

  const handleDeleteAccount = () => {
    if (!isConfirmed) {
      toast.error('Digite a palavra "EXCLUIR" em maiúsculas para confirmar.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await deleteAccountAction({ confirmation: confirmationWord });
        if (!response.success) {
          toast.error(response.error || "Não foi possível excluir sua conta.");
          return;
        }

        toast.success("Sua conta e todos os dados foram excluídos permanentemente.");
        setIsOpen(false);
        router.replace("/entrar");
      } catch {
        toast.error("Erro inesperado ao excluir conta.");
      }
    });
  };

  return (
    <>
      {/* Card da Zona de Perigo */}
      <div className="rounded-2xl border border-rose-900/40 bg-rose-950/10 p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-400 font-heading font-bold text-sm sm:text-base">
            <FaTriangleExclamation className="size-4 shrink-0" />
            <span>Zona de Perigo</span>
          </div>
          <p className="text-xs font-mono text-zinc-400 leading-relaxed">
            Excluir definitivamente sua conta do Caloteiro. Essa ação cancela qualquer assinatura ativa no Mercado Pago e apaga todas as dívidas, promessas, devedores e registros da sua gruta permanentemente.
          </p>
        </div>

        <div className="pt-1">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsOpen(true)}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl h-10 px-5 text-xs font-mono cursor-pointer transition-all shadow-xs"
          >
            <FaTrashCan className="size-3.5 mr-2" />
            <span>Excluir Minha Conta</span>
          </Button>
        </div>
      </div>

      {/* Dialog de Confirmação com Palavra-Chave */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-md bg-zinc-900 border-zinc-800 text-white p-4 sm:p-6 space-y-4 max-h-[calc(100dvh-2.5rem)] overflow-y-auto">
          <DialogHeader className="space-y-2 text-left">
            <div className="size-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-1">
              <FaTriangleExclamation className="size-5" />
            </div>
            <DialogTitle className="font-heading text-lg font-bold text-white">
              Excluir Conta Definitivamente?
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-zinc-400 leading-relaxed">
              Esta ação é <strong className="text-rose-400">irreversível</strong>. Todos os dados da sua gruta (devedores, promessas, parcelas, extratos e credenciais) serão destruídos e sua assinatura será cancelada imediatamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-1">
            <label className="text-xs font-mono text-zinc-300 block">
              Para confirmar, digite <span className="font-bold text-white select-all">EXCLUIR</span> no campo abaixo:
            </label>
            <Input
              type="text"
              value={confirmationWord}
              onChange={(e) => setConfirmationWord(e.target.value)}
              placeholder="Digite EXCLUIR"
              className="h-10 bg-zinc-950 border-zinc-800 text-white font-mono text-sm placeholder:text-zinc-600 focus-visible:ring-rose-500 uppercase"
              disabled={isPending}
            />
          </div>

          {/* Rodapé Padronizado: Apenas Ação Principal com Cor de Perigo */}
          <div className="pt-3 flex justify-end">
            <Button
              type="button"
              disabled={!isConfirmed || isPending}
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl h-10 px-5 text-xs font-mono cursor-pointer transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Excluindo tudo...</span>
                </div>
              ) : (
                "Excluir Minha Conta Definitivamente"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

