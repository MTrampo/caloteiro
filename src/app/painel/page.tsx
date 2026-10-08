import Header from "@/components/header/dashboard"
import { HomeCommandFeature } from "@/features/home-command"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Painel — Central de Comando",
}

export default async function PainelPage() {
  return (
    <>
      <Header title="Painel" />
      <HomeCommandFeature />
    </>
  )
}