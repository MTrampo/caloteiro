"use client"

import { DebtEfficiencyData } from "../types"
import { formatCompactCurrencyBRL, formatCurrencyBRL } from "@/commons/utils/date-formatter"
import { FaCircleCheck } from "react-icons/fa6"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

type DebtsEfficiencyProps = {
  data: DebtEfficiencyData
}

const chartConfig = {
  previsto: {
    label: "Previsto na Pista",
    color: "#52525b", // zinc-600 grafite
  },
  recebido: {
    label: "Pix Recebido",
    color: "#34d399", // emerald-400
  },
} satisfies ChartConfig

export function DebtsEfficiency({ data }: DebtsEfficiencyProps) {
  const { globalEfficiencyScore, totalPrevisto, totalRecebido, series, metrics } = data

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-6 h-full">
      {/* Cabeçalho com Título e Badge de Eficiência */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
            Eficiência das Dívidas
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Previsto na pista vs. Pix efetivamente recebido.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-2xs">
            <FaCircleCheck className="size-3.5" />
            <span>{globalEfficiencyScore}% Recuperado</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
            ({formatCompactCurrencyBRL(totalRecebido)} de {formatCompactCurrencyBRL(totalPrevisto)})
          </span>
        </div>
      </div>

      {/* Gráfico de Barras Comparativo (Previsto vs. Recebido) */}
      <div className="space-y-2">
        <ChartContainer config={chartConfig} className="h-44 sm:h-48 w-full aspect-auto">
          <BarChart
            data={series}
            margin={{ top: 10, right: 10, left: -16, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#27272a"
            />
            <XAxis
              dataKey="periodLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="#a1a1aa"
              fontSize={11}
              fontFamily="var(--font-mono)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#71717a"
              fontSize={10}
              fontFamily="var(--font-mono)"
              tickFormatter={(val: number) => formatCompactCurrencyBRL(val)}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload
                return (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 shadow-xl font-mono text-xs space-y-1.5 min-w-36">
                    <p className="font-bold text-white border-b border-zinc-800 pb-1">
                      {item.periodLabel} • {item.taxa}% Eficácia
                    </p>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-zinc-500" />
                        Previsto:
                      </span>
                      <span className="text-zinc-200 font-bold">
                        {formatCurrencyBRL(item.previsto)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-400" />
                        Recebido:
                      </span>
                      <span className="font-bold">
                        {formatCurrencyBRL(item.recebido)}
                      </span>
                    </div>
                  </div>
                )
              }}
            />
            <Bar
              dataKey="previsto"
              fill="#52525b"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="recebido"
              fill="#34d399"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ChartContainer>

        {/* Legenda do Gráfico */}
        <div className="flex items-center justify-between pt-1 text-xs font-mono font-semibold">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-xs bg-zinc-600" />
              <span className="text-zinc-400">Previsto na Pista</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-xs bg-emerald-400" />
              <span className="text-zinc-200">Pix no Bolso</span>
            </div>
          </div>

          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            {metrics.bestPeriodNote}
          </span>
        </div>
      </div>

      {/* Trio de Sub-Cards com Métricas de Eficiência e Tempo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
        {/* Sub-Card 1: Tempo Médio até o Pix */}
        <div className="rounded-xl border border-border bg-zinc-950/60 p-4 space-y-2 hover:border-zinc-700 transition-colors">
          <span className="text-[10px] sm:text-[11px] font-mono font-extrabold uppercase tracking-wider text-zinc-400 block">
            TEMPO ATÉ O PIX
          </span>
          <div className="text-xl sm:text-2xl font-black font-heading text-white tabular-nums tracking-tight">
            {metrics.averageTimeToPixDays} dias
          </div>
          <p className="text-xs text-emerald-400/90 font-mono line-clamp-1 font-medium">
            {metrics.averageTimeToPixDesc}
          </p>
        </div>

        {/* Sub-Card 2: Acordos Cumpridos */}
        <div className="rounded-xl border border-border bg-zinc-950/60 p-4 space-y-2 hover:border-zinc-700 transition-colors">
          <span className="text-[10px] sm:text-[11px] font-mono font-extrabold uppercase tracking-wider text-zinc-400 block">
            ACORDOS CUMPRIDOS
          </span>
          <div className="text-xl sm:text-2xl font-black font-heading text-white tabular-nums tracking-tight">
            {metrics.agreementsHonoredPercent}%
          </div>
          <p className="text-xs text-zinc-400 font-mono line-clamp-1 font-medium">
            {metrics.agreementsHonoredDesc}
          </p>
        </div>

        {/* Sub-Card 3: Taxa de Retorno Real */}
        <div className="rounded-xl border border-border bg-zinc-950/60 p-4 space-y-2 hover:border-zinc-700 transition-colors">
          <span className="text-[10px] sm:text-[11px] font-mono font-extrabold uppercase tracking-wider text-zinc-400 block">
            TAXA DE RETORNO
          </span>
          <div className="text-xl sm:text-2xl font-black font-heading text-white tabular-nums tracking-tight">
            {metrics.returnRatePercent}%
          </div>
          <p className="text-xs text-zinc-400 font-mono line-clamp-1 font-medium">
            {metrics.returnRateDesc}
          </p>
        </div>
      </div>
    </div>
  )
}
