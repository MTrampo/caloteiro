import Header from "@/components/header/dashboard"
import { DebtsFeature } from "@/features/debts"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dívidas — Promessas e Pendências",
}

export default async function DividasPage() {
  return (
    <>
      <Header title="Dívidas" />
      <DebtsFeature />
    </>
  )
}
