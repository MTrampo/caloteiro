"use client";

import * as React from "react";
import { FaCheck, FaUser, FaFileInvoiceDollar, FaCircleCheck } from "react-icons/fa6";

interface StepperNavProps {
  currentStepId: string;
  onStepClick?: (stepId: "target" | "terms" | "review") => void;
  canNavigateTo?: (stepId: "target" | "terms" | "review") => boolean;
}

const STEP_ITEMS = [
  {
    id: "target" as const,
    stepNumber: 1,
    title: "O Alvo",
    subtitle: "Escolher Devedor",
    icon: FaUser,
  },
  {
    id: "terms" as const,
    stepNumber: 2,
    title: "O Acordo",
    subtitle: "Valores & Prazos",
    icon: FaFileInvoiceDollar,
  },
  {
    id: "review" as const,
    stepNumber: 3,
    title: "Resumo & Confirmação",
    subtitle: "Conferir & Ativar",
    icon: FaCircleCheck,
  },
];

export function StepperNav({ currentStepId, onStepClick, canNavigateTo }: StepperNavProps) {
  const currentIndex = STEP_ITEMS.findIndex((s) => s.id === currentStepId);

  return (
    <div className="w-full space-y-3">
      {/* Desktop Stepper */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-3">
        {STEP_ITEMS.map((item, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isClickable = canNavigateTo ? canNavigateTo(item.id) : isCompleted;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              disabled={!isClickable && !isCurrent}
              onClick={() => isClickable && onStepClick?.(item.id)}
              className={`rounded-2xl border p-3.5 text-left transition-all flex items-center gap-3.5 ${
                isCurrent
                  ? "bg-zinc-900 border-zinc-700 shadow-xs"
                  : isCompleted
                  ? "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 cursor-pointer"
                  : "bg-zinc-950/30 border-zinc-900 opacity-60 cursor-not-allowed"
              }`}
            >
              {/* Badge do Número ou Checkmark */}
              <div
                className={`size-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                  isCompleted
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : isCurrent
                    ? "bg-white text-zinc-950 shadow-xs"
                    : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                }`}
              >
                {isCompleted ? <FaCheck className="size-3.5" /> : item.stepNumber}
              </div>

              {/* Textos do Passo */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-heading text-xs font-bold truncate ${
                      isCurrent ? "text-white" : isCompleted ? "text-zinc-200" : "text-zinc-500"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 truncate">
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile Stepper Compacto */}
      <div className="sm:hidden flex items-center justify-between bg-card border border-border p-3.5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
            {currentIndex + 1}
          </div>
          <div>
            <span className="font-heading text-xs font-bold text-white block">
              Passo {currentIndex + 1} de 3: {STEP_ITEMS[currentIndex]?.title}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 block">
              {STEP_ITEMS[currentIndex]?.subtitle}
            </span>
          </div>
        </div>

        {/* Indicador de Bolinhas */}
        <div className="flex items-center gap-1.5 shrink-0">
          {STEP_ITEMS.map((item, index) => (
            <div
              key={item.id}
              className={`size-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-5 bg-white"
                  : index < currentIndex
                  ? "bg-emerald-500"
                  : "bg-zinc-800"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

