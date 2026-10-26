"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import type { FinancialPeriod, FinancialAnalyticsResult } from "./types"
import { DebtsHeader } from "./components/debts-header"
import { FinancialKpiGrid } from "./components/financial-kpi-grid"
import { PriorityDebtorCard } from "./components/priority-debtor-card"
import { PortfolioDistribution } from "./components/portfolio-distribution"
import { DebtsEfficiency } from "./components/debts-efficiency"
import { MobileFloatingAction } from "@/components/buttons/mobile-floating-action"
import { FaFileCirclePlus } from "react-icons/fa6"
import { getFinancialAnalyticsAction } from "@/actions/financial"
import type { UserPlanLimits } from "@/commons/models/subscription"
import { cn } from "@/commons/lib/utils"

interface DebtsFeatureProps {
  initialData: FinancialAnalyticsResult
  planLimits?: UserPlanLimits | null
}

export function DebtsFeature({ initialData, planLimits }: DebtsFeatureProps) {
  const [period, setPeriod] = useState<FinancialPeriod>("month")
  const [data, setData] = useState<FinancialAnalyticsResult>(initialData)
  const [isPending, startTransition] = useTransition()

  const handlePeriodChange = (newPeriod: FinancialPeriod) => {
    if (newPeriod === period) return
    setPeriod(newPeriod)

    startTransition(async () => {
      const res = await getFinancialAnalyticsAction({ period: newPeriod })
      if (res.success && res.data) {
        setData(res.data)
      } else if (!res.success) {
        toast.error(res.error || "Erro ao atualizar dados do período.")
      }
    })
  }

  return (
    <div className={cn("flex-1 p-4 sm:p-6 space-y-6 w-full transition-opacity duration-200 pb-24 sm:pb-6", isPending && "opacity-70")}>
      {/* 1. Cabeçalho com Título, Seletor de Períodos e Ação Global */}
      <DebtsHeader
        period={period}
        onPeriodChange={handlePeriodChange}
        planLimits={planLimits}
      />

      {/* 2. Grid dos 4 Cards Financeiros em R$ (A Receber, Já no Bolso, Travado, Prejuízo) */}
      <FinancialKpiGrid kpis={data.kpis} />

      {/* 3. Card do Alvo Imediato (Próxima Cobrança em Destaque Prioritário) */}
      <PriorityDebtorCard debtor={data.priorityDebtor} />

      {/* 4. Gráficos de Inteligência Financeira Lado a Lado (Distribuição da Carteira & Eficiência) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <PortfolioDistribution data={data.portfolio} />
        <DebtsEfficiency data={data.efficiency} />
      </div>

      {/* 5. Ação Flutuante no Mobile (FAB) */}
      <MobileFloatingAction
        actions={[
          {
            label: "Nova Dívida",
            icon: <FaFileCirclePlus className="size-5" />,
            href: "/painel/dividas/nova",
            isLocked: planLimits?.isDebtLimitReached,
            lockReason: "debt",
            maxAllowed: planLimits?.maxDebtors ?? 2,
            planName: planLimits?.planName ?? "Tubarão Lixa",
          },
        ]}
      />
    </div>
  )
}
