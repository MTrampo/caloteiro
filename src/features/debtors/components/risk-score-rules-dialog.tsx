"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BIOLOGICAL_TIER_METADATA, type BiologicalTier } from "@/commons/models/risk-score";
import {
  FaCircleQuestion,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaScaleBalanced,
} from "react-icons/fa6";

interface RiskScoreRulesDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

const TIER_ORDER: BiologicalTier[] = [
  "flying_fish",
  "slippery_fish",
  "trainee_defaulter",
  "defaulter",
  "professional_defaulter",
];

const HEALING_WEIGHTS = [
  { label: "Parcela paga adiantada (antes do vencimento)", points: "+6 pts" },
  { label: "Parcela paga rigorosamente no dia do vencimento", points: "+4 pts" },
  { label: "Acordo inteiro quitado até o fim sem quebras", points: "+10 pts" },
  { label: "Promessa de caô cumprida dentro do novo prazo", points: "+3 pts" },
];

const BLEEDING_WEIGHTS = [
  { label: "Parcela vencida atualmente (1 a 5 dias de atraso)", points: "-8 pts" },
  { label: "Parcela em atraso médio ativo (6 a 15 dias)", points: "-15 pts" },
  { label: "Parcela em atraso crítico ativo (> 15 dias)", points: "-25 pts" },
  { label: "Meteção de louco / Caô registrado no mural", points: "-6 pts" },
  { label: "Promessa de caô vencida e não cumprida", points: "-10 pts" },
  { label: "Parcela já paga, mas que atrasou de 1 a 5 dias", points: "-2 pts" },
  { label: "Parcela já paga, mas que atrasou mais de 5 dias", points: "-5 pts" },
  { label: "Quebra de acordo ou acionamento judicial", points: "-30 pts" },
];

export function RiskScoreRulesDialog({
  triggerLabel = "Como funciona o Faro?",
  triggerClassName,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showTrigger = true,
}: RiskScoreRulesDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  return (
    <>
      {showTrigger && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className={
            triggerClassName ||
            "h-8 px-2.5 text-[11px] sm:text-xs font-mono font-bold bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
          }
        >
          <FaCircleQuestion className="size-3.5 text-amber-400 shrink-0" />
          <span>{triggerLabel}</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-2xl bg-zinc-900 border-zinc-800 p-4 sm:p-6 space-y-5 max-h-[calc(100dvh-2.5rem)] overflow-y-auto">
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="font-heading text-lg sm:text-xl font-bold text-white">
              Faro do Tubarão (0 a 100 pts)
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-zinc-400">
              Entenda exatamente os pesos matemáticos que definem se a sua presa é um pagador exemplar ou um Caloteiro Profissional.
            </DialogDescription>
          </DialogHeader>

          {/* Regra do Ponto de Partida (50 pts) */}
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3.5 space-y-1 text-xs font-mono">
            <div className="flex items-center gap-2 font-bold text-yellow-300">
              <FaScaleBalanced className="size-3.5 shrink-0" />
              <span>Ponto de Partida: Toda presa começa no meio (50 pts)</span>
            </div>
            <p className="text-zinc-300 leading-relaxed text-[11px] sm:text-xs">
              Ninguém ganha confiança de graça na gruta. Todo devedor recém-cadastrado nasce com{" "}
              <strong className="text-white">50 pontos (Peixe Ensaboado)</strong> — na fronteira exata do amarelo. Basta{" "}
              <strong className="text-amber-300">1 atraso ou 1 desculpa</strong> para cair imediatamente para{" "}
              <strong className="text-amber-400">Caloteiro em Treinamento (&lt; 50 pts)</strong>.
            </p>
          </div>

          {/* As 5 Categorias Biológicas */}
          <div className="space-y-2.5">
            <h4 className="font-heading text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              1. Escada Biológica da Presa
            </h4>
            <div className="space-y-2">
              {TIER_ORDER.map((tierKey) => {
                const meta = BIOLOGICAL_TIER_METADATA[tierKey];
                return (
                  <div
                    key={tierKey}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${meta.badgeClass}`}
                        >
                          {meta.minScore} a {meta.maxScore} pts
                        </span>
                        <span className="font-heading text-xs sm:text-sm font-bold text-white">
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-400 leading-snug">
                        {meta.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pesos de Cicatrização e Sangramento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Cicatrização (+) */}
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                <FaArrowTrendUp className="size-3.5 shrink-0" />
                <span>Cicatrização (Sobe o Faro)</span>
              </div>
              <div className="space-y-2">
                {HEALING_WEIGHTS.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 text-[11px] font-mono border-b border-emerald-500/10 pb-1.5 last:border-b-0 last:pb-0"
                  >
                    <span className="text-zinc-300 leading-tight">{item.label}</span>
                    <span className="font-bold text-emerald-400 whitespace-nowrap shrink-0">
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sangramento (-) */}
            <div className="rounded-xl border border-rose-500/25 bg-rose-950/15 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400">
                <FaArrowTrendDown className="size-3.5 shrink-0" />
                <span>Sangramento (Derruba o Faro)</span>
              </div>
              <div className="space-y-2">
                {BLEEDING_WEIGHTS.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 text-[11px] font-mono border-b border-rose-500/10 pb-1.5 last:border-b-0 last:pb-0"
                  >
                    <span className="text-zinc-300 leading-tight">{item.label}</span>
                    <span className="font-bold text-rose-400 whitespace-nowrap shrink-0">
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

