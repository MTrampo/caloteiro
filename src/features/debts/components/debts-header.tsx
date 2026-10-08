"use client"

import { FaCirclePlus } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import { FinancialPeriod } from "../types"
import { cn } from "@/commons/lib/utils"

type DebtsHeaderProps = {
  period: FinancialPeriod
  onPeriodChange: (period: FinancialPeriod) => void
  onNewDebtClick?: () => void
}

const PERIOD_OPTIONS: { id: FinancialPeriod; label: string; sub: string }[] = [
  { id: "month", label: "Mês", sub: "30 dias" },
  { id: "six_months", label: "6 Meses", sub: "Semestre" },
  { id: "year", label: "Ano", sub: "12 meses" },
]

export function DebtsHeader({ period, onPeriodChange, onNewDebtClick }: DebtsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
      {/* Bloco de Título */}
      <div className="space-y-1">
        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
          Gestão de Dívidas
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono">
          Central de valores a receber, dinheiro recuperado e alerta de calotes no período.
        </p>
      </div>

      {/* Controles: Seletor de Período e Botão de Ação */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Pills de Período */}
        <div className="inline-flex items-center rounded-xl bg-zinc-900 border border-border p-1 shadow-xs">
          {PERIOD_OPTIONS.map((opt) => {
            const isActive = period === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPeriodChange(opt.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-zinc-100 text-zinc-950 shadow-sm shadow-white/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                )}
              >
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>

        {/* Botão Nova Dívida */}
        <Button
          size="sm"
          onClick={onNewDebtClick}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold shadow-xs shadow-white/10 h-9 px-3.5"
        >
          <FaCirclePlus className="size-3.5 mr-1.5" />
          Nova Dívida
        </Button>
      </div>
    </div>
  )
}

