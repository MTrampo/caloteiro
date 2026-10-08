"use client"

import { PortfolioDistributionData } from "../types"
import { formatCompactCurrencyBRL, formatCurrencyBRL } from "@/commons/utils/date-formatter"

type PortfolioDistributionProps = {
  data: PortfolioDistributionData
}

export function PortfolioDistribution({ data }: PortfolioDistributionProps) {
  const { emDia, emAtraso, critico, healthMetrics, totalDebtors, totalAmount } = data

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-6 h-full">
      {/* Cabeçalho do Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
            Distribuição da Carteira
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Visualização proporcional do volume de dívidas no período.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400">
          <span>Total:</span>
          <span className="text-white bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
            {formatCurrencyBRL(totalAmount)} • {totalDebtors} devedores
          </span>
        </div>
      </div>

      {/* Barra Horizontal Segmentada Centralizada Verticalmente */}
      <div className="flex-1 flex flex-col justify-center space-y-4 my-auto py-2">
        <div className="h-4 sm:h-4.5 w-full bg-zinc-950 rounded-full overflow-hidden flex p-0.5 border border-zinc-800 shadow-inner">
          {/* Segmento 1: Em Dia */}
          <div
            style={{ width: `${emDia.percentage}%` }}
            title={`Em Dia: ${emDia.percentage}% (${formatCurrencyBRL(emDia.amount)})`}
            className="h-full bg-emerald-400 rounded-l-full transition-all duration-500 hover:brightness-110"
          />

          {/* Segmento 2: Atraso < 30 dias */}
          <div
            style={{ width: `${emAtraso.percentage}%` }}
            title={`Atraso < 30 dias: ${emAtraso.percentage}% (${formatCurrencyBRL(emAtraso.amount)})`}
            className="h-full bg-amber-400 transition-all duration-500 hover:brightness-110"
          />

          {/* Segmento 3: Risco Crítico > 30 dias */}
          <div
            style={{ width: `${critico.percentage}%` }}
            title={`Risco Crítico > 30 dias: ${critico.percentage}% (${formatCurrencyBRL(critico.amount)})`}
            className="h-full bg-rose-500 rounded-r-full transition-all duration-500 hover:brightness-110"
          />
        </div>

        {/* Faixa Conectada de Legenda e Proporção */}
        <div className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/80 gap-3 sm:gap-0">
            {/* Item 1: Em Dia */}
            <div className="sm:px-3 first:sm:pl-1 flex items-center justify-between sm:flex-col sm:items-center sm:justify-center gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-2.5 rounded-full bg-emerald-400 shrink-0 shadow-xs shadow-emerald-500/20" />
                <span className="text-xs font-mono font-bold text-zinc-300 truncate">
                  Em Dia <span className="text-zinc-500 font-normal">({emDia.count})</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-mono font-extrabold text-emerald-400">
                  {formatCompactCurrencyBRL(emDia.amount)}
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-400">
                  {emDia.percentage}%
                </span>
              </div>
            </div>

            {/* Item 2: Atraso < 30 dias */}
            <div className="pt-2.5 sm:pt-0 sm:px-3 flex items-center justify-between sm:flex-col sm:items-center sm:justify-center gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-2.5 rounded-full bg-amber-400 shrink-0 shadow-xs shadow-amber-500/20" />
                <span className="text-xs font-mono font-bold text-zinc-300 truncate">
                  Atraso &lt; 30d <span className="text-zinc-500 font-normal">({emAtraso.count})</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-mono font-extrabold text-amber-400">
                  {formatCompactCurrencyBRL(emAtraso.amount)}
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-400">
                  {emAtraso.percentage}%
                </span>
              </div>
            </div>

            {/* Item 3: Risco Crítico > 30 dias */}
            <div className="pt-2.5 sm:pt-0 sm:px-3 last:sm:pr-1 flex items-center justify-between sm:flex-col sm:items-center sm:justify-center gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-2.5 rounded-full bg-rose-500 shrink-0 shadow-xs shadow-rose-500/20" />
                <span className="text-xs font-mono font-bold text-zinc-300 truncate">
                  Crítico &gt; 30d <span className="text-zinc-500 font-normal">({critico.count})</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-mono font-extrabold text-rose-400">
                  {formatCompactCurrencyBRL(critico.amount)}
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-400">
                  {critico.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trio de Sub-Cards com Métricas de Saúde Financeira */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
        {/* Sub-Card 1: Liquidez Imediata */}
        <div className="rounded-xl border border-border bg-zinc-950/60 p-4 space-y-2 hover:border-zinc-700 transition-colors">
          <span className="text-[10px] sm:text-[11px] font-mono font-extrabold uppercase tracking-wider text-zinc-400 block">
            {healthMetrics.immediateLiquidityLabel}
          </span>
          <div className="text-xl sm:text-2xl font-black font-heading text-white tabular-nums tracking-tight">
            {formatCompactCurrencyBRL(healthMetrics.immediateLiquidity)}
          </div>
          <p className="text-xs text-emerald-400/90 font-mono truncate font-medium">
            {healthMetrics.immediateLiquidityDesc}
          </p>
        </div>

        {/* Sub-Card 2: Taxa de Resolução */}
        <div className="rounded-xl border border-border bg-zinc-950/60 p-4 space-y-2 hover:border-zinc-700 transition-colors">
          <span className="text-[10px] sm:text-[11px] font-mono font-extrabold uppercase tracking-wider text-zinc-400 block">
            {healthMetrics.resolutionRateLabel}
          </span>
          <div className="text-xl sm:text-2xl font-black font-heading text-white tabular-nums tracking-tight">
            {healthMetrics.resolutionRate}%
          </div>
          <p className="text-xs text-zinc-400 font-mono truncate font-medium">
            {healthMetrics.resolutionRateDesc}
          </p>
        </div>

        {/* Sub-Card 3: Ticket Médio Devedor */}
        <div className="rounded-xl border border-border bg-zinc-950/60 p-4 space-y-2 hover:border-zinc-700 transition-colors">
          <span className="text-[10px] sm:text-[11px] font-mono font-extrabold uppercase tracking-wider text-zinc-400 block">
            {healthMetrics.averageTicketLabel}
          </span>
          <div className="text-xl sm:text-2xl font-black font-heading text-white tabular-nums tracking-tight">
            {formatCompactCurrencyBRL(healthMetrics.averageTicket)}
          </div>
          <p className="text-xs text-zinc-400 font-mono truncate font-medium">
            {healthMetrics.averageTicketDesc}
          </p>
        </div>
      </div>
    </div>
  )
}
