import * as React from "react";
import { FaBolt, FaShieldHalved } from "react-icons/fa6";

export function TrialBanner() {
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <FaBolt className="size-5" />
        </div>
        <div>
          <h4 className="font-heading text-sm font-bold text-white">
            30 Dias de Degustação Gratuita na Gruta
          </h4>
          <p className="text-xs text-zinc-400 font-mono">
            Solte seu tubarão sem compromisso no primeiro mês. Cancele quando quiser antes do vencimento com um único clique.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 self-start sm:self-auto shrink-0">
        <FaShieldHalved className="size-3.5" />
        <span>Garantia Anti-Calote</span>
      </div>
    </div>
  );
}

