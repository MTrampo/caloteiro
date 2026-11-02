"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { trackAccountIntent } from "@/commons/utils/analytics";
import {
  FaCoins,
  FaWhatsapp,
  FaLockOpen,
  FaArrowRight,
  FaReceipt,
  FaClockRotateLeft,
  FaShieldHalved,
  FaCheck,
} from "react-icons/fa6";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const TRUST_PILLARS = [
  {
    icon: FaCoins,
    iconColor: "text-amber-400",
    title: "Sem Cartão para Começar",
    description:
      "Abra sua gruta gratuitamente com até 2 presas ativas. Teste todos os recursos essenciais na prática sem compromisso financeiro.",
  },
  {
    icon: FaLockOpen,
    iconColor: "text-emerald-400",
    title: "Zero Fidelidade ou Multas",
    description:
      "Você tem autonomia total. Altere seu plano ou cancele sua assinatura a qualquer momento com 1 clique direto no painel.",
  },
  {
    icon: FaReceipt,
    iconColor: "text-sky-400",
    title: "Pix Direto na Sua Conta",
    description:
      "O Caloteiro não retém seu dinheiro nem cobra comissão por Pix recebido. O pagamento cai 100% integral na sua conta bancária.",
  },
  {
    icon: FaWhatsapp,
    iconColor: "text-green-400",
    title: "Controle Total no WhatsApp",
    description:
      "As mensagens personalizadas saem a partir do seu próprio número de WhatsApp. Você revisa e envia no momento que achar melhor.",
  },
  {
    icon: FaShieldHalved,
    iconColor: "text-purple-400",
    title: "Criptografia de Dados (AES-256)",
    description:
      "CPFs e chaves Pix são criptografados no banco de dados com padrão militar. Nem a plataforma tem acesso em texto puro; somente você visualiza seus dados.",
  },
];

export function RoiAndTrustSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const featureCardsRef = React.useRef<HTMLDivElement>(null);
  const pillarsGridRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Entrada suave do cabeçalho da seção
      gsap.fromTo(
        ".trust-header",
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 2. Animação de entrada dos cards de Mural de Caôs e Arquivo de Provas
      gsap.fromTo(
        ".trust-feature-card",
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featureCardsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 3. Revelação em cascata dos 4 pilares de confiança
      gsap.fromTo(
        ".trust-pillar-card",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: pillarsGridRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="provas-e-garantias"
      className="w-full py-16 sm:py-24 border-b border-border/60 bg-zinc-950 relative overflow-hidden"
    >
      {/* Background sutil de iluminação */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 size-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl space-y-12 sm:space-y-16 relative z-10">
        {/* =========================================================================
            CABEÇALHO DA SEÇÃO
           ========================================================================= */}
        <div className="trust-header text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 block">
            Arsenal de Provas & Fricção Zero
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Chega de cair no mesmo papo. O Caloteiro guarda as provas.
          </h2>
          <p className="text-xs sm:text-base text-zinc-400 font-mono leading-relaxed">
            Elimine o constrangimento e as desculpas furadas com duas ferramentas
            exclusivas criadas para quem cansou de ouvir promessas vazias.
          </p>
        </div>

        {/* =========================================================================
            DESTAQUE NOBRE: MURAL DE CAÔS & ARQUIVO DE PROVAS
           ========================================================================= */}
        <div
          ref={featureCardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
        >
          {/* Card 1: Mural de Caôs */}
          <div className="trust-feature-card rounded-2xl border border-amber-500/30 bg-zinc-900/80 p-6 sm:p-8 space-y-5 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 transition-colors">
            <div className="absolute top-0 right-0 size-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <FaClockRotateLeft className="size-5" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300">
                  Exclusivo Cabeça Chato
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                  Mural de Caôs e Desculpas
                </h3>
                <p className="text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed">
                  Chega de cair na mesma conversa de &ldquo;sexta eu te pago sem falta&rdquo;. O Mural de Caôs
                  carimba cada promessa furada com data, hora e a justificativa que o caloteiro deu.
                </p>
              </div>

              {/* Prévia Visual do Caô Anotado */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Parcela #2 • Promessa não cumprida</span>
                  <span className="text-rose-400 font-bold">Não honrou</span>
                </div>
                <p className="text-zinc-200 italic">
                  &ldquo;O aplicativo do banco bloqueou meu limite diário. Te transfiro até meio-dia de amanhã!&rdquo;
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2 text-xs font-mono text-amber-300 font-semibold">
              <FaCheck className="size-3.5 shrink-0" />
              <span>Na próxima cobrança, você sabe exatamente o que ele já falou.</span>
            </div>
          </div>

          {/* Card 2: Arquivo de Provas Permanente */}
          <div className="trust-feature-card rounded-2xl border border-emerald-500/30 bg-zinc-900/80 p-6 sm:p-8 space-y-5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="absolute top-0 right-0 size-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <FaReceipt className="size-5" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  Cofre Permanente
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                  Arquivo de Provas Permanente
                </h3>
                <p className="text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed">
                  Cada parcela baixada tem seu comprovante Pix anexado diretamente na dívida.
                  Acabou o estresse de revirar extrato de banco procurando se o devedor pagou mesmo.
                </p>
              </div>

              {/* Prévia Visual do Comprovante Anexado */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Parcela #1 • Comprovante Arquivado</span>
                  <span className="text-emerald-400 font-bold">Liquidada</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-200">
                  <FaShieldHalved className="size-3.5 text-emerald-400 shrink-0" />
                  <span>Comprovante Pix autenticado e travado no histórico</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2 text-xs font-mono text-emerald-300 font-semibold">
              <FaCheck className="size-3.5 shrink-0" />
              <span>Zero discussão: a prova do pagamento fica gravada para sempre.</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PILARES DE CONFIANÇA & RISCO ZERO (DESTRUIDOR DE OBJEÇÕES)
           ========================================================================= */}
        <div className="space-y-6 pt-2">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
              Segurança e Fricção Zero para Você Cobrar
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Projetado para você ter o controle absoluto sem risco, sem travas e sem burocracia.
            </p>
          </div>

          <div
            ref={pillarsGridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <div
                  key={pillar.title}
                  className="trust-pillar-card rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="size-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Icon className={`size-4 ${pillar.iconColor}`} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-heading text-sm font-bold text-white">
                      {pillar.title}
                    </h4>
                    <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA de Fechamento com Estilo Branco Padronizado */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              render={<Link href="/cadastrar" />}
              onClick={() =>
                trackAccountIntent(
                  "provas_garantias_cta",
                  "Abrir Minha Gruta Grátis sem Cartão"
                )
              }
              className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl h-11 px-6 text-xs sm:text-sm font-mono cursor-pointer justify-center shadow-md"
            >
              <span>Abrir Minha Gruta Grátis sem Cartão</span>
              <FaArrowRight className="size-3.5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
