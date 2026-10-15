"use client"

import { PromiseFilterTab, PromiseSortBy } from "./types"
import { FaMagnifyingGlass, FaArrowDownWideShort } from "react-icons/fa6"
import { cn } from "@/commons/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PROMISE_SORT_OPTIONS: { value: PromiseSortBy; label: string }[] = [
  { value: "late_first", label: "Atrasados no topo" },
  { value: "due_date_asc", label: "Vencimento próximo" },
  { value: "created_at_desc", label: "Mais recentes" },
  { value: "debtor_name_asc", label: "Nome (A-Z)" },
]

const PROMISE_SORT_LABELS: Record<PromiseSortBy, string> = {
  late_first: "Atrasados no topo",
  due_date_asc: "Vencimento próximo",
  created_at_desc: "Mais recentes",
  debtor_name_asc: "Nome (A-Z)",
}

type PromiseFiltersProps = {
  activeTab: PromiseFilterTab
  onTabChange: (tab: PromiseFilterTab) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: PromiseSortBy
  onSortChange: (sortBy: PromiseSortBy) => void
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
  sortBy,
  onSortChange,
  counts,
}: PromiseFiltersProps) {
  const tabs: { key: PromiseFilterTab; label: string; count: number; accent?: string }[] = [
    { key: "EM_ABERTO", label: "Em Aberto", count: counts.emAberto, accent: "text-zinc-300" },
    { key: "EM_DIA", label: "Em Dia", count: counts.emDia, accent: "text-emerald-400" },
    { key: "EM_ATRASO", label: "Em Atraso", count: counts.emAtraso, accent: "text-amber-400" },
    { key: "CALOTEIROS", label: "Caloteiros", count: counts.caloteiros, accent: "text-rose-400" },
  ]

  return (
    <div className="space-y-3 w-full">
      {/* Linha 1: Abas de Gravidade livres e confortáveis */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-mono font-bold transition-all whitespace-nowrap cursor-pointer shrink-0",
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

      {/* Linha 2: Busca Ampla e Seletor de Ordenação sem overflow */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        {/* Campo de Busca Rápida (flex-1 para ocupar todo o espaço restante) */}
        <div className="relative flex-1 min-w-0">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por devedor, vulgo ou dívida..."
            className="w-full h-10 bg-zinc-900 border border-border text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-[13px] rounded-xl pl-9.5 pr-3 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-all font-mono shadow-xs"
          />
        </div>

        {/* Seletor de Ordenação Shadcn UI com largura fixa para não empurrar a tela */}
        <div className="w-full sm:w-52 shrink-0">
          <Select
            value={sortBy}
            onValueChange={(val) => {
              if (val) onSortChange(val as PromiseSortBy)
            }}
          >
            <SelectTrigger
              size="default"
              className="h-10 w-full bg-zinc-900 border-border text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-850 transition-colors cursor-pointer rounded-xl"
            >
              <div className="flex items-center gap-2 truncate">
                <FaArrowDownWideShort className="size-3.5 text-zinc-400 shrink-0" />
                <SelectValue placeholder="Ordenar promessas">
                  {(val) =>
                    val ? PROMISE_SORT_LABELS[val as PromiseSortBy] || val : "Ordenar promessas"
                  }
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-200">
              {PROMISE_SORT_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs font-mono py-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-300 focus:text-white"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
