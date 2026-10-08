import { SummaryCardsGrid } from "./components/summary-cards-grid"
import { PromisesList } from "./components/promises-list"
import { FaCirclePlus } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
          <Button
            render={<Link href="/painel/dividas" />}
            size="sm"
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold shadow-xs shadow-white/10 h-9 px-3.5"
          >
            <FaCirclePlus className="size-3.5 mr-1.5" />
            Nova Dívida
          </Button>
        </div>
      </div>

      {/* Grade com os 4 Summary Cards */}
      <SummaryCardsGrid />

      {/* Seção Central: Promessas */}
      <PromisesList />
    </div>
  )
}
