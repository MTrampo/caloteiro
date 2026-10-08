"use client"

import { PromiseFilterTab } from "./types"
import { FaMagnifyingGlass } from "react-icons/fa6"
import { cn } from "@/commons/lib/utils"

type PromiseFiltersProps = {
  activeTab: PromiseFilterTab
  onTabChange: (tab: PromiseFilterTab) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  counts: {
    emAberto: number
    emDia: number
    emAtraso: number
    caloteiros: number
  }
}

export function PromiseFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  counts,
}: PromiseFiltersProps) {
  const tabs: { key: PromiseFilterTab; label: string; count: number; accent?: string }[] = [
    { key: "EM_ABERTO", label: "Em Aberto", count: counts.emAberto, accent: "text-zinc-300" },
    { key: "EM_DIA", label: "Em Dia", count: counts.emDia, accent: "text-emerald-400" },
    { key: "EM_ATRASO", label: "Em Atraso", count: counts.emAtraso, accent: "text-amber-400" },
    { key: "CALOTEIROS", label: "Caloteiros", count: counts.caloteiros, accent: "text-rose-400" },
  ]

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Abas de Gravidade na mesma ordem dos Summary Cards */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-mono font-bold transition-all whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-zinc-800 text-white border border-zinc-700/90 shadow-sm shadow-black/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-mono font-black",
                  isActive ? "bg-zinc-950 text-zinc-100" : "bg-zinc-800/80 text-zinc-400",
                  tab.accent && !isActive && tab.accent
                )}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Campo de Busca Rápida */}
      <div className="relative w-full md:w-72">
        <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar devedor ou motivo..."
          className="w-full h-10 bg-zinc-900 border border-border text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-[13px] rounded-xl pl-9.5 pr-3 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all font-mono shadow-xs"
        />
      </div>
    </div>
  )
}
