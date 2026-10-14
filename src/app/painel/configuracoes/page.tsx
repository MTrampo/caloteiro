import Header from "@/components/header/dashboard"
import { SettingsFeature } from "@/features/settings"
import { getUserLogged } from "@/server/account/repository/auth.supabase"
import { getCreditorSettingsApi } from "@/server/account/service/creditor-settings.api"
import { getUserPermissionsOrCacheApi } from "@/server/account/service/subscription.api"
import { redirect } from "next/navigation"
import type { UserPermissions } from "@/commons/models/subscription"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configurações — Armas de Cobrança",
}

export default async function ConfiguracoesPage() {
  const {
    data: { user },
  } = await getUserLogged()

  if (!user) {
    redirect("/entrar")
  }

  // Validação rápida via cache em cookie HMAC-SHA256
  const permissions: UserPermissions = await getUserPermissionsOrCacheApi(user.id)
  if (!permissions.canCustomTemplates) {
    redirect("/painel")
  }

  let initialSettings = null
  const res = await getCreditorSettingsApi(user.id)
  if (res.data) {
    initialSettings = res.data.settings
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
