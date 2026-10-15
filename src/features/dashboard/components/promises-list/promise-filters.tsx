"use client";

import { PromiseFilterTab, PromiseSortBy } from "./types";
import type { TrackingCounts } from "@/commons/models/tracking";
import { FaMagnifyingGlass, FaArrowDownWideShort } from "react-icons/fa6";
import { cn } from "@/commons/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROMISE_SORT_OPTIONS: { value: PromiseSortBy; label: string }[] = [
  { value: "late_first", label: "Atrasados no topo" },
  { value: "due_date_asc", label: "Vencimento próximo" },
  { value: "created_at_desc", label: "Mais recentes" },
  { value: "debtor_name_asc", label: "Nome (A-Z)" },
];

const PROMISE_SORT_LABELS: Record<PromiseSortBy, string> = {
  late_first: "Atrasados no topo",
  due_date_asc: "Vencimento próximo",
  created_at_desc: "Mais recentes",
  debtor_name_asc: "Nome (A-Z)",
};

interface PromiseFiltersProps {
  activeTab: PromiseFilterTab;
  onTabChange: (tab: PromiseFilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: PromiseSortBy;
  onSortChange: (sortBy: PromiseSortBy) => void;
  counts: TrackingCounts;
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
    { key: "OPEN", label: "Em Aberto", count: counts.open, accent: "text-zinc-300" },
    { key: "ON_TIME", label: "Em Dia", count: counts.onTime, accent: "text-emerald-400" },
    { key: "OVERDUE", label: "Em Atraso", count: counts.overdue, accent: "text-amber-400" },
    { key: "DEFAULTED", label: "Caloteiros", count: counts.defaulted, accent: "text-rose-400" },
  ];

  return (
    <div className="space-y-3 w-full">
      {/* Linha 1: Abas de Gravidade livres e confortáveis */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
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
          );
        })}
      </div>

      {/* Linha 2: Busca Ampla e Seletor de Ordenação sem overflow */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        {/* Campo de Busca Rápida */}
        <div className="relative flex-1 min-w-0">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por devedor, vulgo ou título..."
            className="w-full h-10 pl-9 pr-3.5 bg-zinc-950/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm rounded-xl outline-none focus:border-zinc-500 transition-colors font-mono"
          />
        </div>

        {/* Seletor de Ordenação com Shadcn Select */}
        <div className="w-full sm:w-[220px] shrink-0 min-w-0">
          <Select
            value={sortBy}
            onValueChange={(val) => onSortChange(val as PromiseSortBy)}
          >
            <SelectTrigger className="w-full h-10 bg-zinc-950/60 border border-zinc-800 text-zinc-200 text-xs font-mono rounded-xl px-3 focus:ring-0 focus:border-zinc-500">
              <div className="flex items-center gap-2 min-w-0">
                <FaArrowDownWideShort className="size-3.5 text-zinc-400 shrink-0" />
                <SelectValue placeholder="Ordenar por">
                  {PROMISE_SORT_LABELS[sortBy] || "Ordenar por"}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono rounded-xl shadow-xl min-w-[200px]">
              {PROMISE_SORT_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2 px-3 rounded-lg"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
