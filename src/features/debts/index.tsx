"use client"

import { useState, useTransition, useEffect } from "react"
import { toast } from "sonner"
import type { FinancialPeriod, FinancialAnalyticsResult } from "./types"
import { DebtsHeader } from "./components/debts-header"
import { FinancialKpiGrid } from "./components/financial-kpi-grid"
import { PriorityDebtorCard } from "./components/priority-debtor-card"
import { PortfolioDistribution } from "./components/portfolio-distribution"
import { DebtsEfficiency } from "./components/debts-efficiency"
import { MobileFloatingAction } from "@/components/buttons/mobile-floating-action"
import { FaFileCirclePlus, FaLock } from "react-icons/fa6"
import Link from "next/link"
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

  // Sincroniza quando initialData atualizar no servidor (router.refresh) no período padrão ("month")
  useEffect(() => {
    if (period === "month") {
      setData(initialData)
    }
  }, [initialData, period])

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

      {/* Banner de Presas Trancadas na Jaula (Cota Excedida) */}
      {data.lockedQuotaSummary?.isOverQuota && (
        <div className="rounded-2xl border border-rose-900/60 bg-rose-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-black/40">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <FaLock className="size-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-heading text-sm sm:text-base font-bold text-white">
                ⚠️ {data.lockedQuotaSummary.lockedDebtsCount}{" "}
                {data.lockedQuotaSummary.lockedDebtsCount === 1 ? "presa trancada" : "presas trancadas"} na Jaula do Tubarão
              </h4>
              <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                Os números consolidados abaixo refletem apenas sua dívida ativa liberada. Um total de{" "}
                <strong className="text-rose-400">
                  R$ {data.lockedQuotaSummary.lockedTotalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </strong>{" "}
                está retido na jaula e não entra nos KPIs até que você faça o upgrade.
              </p>
            </div>
          </div>
          <Link
            href="/painel/planos"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold text-xs shrink-0 transition-colors cursor-pointer w-full sm:w-auto"
          >
            Soltar a Fera &amp; Destravar
          </Link>
        </div>
      )}

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
