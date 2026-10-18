import { SummaryCardsGrid } from "./components/summary-cards-grid"
import { PromisesList } from "./components/promises-list"
import { NewButton } from "@/components/buttons/new-button"
import type {
  TrackingSummaryData,
  PaginatedPromisesResult,
} from "@/commons/models/tracking"
import type { UserPlanLimits } from "@/commons/models/subscription"

interface DashboardFeatureProps {
  initialSummary?: TrackingSummaryData
  initialPaginated?: PaginatedPromisesResult
  planLimits?: UserPlanLimits | null
}

export function DashboardFeature({
  initialSummary,
  initialPaginated,
  planLimits,
}: DashboardFeatureProps) {
  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full min-w-0 overflow-x-hidden">
      {/* Topo do Acompanhamento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Acompanhamento de Dívidas
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Status de promessas, cobranças em andamento e presas marcadas na sua gruta.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {planLimits?.maxDebtors !== null && planLimits?.maxDebtors !== undefined && (
            <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 shrink-0">
              <span>{planLimits.currentActiveDebtsCount} / {planLimits.maxDebtors} ativas</span>
              {planLimits.isDebtLimitReached && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  Limite atingido
                </span>
              )}
            </div>
          )}
          <NewButton
            href="/painel/dividas/nova"
            label="Nova Dívida"
            icon="file-circle-plus"
            isLocked={planLimits?.isDebtLimitReached}
            lockReason="debt"
            maxAllowed={planLimits?.maxDebtors ?? 2}
            planName={planLimits?.planName ?? "Tubarão Lixa"}
          />
        </div>
      </div>

      {/* Grade com os 4 Summary Cards Reais */}
      <SummaryCardsGrid data={initialSummary} />

      {/* Seção Central: Promessas com Infinite Scroll e Ordenação */}
      <PromisesList
        initialData={initialPaginated?.items}
        initialHasMore={initialPaginated?.hasMore}
        initialCounts={initialPaginated?.counts}
      />
    </div>
  )
}
