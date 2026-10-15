"use client"

import { SummaryCard } from "@/components/cards/summary-card"
import { SUMMARY_CARD_CONFIGS } from "@/commons/utils/status-map"
import type { AcompanhamentoSummaryData } from "@/commons/models/acompanhamento"
import { cn } from "@/commons/lib/utils"

export type DashboardSummaryData = AcompanhamentoSummaryData

const defaultSummaryData: DashboardSummaryData = {
  emAberto: {
    amount: "16 suspeitos",
    description: "Promessas e pendências na praça",
    last: "Dívidas ativas no radar",
    changePercent: 100,
  },
  emDia: {
    amount: "8 milagreiros",
    description: "Pagando sem drama nem desculpa",
    last: "Raros e pontuais",
    changePercent: 50,
  },
  emAtraso: {
    amount: "5 sumidos",
    description: "Passou do prazo combinado",
    last: "Hora do 'bom dia, sumido'",
    changePercent: 31,
  },
  caloteiros: {
    amount: "3 lendas",
    description: "Deram o perdido no mês",
    last: "Alerta vermelho de golpe",
    changePercent: 19,
  },
}

export function SummaryCardsGrid({ data = defaultSummaryData }: { data?: DashboardSummaryData }) {
  const emAbertoConfig = SUMMARY_CARD_CONFIGS.EM_ABERTO
  const emDiaConfig = SUMMARY_CARD_CONFIGS.EM_DIA
  const emAtrasoConfig = SUMMARY_CARD_CONFIGS.EM_ATRASO
  const caloteirosConfig = SUMMARY_CARD_CONFIGS.CALOTEIROS

  const EmAbertoIcon = emAbertoConfig.icon
  const EmDiaIcon = emDiaConfig.icon
  const EmAtrasoIcon = emAtrasoConfig.icon
  const CaloteirosIcon = caloteirosConfig.icon

  const emAbertoBadge = (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold text-zinc-300 bg-zinc-800/80 border border-zinc-700/60">
      {data.emAberto.changePercent}% no radar
    </span>
  )

  const emDiaBadge = (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border",
        data.emDia.changePercent > 0
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          : "text-zinc-400 bg-zinc-800/80 border-zinc-700/60"
      )}
    >
      {data.emDia.changePercent}% em dia
    </span>
  )

  const emAtrasoBadge = (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border",
        data.emAtraso.changePercent > 0
          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      )}
    >
      {data.emAtraso.changePercent}% em atraso
    </span>
  )

  const caloteirosBadge = (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border",
        data.caloteiros.changePercent > 0
          ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      )}
    >
      {data.caloteiros.changePercent}% crítico
    </span>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1º Em Aberto */}
      <SummaryCard
        title={emAbertoConfig.title}
        amount={data.emAberto.amount}
        accent={emAbertoConfig.accent}
        icon={<EmAbertoIcon className="size-4" />}
        helpText={emAbertoConfig.helpText}
        description={data.emAberto.description}
        last={data.emAberto.last}
        percentage={emAbertoBadge}
      />

      {/* 2º Em Dia */}
      <SummaryCard
        title={emDiaConfig.title}
        amount={data.emDia.amount}
        accent={emDiaConfig.accent}
        icon={<EmDiaIcon className="size-4" />}
        helpText={emDiaConfig.helpText}
        description={data.emDia.description}
        last={data.emDia.last}
        percentage={emDiaBadge}
      />

      {/* 3º Em Atraso */}
      <SummaryCard
        title={emAtrasoConfig.title}
        amount={data.emAtraso.amount}
        accent={emAtrasoConfig.accent}
        icon={<EmAtrasoIcon className="size-4" />}
        helpText={emAtrasoConfig.helpText}
        description={data.emAtraso.description}
        last={data.emAtraso.last}
        percentage={emAtrasoBadge}
      />

      {/* 4º Caloteiros */}
      <SummaryCard
        title={caloteirosConfig.title}
        amount={data.caloteiros.amount}
        accent={caloteirosConfig.accent}
        icon={<CaloteirosIcon className="size-4" />}
        helpText={caloteirosConfig.helpText}
        description={data.caloteiros.description}
        last={data.caloteiros.last}
        percentage={caloteirosBadge}
      />
    </div>
  )
}
