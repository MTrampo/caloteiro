"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { FaCircleCheck, FaClock, FaCoins, FaUserXmark } from "react-icons/fa6"
import { FinancialKpiItem } from "../types"
import { formatCurrencyBRL } from "@/commons/utils/date-formatter"
import { cn } from "@/commons/lib/utils"
import { ResponsiveCardsCarousel } from "@/components/cards/responsive-cards-carousel"

type FinancialKpiGridProps = {
  kpis: {
    emAberto: FinancialKpiItem
    emDia: FinancialKpiItem
    emAtraso: FinancialKpiItem
    caloteiros: FinancialKpiItem
  }
}

export function FinancialKpiGrid({ kpis }: FinancialKpiGridProps) {
  const cards = [
    {
      key: "emAberto",
      data: kpis.emAberto,
      icon: FaCoins,
      badge: "A RECEBER",
      badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
      accentBorder: "hover:border-zinc-700",
      iconBox: "bg-zinc-800 text-zinc-100 border-zinc-700",
      valuePrefix: "",
      valueColor: "text-white",
    },
    {
      key: "emDia",
      data: kpis.emDia,
      icon: FaCircleCheck,
      badge: "RECEBIDO",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      accentBorder: "hover:border-emerald-500/40",
      iconBox: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      valuePrefix: "+ ",
      valueColor: "text-emerald-400",
    },
    {
      key: "emAtraso",
      data: kpis.emAtraso,
      icon: FaClock,
      badge: "TRAVADO",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      accentBorder: "hover:border-amber-500/40",
      iconBox: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      valuePrefix: "",
      valueColor: "text-amber-300",
    },
    {
      key: "caloteiros",
      data: kpis.caloteiros,
      icon: FaUserXmark,
      badge: "PREJUÍZO",
      badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      accentBorder: "hover:border-rose-500/40",
      iconBox: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      valuePrefix: "- ",
      valueColor: "text-rose-400",
    },
  ]

  return (
    <ResponsiveCardsCarousel desktopColumns={4} tabletColumns={2}>
      {cards.map(({ key, data, icon: Icon, badge, badgeClass, accentBorder, iconBox, valuePrefix, valueColor }) => (
        <Card
          key={key}
          className={cn(
            "overflow-hidden border border-border bg-card shadow-xs rounded-xl sm:rounded-2xl flex flex-col justify-between transition-all duration-200 h-full",
            accentBorder
          )}
        >
          {/* Header do Card com Tag Explícita de Ganho/Perda */}
          <CardHeader className="p-3.5 sm:p-4 pb-1 space-y-2.5">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn("p-1.5 rounded-lg border shadow-2xs shrink-0", iconBox)}>
                  <Icon className="size-4" />
                </div>
                <span className="font-bold text-sm sm:text-base uppercase tracking-wider text-zinc-100 font-mono truncate">
                  {data.title}
                </span>
              </div>

              <span className={cn("text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md border tracking-tight whitespace-nowrap shrink-0", badgeClass)}>
                {badge}
              </span>
            </div>
          </CardHeader>

          {/* Valor Financeiro em Destaque Grande */}
          <CardContent className="px-3.5 sm:px-4 py-2">
            <div className={cn("text-2xl sm:text-3xl font-black tracking-tight font-heading tabular-nums", valueColor)}>
              {valuePrefix}{formatCurrencyBRL(data.amount)}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1 line-clamp-2 min-h-[32px]">
              {data.description}
            </p>
          </CardContent>

          {/* Rodapé com Explicação do Fluxo */}
          <CardFooter className="flex-col items-start gap-1 p-3 px-3.5 sm:p-3.5 sm:px-4 bg-zinc-950/40 border-t border-border mt-1">
            <div className="text-[11px] sm:text-xs font-semibold text-zinc-400 font-mono flex items-center justify-between w-full">
              <span>{data.footnote}</span>
              <span
                className={cn(
                  "font-mono font-bold text-[11px]",
                  data.changePercent === 0
                    ? "text-zinc-500"
                    : data.isGainOrLoss === "positive"
                    ? "text-emerald-400"
                    : data.isGainOrLoss === "negative"
                    ? "text-rose-400"
                    : "text-zinc-300"
                )}
              >
                {data.isGainOrLoss === "positive" && data.changePercent > 0
                  ? `+${data.changePercent}%`
                  : `${data.changePercent}%`}
              </span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </ResponsiveCardsCarousel>
  )
}

