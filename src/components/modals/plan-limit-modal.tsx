"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FaArrowRight,
  FaShieldHalved,
  FaCoins,
  FaUsers,
  FaTriangleExclamation,
} from "react-icons/fa6";

export interface PlanLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lockReason?: "debtor" | "debt";
  maxAllowed?: number;
  planName?: string;
}

export function PlanLimitModal({
  open,
  onOpenChange,
  lockReason = "debtor",
  maxAllowed = 2,
  planName = "Tubarão Lixa",
}: PlanLimitModalProps) {
  const router = useRouter();

  const isDebtor = lockReason === "debtor";

  const handleUpgradeClick = () => {
    onOpenChange(false);
    router.push("/painel/conta/assinatura");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 p-6 sm:p-7">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2.5 text-amber-500 pb-1">
            <div className="size-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <FaTriangleExclamation className="size-4" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Limite do Tanque Atingido
            </span>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
            O Tanque Encheu!
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed pt-1">
            {isDebtor ? (
              <>
                Seu plano atual (<span className="text-white font-bold">{planName}</span>) permite até{" "}
                <span className="text-white font-bold">{maxAllowed} devedores</span> no radar. Chega de amadorismo: é hora de evoluir para o próximo nível de Tubarão para fichar novos caloteiros e não deixar ninguém escapar!
              </>
            ) : (
              <>
                Seu plano atual (<span className="text-white font-bold">{planName}</span>) permite manter até{" "}
                <span className="text-white font-bold">{maxAllowed} dívidas ativas</span> simultaneamente. Finalize uma pendência ou evolua de plano para continuar farejando cada centavo na pista!
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Destaques dos planos superiores reais */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 space-y-2.5 my-1">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
            Planos superiores disponíveis:
          </p>
          <ul className="space-y-2.5 text-xs font-mono text-zinc-300">
            <li className="flex items-start gap-2">
              <FaUsers className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Tubarão Branco:</strong> até 10 devedores e dívidas no radar, painel financeiro consolidado e portal do devedor.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FaShieldHalved className="size-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Tubarão Cabeça Chato:</strong> devedores e dívidas <strong className="text-emerald-400">ilimitados</strong>, score de risco do caloteiro e anexo de comprovantes.
              </span>
            </li>
          </ul>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto font-mono text-xs border-zinc-800 text-zinc-400 hover:text-white"
          >
            Deixar para depois
          </Button>

          <Button
            type="button"
            size="lg"
            onClick={handleUpgradeClick}
            className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl font-heading shadow-md"
          >
            <span>Evoluir Meu Plano</span>
            <FaArrowRight className="size-3.5 ml-1.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

