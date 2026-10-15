"use client"

import Link from "next/link"
import { PromiseItem } from "./types"
import { GRAVITY_CONFIGS } from "@/commons/utils/promise-status-map"
import { Progress } from "@/components/ui/progress"
import { FaArrowRight, FaClock } from "react-icons/fa6"
import { cn } from "@/commons/lib/utils"

function getInitials(name: string) {
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function PromiseCardItem({ promise }: { promise: PromiseItem }) {
  const config = GRAVITY_CONFIGS[promise.gravity]
  const GravityIcon = config.icon
  const percentage = Math.round((promise.paidInstallments / Math.max(1, promise.totalInstallments)) * 100)
  const initials = promise.debtorInitials || getInitials(promise.debtorName)

  return (
    <Link
      href={promise.url}
      className={cn(
        "group block rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-5 transition-all duration-200 hover:border-zinc-700 hover:shadow-md hover:shadow-black/40 shadow-xs overflow-hidden",
        config.leftBorder,
        config.cardBg,
        config.borderHover
      )}
    >
      {/* Container Principal Adaptável com Grid de 12 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Bloco 1: Devedor & Motivo (4 colunas no desktop com divisor) */}
        <div className="flex items-center gap-3.5 md:col-span-4 min-w-0 md:pr-4 md:border-r md:border-border">
          <div className="size-11 sm:size-12 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center font-mono text-sm font-bold text-zinc-100 shrink-0 shadow-sm shadow-black/40">
            {initials}
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <h4 className="font-heading text-base sm:text-lg font-bold text-white truncate group-hover:text-zinc-100 transition-colors">
                {promise.debtorName}
              </h4>
              {promise.debtorNickname && (
                <span className="text-[11px] font-mono text-zinc-400 shrink-0 hidden sm:inline">
                  "{promise.debtorNickname}"
                </span>
              )}
            </div>
            <p className="text-xs sm:text-[13px] text-zinc-400 font-mono truncate font-medium">
              {promise.debtTitle}
            </p>
          </div>
        </div>

        {/* Bloco 2: Situação do Prazo / Vencimento (3 colunas no desktop com divisor) */}
        <div className="flex flex-col justify-center space-y-1 md:col-span-3 md:px-4 md:border-r md:border-border">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
            Situação do Prazo
          </span>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-200">
            <FaClock className="size-3.5 text-zinc-400 shrink-0" />
            <span>{promise.dueStatusText}</span>
          </div>
        </div>

        {/* Bloco 3: Progresso das Parcelas (3 colunas no desktop com divisor) */}
        <div className="flex flex-col justify-center space-y-1.5 py-1 md:py-0 border-y md:border-y-0 border-border/60 md:col-span-3 md:px-4 md:border-r md:border-border">
          <div className="flex items-center justify-between text-xs sm:text-[13px] font-mono font-bold">
            <span className="text-zinc-200">
              {promise.paidInstallments} de {promise.totalInstallments} parcelas
            </span>
            <span className="text-zinc-400 text-xs font-semibold">
              {percentage}%
            </span>
          </div>
          <Progress
            value={percentage}
            indicatorClassName={config.progressColor}
            className="h-2.5 w-full bg-zinc-950 border border-zinc-800"
          />
        </div>

        {/* Bloco 4: Gravidade & Botão Ver Dívida (2 colunas no desktop) */}
        <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-2 md:col-span-2 md:pl-2 shrink-0">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-[13px] font-mono font-bold border shrink-0",
              config.badgeClass
            )}
          >
            <GravityIcon className="size-3.5" />
            <span>{config.label}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-zinc-400 group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all">
            <span>Ver Dívida</span>
            <FaArrowRight className="size-3.5" />
          </div>
        </div>

      </div>
    </Link>
  )
}
