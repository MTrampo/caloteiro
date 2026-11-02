"use client"

import * as React from "react"
import { cn } from "@/commons/lib/utils"

export interface SegmentedTabItem<T extends string = string> {
  id: T
  label: string
  count?: number
  countVariant?: "default" | "danger" | "warning" | "emerald"
}

export interface SegmentedTabsProps<T extends string = string> {
  items: SegmentedTabItem<T>[]
  value: T
  onChange: (value: T) => void
  /**
   * Se verdadeiro, no mobile ocupa a largura total (w-full).
   * Padrão: true
   */
  fullWidthOnMobile?: boolean
  className?: string
  ariaLabel?: string
}

export function SegmentedTabs<T extends string = string>({
  items,
  value,
  onChange,
  fullWidthOnMobile = true,
  className,
  ariaLabel = "Filtros",
}: SegmentedTabsProps<T>) {
  if (!items || items.length === 0) return null

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none touch-pan-x [-webkit-overflow-scrolling:touch]",
        fullWidthOnMobile ? "w-full sm:w-auto" : "w-auto",
        className
      )}
    >
      {items.map((tab) => {
        const isActive = value === tab.id

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-1 text-[11px] sm:text-xs font-mono rounded-lg transition-all cursor-pointer whitespace-nowrap touch-manipulation",
              fullWidthOnMobile
                ? "flex-1 min-w-0 sm:flex-initial sm:min-w-max px-2 sm:px-3"
                : "shrink-0 min-w-max px-3",
              isActive
                ? "bg-white text-zinc-950 font-bold shadow-xs"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <span>{tab.label}</span>

            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 transition-colors",
                  isActive
                    ? tab.countVariant === "danger"
                      ? "bg-rose-500 text-white"
                      : tab.countVariant === "warning"
                      ? "bg-amber-500 text-white"
                      : tab.countVariant === "emerald"
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-950 text-zinc-100"
                    : tab.countVariant === "danger"
                    ? "bg-rose-500/20 text-rose-400"
                    : tab.countVariant === "warning"
                    ? "bg-amber-500/20 text-amber-400"
                    : tab.countVariant === "emerald"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-zinc-800 text-zinc-400"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

