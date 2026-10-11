import Header from "@/components/header/dashboard"
import { DebtsFeature } from "@/features/debts"
import { getUserLogged } from "@/server/account/repository/auth.supabase"
import { getUserPermissionsByUserIdSupabase } from "@/server/account/repository/subscription.supabase"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Financeiro — Histórico Consolidado",
}

export default async function DividasPage() {
  const {
    data: { user },
  } = await getUserLogged()

  if (user) {
    const permissions = await getUserPermissionsByUserIdSupabase(user.id)
    if (!permissions.canAccessFinancial) {
      redirect("/painel/dividas/devedores")
    }
  }

  return (
    <>
      <Header title="Financeiro" />
      <DebtsFeature />
    </>
  )
}
