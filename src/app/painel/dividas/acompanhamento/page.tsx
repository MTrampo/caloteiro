import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Header from "@/components/header/dashboard"
import { DashboardFeature } from "@/features/dashboard"
import { getUserLoggedApi } from "@/server/account/service/auth.api"
import { getTrackingDataApi } from "@/server/debts/service/tracking.api"
import { getPlanLimitsApi } from "@/server/account/service/subscription.api"

export const metadata: Metadata = {
  title: "Acompanhamento — Dívidas & Pessoas",
  description: "Status de promessas, cobranças em andamento e presas marcadas na sua gruta.",
}

export default async function AcompanhamentoPage() {
  const userRes = await getUserLoggedApi()
  const userId = userRes.data?.user?.id

  if (!userId) {
    redirect("/entrar")
  }

  const [{ summary, paginated }, planLimits] = await Promise.all([
    getTrackingDataApi({
      userId,
      page: 1,
      limit: 12,
      tab: "OPEN",
      sortBy: "late_first",
    }),
    getPlanLimitsApi(userId),
  ])

  return (
    <>
      <Header title="Acompanhamento" />
      <DashboardFeature
        initialSummary={summary}
        initialPaginated={paginated}
        planLimits={planLimits}
      />
    </>
  )
}
