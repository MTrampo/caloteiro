import Header from "@/components/header/dashboard"
import { SettingsFeature } from "@/features/settings"
import { getUserLogged } from "@/server/account/repository/auth.supabase"
import { getCreditorSettingsApi } from "@/server/account/service/creditor-settings.api"
import type { UserPermissions } from "@/commons/models/subscription"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configurações — Armas de Cobrança",
}

export default async function ConfiguracoesPage() {
  const {
    data: { user },
  } = await getUserLogged()

  let initialSettings = null
  let permissions: UserPermissions = {
    maxDebtors: 2,
    canCustomTemplates: false,
    canExportReports: false,
    canAccessFinancial: false,
    canDebtorPortal: false,
    canRiskScore: false,
    canAttachReceipts: false,
    isFreePlan: true,
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
