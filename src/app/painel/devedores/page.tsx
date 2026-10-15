import Header from "@/components/header/dashboard"
import { DebtorsFeature } from "@/features/debtors"
import { getUserLoggedApi } from "@/server/account/service/auth.api"
import { getDebtorsApi } from "@/server/debtors/service/debtor.api"
import { getPlanLimitsApi } from "@/server/account/service/subscription.api"
import type { DebtorItemFormatted } from "@/commons/models/debtor"
import type { UserPlanLimits } from "@/commons/models/subscription"
import { presentDebtorsList } from "@/commons/utils/format"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Devedores — Caloteiro",
}

export default async function DevedoresPage() {
  const userRes = await getUserLoggedApi()
  const userId = userRes.data?.user?.id

  let initialDebtors: DebtorItemFormatted[] = []
  let initialHasMore = false
  let initialTotalCount = 0
  let planLimits: UserPlanLimits | null = null

  if (userId) {
    const [res, limits] = await Promise.all([
      getDebtorsApi({
        userId,
        page: 1,
        limit: 12,
      }),
      getPlanLimitsApi(userId),
    ])
    initialDebtors = presentDebtorsList(res.items)
    initialHasMore = res.hasMore
    initialTotalCount = res.totalCount
    planLimits = limits
  }

  return (
    <>
      <Header title="Devedores" />
      <DebtorsFeature
        initialDebtors={initialDebtors}
        initialHasMore={initialHasMore}
        initialTotalCount={initialTotalCount}
        planLimits={planLimits}
      />
    </>
  )
}
