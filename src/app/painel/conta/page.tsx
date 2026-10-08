import Header from "@/components/header/dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Minha Conta — Perfil & Assinatura",
}

export default function ContaPage() {
  return (
    <>
      <Header title="Minha Conta" />
      <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        <div className="space-y-0.5">
          <h2 className="font-heading text-lg md:text-xl font-bold tracking-tight text-white">
            Minha Conta & Assinatura
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Gerenciamento de dados de acesso, preferências e plano individual.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-slate-800/80 bg-slate-900/30 p-6 text-center">
          <p className="text-xs text-slate-400 font-mono">
            Estrutura base pronta para detalhamento das configurações de perfil e assinatura.
          </p>
        </div>
      </div>
    </>
  )
}
