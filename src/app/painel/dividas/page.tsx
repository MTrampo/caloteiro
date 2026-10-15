import Header from "@/components/header/dashboard"
import { DebtsFeature } from "@/features/debts"
import { getUserLogged } from "@/server/account/repository/auth.supabase"
import {
  getUserPermissionsOrCacheApi,
  getPlanLimitsApi,
} from "@/server/account/service/subscription.api"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Financeiro — Histórico Consolidado",
}

export default async function DividasPage() {
  const {
    data: { user },
  } = await getUserLogged()

  let planLimits = null

  if (user) {
    const [permissions, limits] = await Promise.all([
      getUserPermissionsOrCacheApi(user.id),
      getPlanLimitsApi(user.id),
    ])
    if (!permissions.canAccessFinancial) {
      redirect("/painel/dividas/acompanhamento")
    }
    planLimits = limits
  } else {
    redirect("/entrar")
  }

  return (
    <>
      <Header title="Financeiro" />
      <DebtsFeature planLimits={planLimits} />
    </>
  )
}
