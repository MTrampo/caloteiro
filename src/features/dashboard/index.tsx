import { SummaryCardsGrid } from "./components/summary-cards-grid"
import { PromisesList } from "./components/promises-list"
import { NewButton } from "@/components/buttons/new-button"

export function DashboardFeature() {
  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
      {/* Topo do Acompanhamento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Acompanhamento de Dívidas
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Status de promessas, cobranças em andamento e pessoas no radar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NewButton
            href="/painel/dividas/nova"
            label="Nova Dívida"
            icon="plus"
          />
        </div>
      </div>

      {/* Grade com os 4 Summary Cards */}
      <SummaryCardsGrid />

      {/* Seção Central: Promessas */}
      <PromisesList />
    </div>
  )
}
