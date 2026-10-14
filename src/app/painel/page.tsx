import Header from "@/components/header/dashboard"
import { HomeCommandFeature } from "@/features/home-command"
import {
  generateDynamicPunchline,
  getRandomWisdomQuote,
  getTimeGreeting,
} from "@/features/home-command/utils/greeting-helper"
import { getCurrentUserSessionProfileApi } from "@/server/account/service/auth.api"
import type { Metadata } from "next"

import { formatProperName } from "@/commons/utils/format"

export const metadata: Metadata = {
  title: "Painel — Central de Comando",
}

export default async function PainelPage() {
  const { user, profile, permissions } = await getCurrentUserSessionProfileApi()

  let userName = "Tubarão"
  if (user) {
    const rawName = profile?.nickname || profile?.name || (user.user_metadata?.name as string | undefined) || "Tubarão"
    userName = formatProperName(rawName) || "Tubarão"
  }

  // Gerado uma única vez no servidor para paridade absoluta entre SSR e Client
  const initialPunchline = generateDynamicPunchline({
    overdueCount: 2,
    criticalCount: 2,
    dueSoonCount: 3,
    totalCount: 16,
  })
  const initialTimeGreeting = getTimeGreeting()
  const initialWisdom = getRandomWisdomQuote()

  return (
    <>
      <Header title="Painel" />
      <HomeCommandFeature
        initialUserName={userName}
        initialPunchline={initialPunchline}
        initialTimeGreeting={initialTimeGreeting}
        initialWisdom={initialWisdom}
        canCopyPix={permissions?.canCustomTemplates ?? false}
      />
    </>
  )
}