import Header from "@/components/header/dashboard"
import { DebtorsFeature } from "@/features/debtors"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Devedores — Figurinhas & Suspeitos",
}

export default async function DevedoresPage() {
  return (
    <>
      <Header title="Devedores" />
      <DebtorsFeature />
    </>
  )
}

