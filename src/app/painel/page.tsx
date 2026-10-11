import Header from "@/components/header/dashboard"
import { HomeCommandFeature } from "@/features/home-command"
import {
  generateDynamicPunchline,
  getRandomWisdomQuote,
  getTimeGreeting,
} from "@/features/home-command/utils/greeting-helper"
import { getUserLoggedApi } from "@/server/account/service/auth.api"
import { getProfileByUserIdSupabase } from "@/server/account/repository/auth.supabase"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Painel — Central de Comando",
}

export default async function PainelPage() {
  const authResponse = await getUserLoggedApi()
  const user = authResponse.data?.user

  let userName = "Tubarão"
  if (user) {
    const { data: profile } = await getProfileByUserIdSupabase(user.id)
    userName = profile?.name || profile?.nickname || (user.user_metadata?.name as string | undefined) || "Tubarão"
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
      />
    </>
  )
}