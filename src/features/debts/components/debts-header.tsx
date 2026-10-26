import { NewButton } from "@/components/buttons/new-button"
import { FinancialPeriod } from "../types"
import type { UserPlanLimits } from "@/commons/models/subscription"
import { SegmentedTabs } from "@/components/ui/segmented-tabs"

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
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
        {/* Pills de Período */}
        <SegmentedTabs<FinancialPeriod>
          items={PERIOD_OPTIONS.map((opt) => ({ id: opt.id, label: opt.label }))}
          value={period}
          onChange={onPeriodChange}
          ariaLabel="Filtro de Período Financeiro"
          className="w-full sm:w-auto"
        />

        {/* Botão Nova Dívida (Desktop) */}
        <div className="hidden sm:inline-flex">
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
    </div>
  )
}

