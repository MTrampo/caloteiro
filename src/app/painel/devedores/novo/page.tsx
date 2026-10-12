import Header from "@/components/header/dashboard"
import { DebtorForm } from "@/features/debtors/components/debtor-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cadastrar Devedor — Caloteiro",
}

export default async function NovoDevedorPage() {
  return (
    <>
      <Header title="Novo Devedor" />
      <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        {/* Cabeçalho da Página (Solto, sem card, sem ícones no título) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="space-y-1">
            <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
              Cadastrar Devedor
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Fiche quem pegou seu dinheiro antes que ele invente que perdeu o celular.
            </p>
          </div>
        </div>

        {/* Formulário de Cadastro */}
        <DebtorForm />
      </div>
    </>
  )
}

