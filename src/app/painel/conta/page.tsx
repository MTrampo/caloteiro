import Header from "@/components/header/dashboard"
import { AccountFeature } from "@/features/account"
import { getUserLogged, getProfileByUserIdSupabase } from "@/server/account/repository/auth.supabase"
import {
  getSubscriptionByUserIdSupabase,
  getActivePlansSupabase,
} from "@/server/account/repository/subscription.supabase"
import { presentProfile } from "@/commons/utils/format"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Minha Conta — Perfil & Assinatura",
}

export default async function ContaPage() {
  const {
    data: { user },
  } = await getUserLogged()

  let profile = null
  let subscription = null
  let plans: any[] = []

  if (user) {
    const [{ data: userProfile }, userSubscription, allPlans] = await Promise.all([
      getProfileByUserIdSupabase(user.id),
      getSubscriptionByUserIdSupabase(user.id),
      getActivePlansSupabase(),
    ])
    profile = userProfile
      ? presentProfile(
          userProfile,
          userSubscription?.plan?.name || "Tubarão Lixa",
          userSubscription?.plan?.slug || "tubarao-lixa"
        )
      : null
    subscription = userSubscription
    plans = allPlans
  }

  return (
    <>
      <Header title="Minha Conta" />
      <AccountFeature profile={profile} subscription={subscription} plans={plans} />
    </>
  )
}

