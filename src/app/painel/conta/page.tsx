import Header from "@/components/header/dashboard"
import { AccountFeature } from "@/features/account"
import { serverSupabase } from "@/commons/lib/supabase/server"
import { getProfileByUserIdSupabase } from "@/server/account/repository/auth.supabase"
import { getSubscriptionByUserIdSupabase } from "@/server/account/repository/subscription.supabase"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Minha Conta — Perfil & Assinatura",
}

export default async function ContaPage() {
  const supabase = await serverSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  let subscription = null

  if (user) {
    const [{ data: userProfile }, userSubscription] = await Promise.all([
      getProfileByUserIdSupabase(user.id),
      getSubscriptionByUserIdSupabase(user.id),
    ])
    profile = userProfile
    subscription = userSubscription
  }

  return (
    <>
      <Header title="Minha Conta" />
      <AccountFeature profile={profile} subscription={subscription} />
    </>
  )
}
