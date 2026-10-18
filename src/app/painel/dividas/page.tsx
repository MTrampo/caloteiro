import Header from "@/components/header/dashboard"
import { DebtsFeature } from "@/features/debts"
import { getUserLogged } from "@/server/account/repository/auth.supabase"
import {
  getUserPermissionsOrCacheApi,
  getPlanLimitsApi,
} from "@/server/account/service/subscription.api"
import { getFinancialAnalyticsApi } from "@/server/debts/service/financial.api"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Financeiro — Histórico Consolidado",
}

export default async function DividasPage() {
  const {
    data: { user },
  } = await getUserLogged()

  if (!user) {
    redirect("/entrar")
  }

  const [permissions, planLimits, initialData] = await Promise.all([
    getUserPermissionsOrCacheApi(user.id),
    getPlanLimitsApi(user.id),
    getFinancialAnalyticsApi(user.id, "month"),
  ])

  if (!permissions.canAccessFinancial) {
    redirect("/painel/dividas/acompanhamento")
  }

  return (
    <>
      <Header title="Financeiro" />
      <DebtsFeature initialData={initialData} planLimits={planLimits} />
    </>
  )
}
