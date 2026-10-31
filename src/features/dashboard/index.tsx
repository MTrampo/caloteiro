import { SummaryCardsGrid } from "./components/summary-cards-grid"
import { PromisesList } from "./components/promises-list"
import { NewButton } from "@/components/buttons/new-button"
import { MobileFloatingAction } from "@/components/buttons/mobile-floating-action"
import { FaFileCirclePlus, FaLock } from "react-icons/fa6"
import Link from "next/link"
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
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full min-w-0 overflow-x-hidden pb-24 sm:pb-6">
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

        <div className="hidden sm:flex items-center gap-3">
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

      {/* Banner da Jaula do Tubarão (quando houver presas excedentes trancadas) */}
      {initialPaginated?.lockedQuotaSummary?.isOverQuota && (
        <div className="rounded-2xl border border-rose-900/60 bg-rose-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-black/40">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <FaLock className="size-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-heading text-sm sm:text-base font-bold text-white">
                A Jaula do Tubarão está ativa: {initialPaginated.lockedQuotaSummary.lockedDebtsCount}{" "}
                {initialPaginated.lockedQuotaSummary.lockedDebtsCount === 1 ? "presa trancada" : "presas trancadas"}
              </h4>
              <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                Seu plano permite manter apenas {initialPaginated.lockedQuotaSummary.maxAllowed} dívida ativa. Suas maiores dívidas (totalizando R${" "}
                {initialPaginated.lockedQuotaSummary.lockedTotalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}) foram trancadas na jaula e não estão somadas nos totais.
              </p>
            </div>
          </div>
          <Link
            href="/painel/planos"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold text-xs shrink-0 transition-colors cursor-pointer w-full sm:w-auto"
          >
            Destravar Minhas Presas
          </Link>
        </div>
      )}

      {/* Grade com os 4 Summary Cards Reais */}
      <SummaryCardsGrid data={initialSummary} />

      {/* Seção Central: Promessas com Infinite Scroll e Ordenação */}
      <PromisesList
        initialData={initialPaginated?.items}
        initialHasMore={initialPaginated?.hasMore}
        initialCounts={initialPaginated?.counts}
      />

      {/* Ação Flutuante no Mobile (FAB) */}
      <MobileFloatingAction
        actions={[
          {
            label: "Nova Dívida",
            icon: <FaFileCirclePlus className="size-5" />,
            href: "/painel/dividas/nova",
            isLocked: planLimits?.isDebtLimitReached,
            lockReason: "debt",
            maxAllowed: planLimits?.maxDebtors ?? 2,
            planName: planLimits?.planName ?? "Tubarão Lixa",
          },
        ]}
      />
    </div>
  )
}
