import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { getUserLoggedApi } from "@/server/account/service/auth.api";
import { FaArrowLeft } from "react-icons/fa6";

export default async function DocumentosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userRes = await getUserLoggedApi();
  const isLoggedIn = !!userRes.data?.user;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Topo Limpo dos Documentos */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="cursor-pointer">
              <Logo size="sm" showText />
            </Link>

            {/* Links da Documentação */}
            <nav className="hidden md:flex items-center gap-4 text-xs font-mono">
              <Link
                href="/documentos/planos"
                className="text-white font-bold hover:text-emerald-400 transition-colors"
              >
                Planos & Regras
              </Link>
              <span className="text-zinc-600 cursor-not-allowed" title="Em breve">
                Termos de Uso
              </span>
              <span className="text-zinc-600 cursor-not-allowed" title="Em breve">
                Privacidade
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/painel"
                className="inline-flex items-center gap-2 h-9 px-4 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition-all cursor-pointer"
              >
                <FaArrowLeft className="size-3" />
                <span>Voltar ao Painel</span>
              </Link>
            ) : (
              <Link
                href="/entrar"
                className="inline-flex items-center h-9 px-4 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition-all cursor-pointer"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {children}
      </main>

      {/* Rodapé da Documentação */}
      <footer className="border-t border-border/40 py-6 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Caloteiro — A Central do Tubarão.</p>
          <div className="flex items-center gap-4">
            <Link href="/assinatura" className="hover:text-zinc-300 transition-colors">
              Assinatura
            </Link>
            <Link href="/documentos/planos" className="hover:text-zinc-300 transition-colors">
              Comparativo de Planos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

