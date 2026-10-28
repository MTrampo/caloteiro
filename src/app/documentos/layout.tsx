import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { getUserLoggedApi } from "@/server/account/service/auth.api";
import { FaArrowLeft, FaInstagram, FaWhatsapp, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { DocNav } from "@/features/documents/components/doc-nav";

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
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-background/90 backdrop-blur-md">
        <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link href="/" className="cursor-pointer shrink-0">
              <Logo size="sm" showText />
            </Link>

            {/* Links da Documentação (Desktop / Tablet) */}
            <div className="hidden md:block">
              <DocNav />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn ? (
              <Link
                href="/painel"
                className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <FaArrowLeft className="size-3" />
                <span>Voltar ao Painel</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/entrar"
                  className="inline-flex items-center h-8 sm:h-9 px-2.5 sm:px-3 text-[11px] sm:text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastrar"
                  className="inline-flex items-center h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  Criar Gruta Grátis
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Barra de Navegação de Documentos no Mobile (< md) */}
      <div className="md:hidden border-b border-border/70 bg-zinc-950/80 px-4 py-2 sticky top-14 z-30 backdrop-blur-md">
        <DocNav />
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 py-8 sm:py-16 max-w-5xl md:max-w-7xl space-y-6">
        {children}
      </main>

      {/* Rodapé Oficial da Documentação */}
      <footer className="border-t border-border/60 bg-zinc-950/90 pt-10 pb-8 text-xs font-mono text-zinc-400">
        <div className="mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-zinc-800/80 items-center justify-between">
            <div className="md:col-span-6 space-y-2">
              <Link href="/" className="inline-block cursor-pointer select-none">
                <Logo size="sm" showText />
              </Link>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed max-w-sm">
                Documentação oficial, termos de uso, privacidade e matriz de
                regras da plataforma Caloteiro.
              </p>
            </div>

            {/* Canais Oficiais de Contato */}
            <div className="md:col-span-6 flex flex-wrap items-center md:justify-end gap-2.5">
              <a
                href="https://instagram.com/meutrampo.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white transition-all text-xs"
              >
                <FaInstagram className="size-3.5 text-pink-400 shrink-0" />
                <span>@meutrampo.dev</span>
              </a>

              <a
                href="https://wa.me/5511911051247"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 transition-all text-xs"
              >
                <FaWhatsapp className="size-3.5 text-emerald-400 shrink-0" />
                <span>Suporte no WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 text-[11px] sm:text-xs">
            <p>
              © {new Date().getFullYear()} Caloteiro — A Gruta do Tubarão. Todos
              os direitos reservados.
            </p>

            <a
              href="https://meutrampo.dev.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <span>Desenvolvido por</span>
              <strong className="text-white font-semibold underline decoration-emerald-500/60 underline-offset-4">
                Meu Trampo
              </strong>
              <FaArrowUpRightFromSquare className="size-2.5 text-emerald-400" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
