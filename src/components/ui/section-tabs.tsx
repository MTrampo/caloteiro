"use client";

import * as React from "react";
import { cn } from "@/commons/lib/utils";

export interface SectionTabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  accent?: string;
}

export interface SectionTabsProps<T extends string = string> {
  items: SectionTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

export function SectionTabs<T extends string = string>({
  items,
  value,
  onChange,
  className,
  ariaLabel = "Abas de seção",
}: SectionTabsProps<T>) {
  if (!items || items.length === 0) return null;

  const mobileGridClass =
    items.length === 4
      ? "grid grid-cols-2 sm:flex sm:flex-wrap"
      : items.length === 2
      ? "grid grid-cols-2 sm:flex sm:flex-wrap"
      : "grid grid-cols-1 sm:flex sm:flex-wrap";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "items-center gap-2 w-full",
        mobileGridClass,
        className
      )}
    >
      {items.map((tab) => {
        const isActive = value === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-mono font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 touch-manipulation",
              isActive
                ? "bg-zinc-800 text-white border border-zinc-700/90 shadow-sm shadow-black/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-zinc-800/60 sm:border-transparent"
            )}
          >
            <span>{tab.label}</span>

            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-mono font-black shrink-0",
                  isActive
                    ? "bg-zinc-950 text-zinc-100"
                    : "bg-zinc-800/80 text-zinc-400",
                  tab.accent && !isActive && tab.accent
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

