"use client"

import { useState } from "react"
import { FinancialPeriod } from "./types"
import { FINANCIAL_DATA_BY_PERIOD } from "./utils/financial-data"
import { DebtsHeader } from "./components/debts-header"
import { FinancialKpiGrid } from "./components/financial-kpi-grid"
import { PriorityDebtorCard } from "./components/priority-debtor-card"
import { PortfolioDistribution } from "./components/portfolio-distribution"
import { DebtsEfficiency } from "./components/debts-efficiency"
import type { UserPlanLimits } from "@/commons/models/subscription"

interface DebtsFeatureProps {
  planLimits?: UserPlanLimits | null
}

export function DebtsFeature({ planLimits }: DebtsFeatureProps) {
  const [period, setPeriod] = useState<FinancialPeriod>("month")
  const currentData = FINANCIAL_DATA_BY_PERIOD[period]

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
      {/* 1. Cabeçalho com Título, Seletor de Períodos e Ação Global */}
      <DebtsHeader
        period={period}
        onPeriodChange={setPeriod}
        planLimits={planLimits}
      />

      {/* 2. Grid dos 4 Cards Financeiros em R$ (A Receber, Já no Bolso, Travado, Prejuízo) */}
      <FinancialKpiGrid kpis={currentData.kpis} />

      {/* 3. Card do Alvo Imediato (Próxima Cobrança em Destaque Prioritário) */}
      <PriorityDebtorCard debtor={currentData.priorityDebtor} />

      {/* 4. Gráficos de Inteligência Financeira Lado a Lado (Distribuição da Carteira & Eficiência) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <PortfolioDistribution data={currentData.portfolio} />
        <DebtsEfficiency data={currentData.efficiency} />
      </div>
    </div>
  )
}
