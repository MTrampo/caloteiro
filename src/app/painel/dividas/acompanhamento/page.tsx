import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Header from "@/components/header/dashboard"
import { DashboardFeature } from "@/features/dashboard"
import { getUserLoggedApi } from "@/server/account/service/auth.api"
import { getAcompanhamentoDataApi } from "@/server/debts/service/acompanhamento.api"

export const metadata: Metadata = {
  title: "Acompanhamento — Dívidas & Pessoas",
  description: "Status de promessas, cobranças em andamento e pessoas no radar do Tubarão.",
}

export default async function AcompanhamentoPage() {
  const userRes = await getUserLoggedApi()
  const userId = userRes.data?.user?.id

  if (!userId) {
    redirect("/signin")
  }

  const { summary, paginated } = await getAcompanhamentoDataApi({
    userId,
    page: 1,
    limit: 12,
    tab: "EM_ABERTO",
    sortBy: "late_first",
  })

  return (
    <>
      <Header title="Acompanhamento" />
      <DashboardFeature
        initialSummary={summary}
        initialPaginated={paginated}
      />
    </>
  )
}
