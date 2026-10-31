import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { getUserLoggedApi } from "@/server/account/service/auth.api";
import { FaInstagram, FaWhatsapp, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { DocNav } from "@/features/documents/components/doc-nav";
import { PublicHeader } from "@/components/headers/public-header";
import { LegalDocReadingTracker } from "@/components/analytics/legal-doc-reading-tracker";

export default async function DocumentosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userRes = await getUserLoggedApi();
  const isLoggedIn = !!userRes.data?.user;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Cabeçalho Unificado Oficial com NavigationMenu */}
      <PublicHeader isLoggedIn={isLoggedIn} />

      {/* Barra de Subnavegação Contextual dos Documentos */}
      <div className="border-b border-border/70 bg-zinc-950/70 px-4 py-2 sticky top-14 z-30 backdrop-blur-md">
        <div className="w-full mx-auto max-w-5xl md:max-w-7xl">
          <DocNav />
        </div>
      </div>
      <LegalDocReadingTracker />

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
