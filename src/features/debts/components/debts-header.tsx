import { NewButton } from "@/components/buttons/new-button"
import type { UserPlanLimits } from "@/commons/models/subscription"

type DebtsHeaderProps = {
  onNewDebtClick?: () => void
  planLimits?: UserPlanLimits | null
}

export function DebtsHeader({ onNewDebtClick, planLimits }: DebtsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      {/* Bloco de Título */}
      <div className="space-y-1">
        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
          Financeiro
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono">
          Central de inteligência financeira, valores a receber e fluxo de caixa da gruta.
        </p>
      </div>

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
  )
}

