"use client"

import { useMemo, useState } from "react"
import { PromiseFilterTab, PromiseItem } from "./types"
import { DEFAULT_PROMISES } from "@/commons/utils/promise-status-map"
import { PromiseFilters } from "./promise-filters"
import { PromiseCardItem } from "./promise-card-item"
import { FaPlus } from "react-icons/fa6"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PromisesList({ initialData = DEFAULT_PROMISES }: { initialData?: PromiseItem[] }) {
  const [activeTab, setActiveTab] = useState<PromiseFilterTab>("EM_ABERTO")
  const [searchQuery, setSearchQuery] = useState("")

  const counts = useMemo(() => {
    return {
      emAberto: initialData.length,
      emDia: initialData.filter((p) => p.gravity === "EM_DIA").length,
      emAtraso: initialData.filter((p) => p.gravity === "ATRASO_LEVE" || p.gravity === "DESGULPA_PADRAO").length,
      caloteiros: initialData.filter((p) => p.gravity === "ACORDO_ROMPIDO").length,
    }
  }, [initialData])

  const filteredPromises = useMemo(() => {
    return initialData.filter((promise) => {
      // Filtro por Aba
      if (activeTab === "EM_DIA" && promise.gravity !== "EM_DIA") {
        return false
      }
      if (
        activeTab === "EM_ATRASO" &&
        promise.gravity !== "ATRASO_LEVE" &&
        promise.gravity !== "DESGULPA_PADRAO"
      ) {
        return false
      }
      if (activeTab === "CALOTEIROS" && promise.gravity !== "ACORDO_ROMPIDO") {
        return false
      }

      // Filtro por Busca
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = promise.debtorName.toLowerCase().includes(query)
        const matchesTitle = promise.debtTitle.toLowerCase().includes(query)
        return matchesName || matchesTitle
      }

      return true
    })
  }, [initialData, activeTab, searchQuery])

  return (
    <div className="space-y-4 pt-1">
      {/* Cabeçalho da Seção sem ícones soltos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
            Promessas
          </h3>
          <p className="text-xs sm:text-[13px] text-zinc-400 font-mono">
            Quem tá pagando e quem tá ensaiando o golpe.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/painel/dividas" />}
            size="sm"
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold shadow-xs shadow-white/10 text-xs sm:text-[13px] h-8.5 px-3.5"
          >
            <FaPlus className="size-3 mr-1" />
            Nova Dívida
          </Button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <PromiseFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      {/* Lista de Cards de Promessas */}
      {filteredPromises.length > 0 ? (
        <div className="space-y-3">
          {filteredPromises.map((promise) => (
            <PromiseCardItem key={promise.id} promise={promise} />
          ))}
        </div>
      ) : (
        /* Empty States Temáticos */
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 sm:p-10 text-center space-y-2.5">
          <p className="text-base font-bold text-white font-heading">
            {searchQuery
              ? "Nenhuma promessa encontrada para essa busca."
              : activeTab === "CALOTEIROS"
              ? "Nenhum caloteiro nessa categoria."
              : activeTab === "EM_ATRASO"
              ? "Nenhum atraso registrado no momento."
              : "Nenhuma promessa ativa no momento."}
          </p>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono max-w-md mx-auto">
            {searchQuery
              ? "Confira se digitou o nome certo ou se o devedor já sumiu do mapa."
              : activeTab === "CALOTEIROS"
              ? "Ou seus devedores viraram santos ou o milagre finalmente aconteceu."
              : activeTab === "EM_ATRASO"
              ? "Todo mundo em dia? Estranho... confere o extrato pra ver se não foi ilusão."
              : "Você pode registrar um novo acordo a qualquer momento."}
          </p>
        </div>
      )}
    </div>
  )
}
