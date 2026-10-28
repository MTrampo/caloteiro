"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { HeroCommandShowcase } from "./components/hero-command-showcase";
import { GrottoCommandSimulation } from "./components/grotto-command-simulation";
import { WhatsappWeaponsSimulator } from "./components/whatsapp-weapons-simulator";
import { DebtorPortalShowcase } from "./components/debtor-portal-showcase";
import { RealFeaturesBento } from "./components/real-features-bento";
import {
  GrottoVisualShowcase,
  FinalClosingBanner,
} from "./components/grotto-manifesto-banner";
import { PlansShowcaseSection } from "./components/plans-showcase-section";
import { LandingFaqSection } from "./components/landing-faq-section";
import { FaInstagram, FaWhatsapp, FaArrowUpRightFromSquare } from "react-icons/fa6";

export function LandingFeature() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Cabeçalho Sticky (Acompanha o Scroll sem barra de progresso) */}
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-border bg-background/90 backdrop-blur-md">
        <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="cursor-pointer select-none shrink-0">
            <Logo size="sm" showText />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono text-zinc-400">
            <a
              href="#central-gruta"
              className="hover:text-white transition-colors"
            >
              Central da Gruta
            </a>
            <a
              href="#armas-whatsapp"
              className="hover:text-white transition-colors"
            >
              Armas de WhatsApp
            </a>
            <a
              href="#portal-devedor"
              className="hover:text-white transition-colors"
            >
              Link do Devedor
            </a>
            <a href="#arsenal" className="hover:text-white transition-colors">
              Recursos
            </a>
            <a href="#planos" className="hover:text-white transition-colors">
              Planos
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              Dúvidas
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              href="/entrar"
              className="inline-flex items-center h-8 sm:h-9 px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-mono text-zinc-300 hover:text-white transition-colors"
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
        </div>
      </header>

      {/* Conteúdo Principal da Apresentação (Seções 100% Full-Width com contraste e bordas de ponta a ponta) */}
      <main className="flex-1 w-full overflow-x-clip">
        <HeroCommandShowcase />
        <GrottoCommandSimulation />
        <WhatsappWeaponsSimulator />
        <DebtorPortalShowcase />
        <RealFeaturesBento />
        <GrottoVisualShowcase />
        <PlansShowcaseSection />
        <LandingFaqSection />
        <FinalClosingBanner />
      </main>

      {/* Rodapé Completo da Gruta */}
      <footer className="border-t border-border/60 bg-zinc-950/90 pt-10 sm:pt-12 pb-8 text-xs font-mono text-zinc-400">
        <div className="mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl space-y-10">
          {/* Topo do Rodapé: Marca + Canais Sociais + Colunas de Links */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-zinc-800/80">
            {/* Coluna 1: Identidade + Instagram & WhatsApp Suporte (6 cols) */}
            <div className="md:col-span-6 space-y-4">
              <Link href="/" className="inline-block cursor-pointer select-none">
                <Logo size="md" showText />
              </Link>

              <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-sm">
                A Gruta oficial do Tubarão. Marque suas presas, registre cada
                caô com precisão cirúrgica e recupere o seu Pix sem pedir
                desculpas por cobrar.
              </p>

              {/* Botões de Contato e Redes Sociais */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href="https://instagram.com/meutrampo.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white transition-all"
                  title="Siga @meutrampo.dev no Instagram"
                >
                  <FaInstagram className="size-4 text-pink-400 shrink-0" />
                  <span>@meutrampo.dev</span>
                </a>

                <a
                  href="https://wa.me/5511911051247"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 transition-all"
                  title="Falar com o Suporte no WhatsApp"
                >
                  <FaWhatsapp className="size-4 text-emerald-400 shrink-0" />
                  <span>Suporte no WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Coluna 2: Navegação da Página (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-white block">
                Navegação
              </span>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <a
                    href="#central-gruta"
                    className="hover:text-white transition-colors"
                  >
                    Central da Gruta
                  </a>
                </li>
                <li>
                  <a
                    href="#armas-whatsapp"
                    className="hover:text-white transition-colors"
                  >
                    Armas de WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href="#arsenal"
                    className="hover:text-white transition-colors"
                  >
                    Motor e Recursos
                  </a>
                </li>
                <li>
                  <a
                    href="#planos"
                    className="hover:text-white transition-colors"
                  >
                    Espécies e Planos
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="hover:text-white transition-colors"
                  >
                    Dúvidas Frequentes
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Acesso e Transparência (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-white block">
                Acesso & Regras
              </span>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <Link
                    href="/cadastrar"
                    className="hover:text-white transition-colors"
                  >
                    Criar Gruta Grátis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/entrar"
                    className="hover:text-white transition-colors"
                  >
                    Entrar na Conta
                  </Link>
                </li>
                <li>
                  <Link
                    href="/documentos/planos"
                    className="hover:text-white transition-colors"
                  >
                    Comparativo de Planos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/documentos/termos"
                    className="hover:text-white transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/documentos/privacidade"
                    className="hover:text-white transition-colors"
                  >
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Barra Inferior: Copyright + Desenvolvido por Meu Trampo */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500">
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
