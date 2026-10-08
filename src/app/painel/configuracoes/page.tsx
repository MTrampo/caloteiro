import Header from "@/components/header/dashboard"
import { SettingsFeature } from "@/features/settings"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configurações — Armas de Cobrança",
}

export default async function ConfiguracoesPage() {
  return (
    <>
      <Header title="Configurações" />
      <SettingsFeature />
    </>
  )
}

