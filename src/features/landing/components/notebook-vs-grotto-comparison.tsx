"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { trackSimulator, trackAccountIntent } from "@/commons/utils/analytics";
import {
  FaBookOpen,
  FaShieldHalved,
  FaCheck,
  FaXmark,
  FaClock,
  FaFileInvoiceDollar,
  FaWhatsapp,
  FaCoins,
  FaArrowRight,
  FaRotate,
  FaSkull,
} from "react-icons/fa6";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface ComparisonScenario {
  id: string;
  topic: string;
  notebook: {
    title: string;
    description: string;
    consequence: string;
  };
  caloteiro: {
    title: string;
    description: string;
    advantage: string;
  };
}

const COMPARISON_SCENARIOS: ComparisonScenario[] = [
  {
    id: "due-date",
    topic: "O Dia do Vencimento",
    notebook: {
      title: "Cobrança esquecida e constrangimento",
      description:
        "Passam 2 semanas do prazo, você lembra de repente e fica com vergonha de parecer chato cobrando tarde.",
      consequence: "O caloteiro finge demência e o dinheiro esfria na praça.",
    },
    caloteiro: {
      title: "Alerta no dia com mensagem pronta",
      description:
        "A Gruta avisa o vencimento iminente e já prepara a mensagem no WhatsApp com 1 clique para você enviar.",
      advantage: "Zero vergonha. Postura firme no dia exato sem perder a amizade.",
    },
  },
  {
    id: "receipts",
    topic: "Comprovantes e Recibos",
    notebook: {
      title: "\"Já te fiz esse Pix, você não viu?\"",
      description:
        "O devedor jura que pagou uma parcela mês passado e você perde 40 minutos revirando extrato bancário para checar.",
      consequence: "Discussão desgastante e risco de dar quitação sem ter recebido.",
    },
    caloteiro: {
      title: "Arquivo de Provas permanente",
      description:
        "Cada parcela quitada tem o print do comprovante e recibo fixados na própria dívida.",
      advantage: "Histórico blindado: se não está no arquivo, a parcela não foi paga.",
    },
  },
  {
    id: "excuses",
    topic: "As Desculpas e Promessas",
    notebook: {
      title: "Caindo no mesmo papo toda sexta",
      description:
        "\"Meu banco caiu\", \"vou receber um freela e te passo\": você aceita a desculpa e esquece o que ele combinou antes.",
      consequence: "Você financia o devedor enquanto ele posta foto em churrasco.",
    },
    caloteiro: {
      title: "Mural de Caôs com linha do tempo",
      description:
        "O sistema carimba a data e o motivo de cada justificativa registrada pelo devedor.",
      advantage: "Na próxima desculpa, você tem o histórico completo para não ser enrolado.",
    },
  },
  {
    id: "pix-key",
    topic: "A Chave Pix",
    notebook: {
      title: "\"Me manda sua chave Pix de novo\"",
      description:
        "O caloteiro pede sua chave toda vez para ganhar tempo e enrolar mais 3 dias antes de transferir.",
      consequence: "Você vira cobrador de telemarketing redigitando a mesma chave toda semana.",
    },
    caloteiro: {
      title: "Link da Dívida com Pix 1-Clique",
      description:
        "Página exclusiva da dívida com código Pix Copia e Cola pronto e cálculo atualizado.",
      advantage: "O devedor abre no celular, clica em copiar e paga no banco em 30 segundos.",
    },
  },
  {
    id: "interest",
    topic: "Cálculo de Juros e Multas",
    notebook: {
      title: "Cálculo no papel de padaria",
      description:
        "Calcular juros compostos ou mora na mão dá preguiça, você arredonda para baixo e perde dinheiro para a inflação.",
      consequence: "Você empresta R$ 1.000 e recebe R$ 1.000 um ano depois, pagando para emprestar.",
    },
    caloteiro: {
      title: "Juros automáticos (% a.m. e Fixa)",
      description:
        "Taxa ao mês (% a.m.) ou taxa fixa em Reais aplicadas e recalculadas automaticamente a cada dia de atraso.",
      advantage: "Precisão matemática cirúrgica: seu dinheiro rende o que é justo.",
    },
  },
];

export function NotebookVsGrottoComparison() {
  const [mobileActiveView, setMobileActiveView] = React.useState<
    "notebook" | "caloteiro"
  >("caloteiro");

  const sectionRef = React.useRef<HTMLElement>(null);
  const desktopCardsRef = React.useRef<HTMLDivElement>(null);
  const mobileCardsRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Revelação suave do cabeçalho da seção
      gsap.fromTo(
        ".comparison-header",
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

      // 2. Animação de entrada das colunas no desktop
      gsap.fromTo(
        ".comparison-desktop-col",
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.16,
          ease: "power3.out",
          scrollTrigger: {
            trigger: desktopCardsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 3. Stagger nos cenários individuais
      gsap.fromTo(
        ".comparison-item",
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.07,
          ease: "power2.out",
          scrollTrigger: {
            trigger: desktopCardsRef.current,
            start: "top 76%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  // Microanimação ao alternar entre Caderninho e Caloteiro no mobile
  useGSAP(
    () => {
      if (!mobileCardsRef.current) return;
      gsap.fromTo(
        mobileCardsRef.current.children,
        { opacity: 0.4, y: 10, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.05,
          ease: "back.out(1.8)",
        }
      );
    },
    { dependencies: [mobileActiveView], scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="comparativo"
      className="w-full py-16 sm:py-24 border-b border-border/60 bg-zinc-950 relative overflow-hidden"
    >
      {/* Background sutil de iluminação de predador */}
      <div className="absolute top-0 right-1/4 size-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 size-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl space-y-10 sm:space-y-14 relative z-10">
        {/* Cabeçalho da Seção */}
        <div className="comparison-header text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 block">
            Contraste de Sobrevivência
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            O Caderninho de Papel vs. A Gruta do Tubarão
          </h2>
          <p className="text-xs sm:text-base text-zinc-400 font-mono leading-relaxed">
            Veja a diferença entre depender da memória para não levar golpe e
            assumir o controle profissional de cada centavo que está na rua.
          </p>
        </div>

        {/* =========================================================================
            1. VERSÃO DESKTOP (LADO A LADO COM ALTO CONTRASTE - 1024px+)
           ========================================================================= */}
        <div
          ref={desktopCardsRef}
          className="hidden lg:grid grid-cols-2 gap-6 items-stretch"
        >
          {/* Coluna 1: O Caderninho (O Lado Arcaico / Perdedor) */}
          <div className="comparison-desktop-col rounded-2xl border border-amber-900/30 bg-amber-950/10 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Topo do Card Caderninho */}
              <div className="flex items-center justify-between pb-4 border-b border-amber-900/20">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <FaBookOpen className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-zinc-200">
                      O Caderninho
                    </h3>
                    <p className="text-xs font-mono text-zinc-400">
                      Bloco de notas, conversa do WhatsApp e papel amassado
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400">
                  Perda de Dinheiro
                </span>
              </div>

              {/* Lista dos 5 Cenários no Caderninho */}
              <div className="space-y-4">
                {COMPARISON_SCENARIOS.map((item) => (
                  <div
                    key={item.id}
                    className="comparison-item p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
                      <FaXmark className="size-3.5 shrink-0" />
                      <span>{item.topic}</span>
                    </div>
                    <p className="font-heading text-sm font-bold text-zinc-300">
                      {item.notebook.title}
                    </p>
                    <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                      {item.notebook.description}
                    </p>
                    <div className="pt-1 text-[11px] font-mono text-rose-400/90 italic">
                      {item.notebook.consequence}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-amber-900/20 text-center text-xs font-mono text-zinc-400">
              Resultado: você cansa de se desgastar e dá a dívida como perdida.
            </div>
          </div>

          {/* Coluna 2: O Caloteiro (A Gruta do Tubarão - O Lado Implacável) */}
          <div className="comparison-desktop-col rounded-2xl border border-emerald-500/30 bg-zinc-950/90 p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 size-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Topo do Card Caloteiro */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <FaShieldHalved className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white">
                      O Caloteiro (A Gruta)
                    </h3>
                    <p className="text-xs font-mono text-zinc-400">
                      Inteligência de cobrança, juros automáticos e provas
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  Controle do Predador
                </span>
              </div>

              {/* Lista dos 5 Cenários no Caloteiro */}
              <div className="space-y-4">
                {COMPARISON_SCENARIOS.map((item) => (
                  <div
                    key={item.id}
                    className="comparison-item p-4 rounded-xl bg-zinc-900/70 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                      <FaCheck className="size-3.5 shrink-0" />
                      <span>{item.topic}</span>
                    </div>
                    <p className="font-heading text-sm font-bold text-white">
                      {item.caloteiro.title}
                    </p>
                    <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                      {item.caloteiro.description}
                    </p>
                    <div className="pt-1 text-[11px] font-mono text-emerald-300 font-bold">
                      {item.caloteiro.advantage}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <span className="text-xs font-mono text-zinc-300">
                Resultado: cobrança firme, profissional e dinheiro no bolso.
              </span>
              <Button
                render={<Link href="/cadastrar" />}
                onClick={() =>
                  trackAccountIntent(
                    "comparativo_caderninho_desktop",
                    "Trocar Caderninho pela Gruta"
                  )
                }
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl h-10 px-5 text-xs font-mono cursor-pointer shrink-0"
              >
                <span>Trocar Caderninho pela Gruta</span>
                <FaArrowRight className="size-3 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. VERSÃO MOBILE DEDICADA COM SELETOR DE POLEGAR (320px a 1023px)
           ========================================================================= */}
        <div className="block lg:hidden space-y-5">
          {/* Seletor de Modo com Toque Confortável */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMobileActiveView("notebook");
                trackSimulator("caderninho", "switch_view", "notebook");
              }}
              className={`flex items-center justify-center gap-2 h-11 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                mobileActiveView === "notebook"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <FaBookOpen className="size-3.5 shrink-0" />
              <span>O Caderninho</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileActiveView("caloteiro");
                trackSimulator("caderninho", "switch_view", "caloteiro");
              }}
              className={`flex items-center justify-center gap-2 h-11 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                mobileActiveView === "caloteiro"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <FaShieldHalved className="size-3.5 shrink-0" />
              <span>Com o Caloteiro</span>
            </button>
          </div>

          {/* Cards Verticais de Cada Cenário (Sem Aperto Horizontal) */}
          <div ref={mobileCardsRef} className="space-y-3">
            {COMPARISON_SCENARIOS.map((item) => {
              const isCaloteiro = mobileActiveView === "caloteiro";

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all space-y-2 ${
                    isCaloteiro
                      ? "bg-zinc-900/90 border-emerald-500/30 text-zinc-200"
                      : "bg-zinc-950/80 border-amber-900/30 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                      {item.topic}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        isCaloteiro
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {isCaloteiro ? (
                        <>
                          <FaCheck className="size-2.5" />
                          <span>Vantagem</span>
                        </>
                      ) : (
                        <>
                          <FaXmark className="size-2.5" />
                          <span>Prejuízo</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading text-sm font-bold text-white">
                      {isCaloteiro
                        ? item.caloteiro.title
                        : item.notebook.title}
                    </h4>
                    <p className="text-xs font-mono text-zinc-400 leading-relaxed mt-1">
                      {isCaloteiro
                        ? item.caloteiro.description
                        : item.notebook.description}
                    </p>
                  </div>

                  <div
                    className={`text-[11px] font-mono pt-1 ${
                      isCaloteiro
                        ? "text-emerald-300 font-bold"
                        : "text-rose-400 italic"
                    }`}
                  >
                    {isCaloteiro
                      ? item.caloteiro.advantage
                      : item.notebook.consequence}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Mobile Full-Width */}
          <div className="pt-2">
            <Button
              render={<Link href="/cadastrar" />}
              onClick={() =>
                trackAccountIntent(
                  "comparativo_caderninho_mobile",
                  "Abrir Gruta Grátis sem Cartão"
                )
              }
              className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl h-11 text-xs font-mono cursor-pointer justify-center shadow-md"
            >
              <span>Abrir Gruta Grátis sem Cartão</span>
              <FaArrowRight className="size-3.5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

