import Header from "@/components/header/dashboard"
import { DashboardFeature } from "@/features/dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Acompanhamento — Dívidas & Pessoas",
}

export default async function AcompanhamentoPage() {
  return (
    <>
      <Header title="Acompanhamento" />
      <DashboardFeature />
    </>
  )
}

