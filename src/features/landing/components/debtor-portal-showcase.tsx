"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  FaCheck,
  FaCopy,
  FaLock,
  FaShieldHalved,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { ResponsiveCardsCarousel } from "@/components/cards/responsive-cards-carousel";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DEBTOR_PORTAL_HIGHLIGHTS = [
  {
    title: "1. Acaba o clima de “favorzinho entre amigos”",
    description:
      "A presa acessa um portal protegido por código de segurança com extrato de parcelas, datas de vencimento e saldo devedor atualizado ao centavo.",
  },
  {
    title: "2. Zero desculpa de “me manda sua chave Pix de novo”",
    description:
      "Sua chave Pix e o nome do titular já ficam prontos para cópia em 1 toque direto na tela da fatura.",
  },
  {
    title: "3. Termo de acordo visível para a presa",
    description:
      "As regras combinadas e o limite de parcelas toleradas em atraso ficam expostos no documento, acelerando a decisão de pagar.",
  },
];

export function DebtorPortalShowcase() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const phoneCardRef = React.useRef<HTMLDivElement>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const [copiedPix, setCopiedPix] = React.useState(false);

  useGSAP(
    () => {
      if (phoneCardRef.current) {
        gsap.fromTo(
          phoneCardRef.current,
          { y: 36, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 55%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { scaleX: 0 },
          {
            scaleX: 0.35,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 50%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  const handleCopyPix = () => {
    navigator.clipboard.writeText("123.456.789-00");
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2200);
  };

  return (
    <section
      ref={sectionRef}
      id="portal-devedor"
      className="relative w-full py-12 sm:py-24 border-b border-emerald-500/20 bg-linear-to-br from-emerald-950/60 via-zinc-900/95 to-emerald-950/35 overflow-hidden scroll-mt-16 sm:scroll-mt-20"
    >
      {/* Iluminação Ambiental Verde Esmeralda de Contraste */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(16,185,129,0.16),transparent_60%)] pointer-events-none"
      />

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Coluna Esquerda: O Efeito Psicológico no Devedor (Texto Estático e Imediato) */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6 min-w-0">
          <div className="space-y-3">
            <h2 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Para você, uma central de caça. Para o devedor, uma fatura oficial
              impossível de ignorar.
            </h2>

            <p className="text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed">
              Quando você cobra digitando uma mensagem solta, o caloteiro trata
              como conversa entre amigos e empurra com a barriga. Quando ele
              abre o Link da Dívida do Caloteiro no celular, a postura muda na
              hora.
            </p>
          </div>

          {/* Mobile & Tablet (< lg): Carrossel Touch com Dots */}
          <div className="block lg:hidden pt-1">
            <ResponsiveCardsCarousel desktopColumns={3} tabletColumns={2}>
              {DEBTOR_PORTAL_HIGHLIGHTS.map((item, idx) => (
                <div
                  key={idx}
                  className="h-full rounded-2xl border border-emerald-500/25 bg-zinc-950/65 backdrop-blur-md p-4 flex flex-col justify-between gap-2"
                >
                  <h3 className="font-heading text-sm sm:text-base font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </ResponsiveCardsCarousel>
          </div>

          {/* Desktop (>= lg): 3 Cards Empilhados */}
          <div className="hidden lg:block space-y-3.5 pt-1">
            {DEBTOR_PORTAL_HIGHLIGHTS.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-emerald-500/25 bg-zinc-950/65 backdrop-blur-md p-4 space-y-1.5"
              >
                <h3 className="font-heading text-sm sm:text-base font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Mockup Fiel da Tela que o Devedor Enxerga no Celular */}
        <div ref={phoneCardRef} className="lg:col-span-6">
          <div className="max-w-md mx-auto rounded-3xl border border-emerald-500/35 bg-zinc-950/95 p-4 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.75)] space-y-4 sm:space-y-5">
            {/* Barra de Topo do Portal Público do Devedor (Empilhado no Mobile para evitar colisão em 320px) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <FaShieldHalved className="size-3.5 shrink-0" />
                <span>Portal de Quitação • Visão do Devedor</span>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 self-start sm:self-auto shrink-0">
                <FaLock className="size-2.5 text-emerald-400" />
                <span>PIN Verificado</span>
              </span>
            </div>

            {/* Identificação do Acordo */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 block">
                Devedor: <strong className="text-white">Carlos Silva</strong>
              </span>
              <h3 className="font-heading text-lg font-bold text-white">
                Empréstimo Reforma da Moto
              </h3>
            </div>

            {/* Progresso da Dívida na Visão da Presa */}
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-400">Falta Pagar:</span>
                <span className="font-heading text-xl font-bold text-white whitespace-nowrap">
                  R$ 1.800,00
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full w-full bg-emerald-400 origin-left scale-x-0 rounded-full"
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400">
                <span className="whitespace-nowrap">Já pago: R$ 600,00</span>
                <span className="text-amber-400 font-bold whitespace-nowrap">
                  Parcela 2/4 Vencida
                </span>
              </div>
            </div>

            {/* Caixa de Pagamento Pix Direto para o Devedor */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-emerald-300 font-bold">
                  Chave Pix para Pagamento Imediato
                </span>
                <span className="text-white font-bold whitespace-nowrap">
                  R$ 600,00
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-zinc-950/90 border border-zinc-800 p-3">
                <div className="min-w-0">
                  <span className="text-zinc-200 font-bold block font-mono text-sm tracking-wide">
                    123.456.789-00
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5 font-mono">
                    CPF • Nubank • Titular: Tubarão
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  {copiedPix ? (
                    <>
                      <FaCheck className="size-3 text-emerald-600" />
                      <span>Copiada!</span>
                    </>
                  ) : (
                    <>
                      <FaCopy className="size-3" />
                      <span>Copiar Pix</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Cláusula de Tolerância Visível */}
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 flex items-start gap-2.5 text-[11px] font-mono text-rose-200/90">
              <FaTriangleExclamation className="size-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>
                <strong>Regra do Acordo:</strong> O acúmulo de 2 parcelas
                vencidas caracteriza quebra de acordo com vencimento antecipado
                do saldo total.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

