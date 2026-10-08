"use client"

import { SummaryCard } from "@/components/cards/summary-card"
import { PercentageBadge } from "@/components/badges/percentage-badge"
import { formatTrendStatus, SUMMARY_CARD_CONFIGS } from "@/commons/utils/status-map"

export type DashboardSummaryData = {
  emAberto: {
    amount: string
    description: string
    last: string
    changePercent: number
  }
  emDia: {
    amount: string
    description: string
    last: string
    changePercent: number
  }
  emAtraso: {
    amount: string
    description: string
    last: string
    changePercent: number
  }
  caloteiros: {
    amount: string
    description: string
    last: string
    changePercent: number
  }
}

const defaultSummaryData: DashboardSummaryData = {
  emAberto: {
    amount: "16 suspeitos",
    description: "Promessas e pendências na praça",
    last: "Dívidas ativas no radar",
    changePercent: 12,
  },
  emDia: {
    amount: "8 milagreiros",
    description: "Pagando sem drama nem desculpa",
    last: "Raros e pontuais",
    changePercent: 5,
  },
  emAtraso: {
    amount: "5 sumidos",
    description: "Passou do prazo combinado",
    last: "Hora do 'bom dia, sumido'",
    changePercent: -8,
  },
  caloteiros: {
    amount: "3 lendas",
    description: "Deram o perdido no mês",
    last: "Alerta vermelho de golpe",
    changePercent: 15,
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

  const emAbertoTrend = formatTrendStatus(data.emAberto.changePercent, false)
  const emDiaTrend = formatTrendStatus(data.emDia.changePercent, false)
  const emAtrasoTrend = formatTrendStatus(data.emAtraso.changePercent, true)
  const caloteirosTrend = formatTrendStatus(data.caloteiros.changePercent, true)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1º Em Aberto */}
      <SummaryCard
        title={emAbertoConfig.title}
        amount={data.emAberto.amount}
        accent={emAbertoConfig.accent}
        icon={<EmAbertoIcon className="size-4" />}
        helpText={emAbertoConfig.helpText}
        description={data.emAberto.description}
        last={data.emAberto.last}
        percentage={
          <PercentageBadge
            status={emAbertoTrend.status}
            negative={emAbertoTrend.negative}
            statusText={emAbertoTrend.statusText}
          />
        }
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
        percentage={
          <PercentageBadge
            status={emDiaTrend.status}
            negative={emDiaTrend.negative}
            statusText={emDiaTrend.statusText}
          />
        }
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
        percentage={
          <PercentageBadge
            status={emAtrasoTrend.status}
            negative={emAtrasoTrend.negative}
            statusText={emAtrasoTrend.statusText}
          />
        }
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
        percentage={
          <PercentageBadge
            status={caloteirosTrend.status}
            negative={caloteirosTrend.negative}
            statusText={caloteirosTrend.statusText}
          />
        }
      />
    </div>
  )
}
