import Header from "@/components/header/dashboard"
import { SettingsFeature } from "@/features/settings"
import { serverSupabase } from "@/commons/lib/supabase/server"
import { getCreditorSettingsApi } from "@/server/account/service/creditor-settings.api"
import type { UserPermissions } from "@/commons/models/subscription"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configurações — Armas de Cobrança",
}

export default async function ConfiguracoesPage() {
  const supabase = await serverSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let initialSettings = null
  let permissions: UserPermissions = {
    maxDebtors: 1,
    canCustomTemplates: false,
    canExportReports: false,
    isSubscriptionActive: false,
  }

  if (user) {
    const res = await getCreditorSettingsApi(user.id)
    if (res.data) {
      initialSettings = res.data.settings
      permissions = res.data.permissions
    }
  }

  return (
    <>
      <Header title="Configurações" />
      <SettingsFeature
        initialSettings={initialSettings}
        permissions={permissions}
      />
    </>
  )
}

