import { NewButton } from "@/components/buttons/new-button"
import { FinancialPeriod } from "../types"
import { cn } from "@/commons/lib/utils"
import type { UserPlanLimits } from "@/commons/models/subscription"

type DebtsHeaderProps = {
  period: FinancialPeriod
  onPeriodChange: (period: FinancialPeriod) => void
  onNewDebtClick?: () => void
  planLimits?: UserPlanLimits | null
}

const PERIOD_OPTIONS: { id: FinancialPeriod; label: string; sub: string }[] = [
  { id: "month", label: "Mês", sub: "30 dias" },
  { id: "six_months", label: "6 Meses", sub: "Semestre" },
  { id: "year", label: "Ano", sub: "12 meses" },
]

export function DebtsHeader({ period, onPeriodChange, onNewDebtClick, planLimits }: DebtsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
      {/* Bloco de Título */}
      <div className="space-y-1">
        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
          Financeiro
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono">
          Central de inteligência financeira, valores a receber e fluxo de caixa da gruta.
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
        <NewButton
          href="/painel/dividas/nova"
          label="Nova Dívida"
          icon="file-circle-plus"
          onClick={onNewDebtClick}
          isLocked={planLimits?.isDebtLimitReached}
          lockReason="debt"
          maxAllowed={planLimits?.maxDebtors ?? 2}
          planName={planLimits?.planName ?? "Tubarão Lixa"}
        />
      </div>
    </div>
  )
}

