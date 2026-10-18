import Header from "@/components/header/dashboard"
import { DebtorForm } from "@/features/debtors/components/debtor-form"
import { getUserLoggedApi } from "@/server/account/service/auth.api"
import { getPlanLimitsApi } from "@/server/account/service/subscription.api"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FaTriangleExclamation } from "react-icons/fa6"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cadastrar Devedor — Caloteiro",
}

export default async function NovoDevedorPage() {
  const userRes = await getUserLoggedApi()
  const userId = userRes.data?.user?.id

  if (!userId) {
    redirect("/signin")
  }

  const planLimits = await getPlanLimitsApi(userId)

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

        {planLimits.isDebtorLimitReached ? (
          /* Bloqueio limpo quando o limite do plano foi atingido */
          <div className="py-16 sm:py-24 text-center space-y-5 max-w-md mx-auto">
            <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500 shadow-xs">
              <FaTriangleExclamation className="size-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-white">
                O Tanque Encheu!
              </h3>
              <p className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed">
                Seu plano atual ({planLimits.planName}) permite manter até {planLimits.maxDebtors} presas marcadas na sua gruta. Chega de amadorismo: é hora de evoluir de plano para marcar novos caloteiros!
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/painel/devedores"
                className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-4 text-xs font-mono rounded-xl border border-zinc-800 text-zinc-400 hover:text-white"
              >
                Voltar aos Devedores
              </Link>
              <Link
                href="/painel/conta/assinatura"
                className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-6 text-xs sm:text-sm font-bold font-heading rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 shadow-md"
              >
                Fazer Upgrade
              </Link>
            </div>
          </div>
        ) : (
          /* Formulário de Cadastro */
          <DebtorForm />
        )}
      </div>
    </>
  )
}

