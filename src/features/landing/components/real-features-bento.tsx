"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  FaBolt,
  FaTriangleExclamation,
  FaEye,
  FaCheck,
  FaCalculator,
} from "react-icons/fa6";
import { ResponsiveCardsCarousel } from "@/components/cards/responsive-cards-carousel";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type InterestModeKey = "none" | "percentage_total" | "fixed_fee";

interface InterestModeSimulation {
  key: InterestModeKey;
  label: string;
  planBadge: string;
  badgeClass: string;
  principalText: string;
  additionText: string;
  finalTotalText: string;
  installmentValueText: string;
  explanation: string;
}

const INTEREST_MODES_DEMO: Record<InterestModeKey, InterestModeSimulation> = {
  none: {
    key: "none",
    label: "1. Camarada (Sem Juros)",
    planBadge: "Liberado no Tubarão Lixa",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    principalText: "R$ 1.000,00",
    additionText: "+ R$ 0,00 (0%)",
    finalTotalText: "R$ 1.000,00",
    installmentValueText: "5x de R$ 200,00",
    explanation:
      "Divide apenas o valor principal sem acréscimos. Ideal para quando você só quer garantir que o valor original volte inteiro para a conta.",
  },
  percentage_total: {
    key: "percentage_total",
    label: "2. Percentual no Total (+20%)",
    planBadge: "Liberado no Tubarão Lixa",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    principalText: "R$ 1.000,00",
    additionText: "+ R$ 200,00 (20% sobre o total)",
    finalTotalText: "R$ 1.200,00",
    installmentValueText: "5x de R$ 240,00",
    explanation:
      "Aplica a porcentagem diretamente sobre o montante emprestado e dilui o total nas parcelas. Seu dinheiro volta com recompensa pelo risco.",
  },
  fixed_fee: {
    key: "fixed_fee",
    label: "3. Taxa Fixa em Reais (+R$ 150)",
    planBadge: "Exclusivo Tubarão Branco+",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    principalText: "R$ 1.000,00",
    additionText: "+ R$ 150,00 (Taxa Fixa R$)",
    finalTotalText: "R$ 1.150,00",
    installmentValueText: "5x de R$ 230,00",
    explanation:
      "Perfeito para quem combina um valor fechado de retorno (ex: 'te empresto 1.000 e você me devolve 1.150'). Sem conta de porcentagem.",
  },
};

export function RealFeaturesBento() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const calcResultRef = React.useRef<HTMLDivElement>(null);

  const [selectedInterestMode, setSelectedInterestMode] =
    React.useState<InterestModeKey>("percentage_total");

  const currentMode = INTEREST_MODES_DEMO[selectedInterestMode];

  // Animação suave ao trocar modalidade na calculadora de acordo
  React.useEffect(() => {
    if (!calcResultRef.current) return;
    gsap.fromTo(
      calcResultRef.current,
      { y: 10, opacity: 0.4, scale: 0.99 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }
    );
  }, [selectedInterestMode]);

  useGSAP(
    () => {
      // 1. Entrada escalonada dos cards no Desktop (sem afetar transforms internos do Embla no Mobile)
      gsap.fromTo(
        ".bento-animate-block",
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 2. Timeline da Amortização em Cascata
      const cascadeTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 48%",
          toggleActions: "play none none reverse",
        },
      });

      cascadeTl
        .fromTo(
          ".cascade-bar-1",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.95, ease: "power2.inOut" }
        )
        .fromTo(
          ".cascade-bar-2",
          { scaleX: 0 },
          { scaleX: 0.5, duration: 0.85, ease: "power2.out" },
          "-=0.15"
        );

      // 3. Timeline do Termômetro de Quebra de Acordo
      const breachTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 45%",
          toggleActions: "play none none reverse",
        },
      });

      breachTl
        .fromTo(
          ".breach-bar",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: "power3.out" }
        )
        .fromTo(
          ".breach-badge",
          { scale: 0.75, opacity: 0.5 },
          { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2.4)" },
          "-=0.2"
        );
    },
    { scope: sectionRef }
  );

  const bentoCards = [
    {
      id: "cascade",
      colSpanClass: "lg:col-span-7",
      content: (
        <div className="h-full rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs flex flex-col justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FaBolt className="size-3.5" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-white truncate">
                  Amortização Automática em Cascata
                </h3>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-zinc-950 text-zinc-400 border border-zinc-800 shrink-0">
                Zero Conta
              </span>
            </div>

            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Se a presa mandar um Pix quebrado (menor ou maior que a parcela),
              você digita o valor recebido uma única vez: o sistema quita a
              parcela atual e já desconta a sobra da próxima automaticamente.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-3.5 sm:p-4 space-y-3 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-1 text-zinc-400 pb-2 border-b border-zinc-800/80 text-[11px] sm:text-xs">
              <span>Pix de R$ 450,00 em parcelas de R$ 300,00</span>
              <span className="text-emerald-400 font-bold">
                Escorrimento Automático
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="rounded-lg bg-zinc-900/90 border border-emerald-500/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">Parcela 1 de 4</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Liquidada (100%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                  <div className="cascade-bar-1 h-full w-full bg-emerald-400 origin-left scale-x-0 rounded-full" />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Abateu R$ 300,00 • Saldo: R$ 0,00
                </p>
              </div>

              <div className="rounded-lg bg-zinc-900/90 border border-amber-500/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">Parcela 2 de 4</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Parcial (50%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                  <div className="cascade-bar-2 h-full w-full bg-amber-400 origin-left scale-x-0 rounded-full" />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Escorreu R$ 150,00 • Restam R$ 150,00
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "breach",
      colSpanClass: "lg:col-span-5",
      content: (
        <div className="h-full rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs flex flex-col justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <FaTriangleExclamation className="size-3.5" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-white">
                  Gatilho de Quebra de Acordo
                </h3>
              </div>
            </div>

            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Defina quantas parcelas atrasadas você tolera. Se o caloteiro
              cruzar esse limite, o acordo entra em quebra crítica com
              notificação formal pronta.
            </p>
          </div>

          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400">
                Limite de Tolerância Atingido
              </span>
              <span className="breach-badge text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                2 / 2 atrasadas
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
              <div className="breach-bar h-full w-full bg-rose-500 origin-left scale-x-0 rounded-full" />
            </div>

            <p className="text-[11px] text-rose-200/90 leading-relaxed">
              Acordo em quebra por excesso de atrasos. Dispare o aviso formal de
              regularização em 1 clique.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "excuses",
      colSpanClass: "lg:col-span-5",
      content: (
        <div className="h-full rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs flex flex-col justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <FaTriangleExclamation className="size-3.5" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-white truncate">
                  Histórico de Caôs por Parcela
                </h3>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 shrink-0">
                Memória Viva
              </span>
            </div>

            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Toda vez que o caloteiro inventar que &ldquo;o banco bloqueou o
              Pix&rdquo; ou prometer pagar na sexta, você anota na parcela com 1
              clique. A desculpa fica eternizada com a data prometida.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-950/80 border border-amber-500/25 p-4 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-400 font-bold">
                Caô #2 Registrado na Parcela
              </span>
              <span className="text-zinc-500">Prometeu: 26/10</span>
            </div>

            <p className="text-zinc-300 italic text-[11px] leading-relaxed bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5">
              &ldquo;O RH atrasou o adiantamento, mas sexta-feira até meio-dia
              cai na sua conta sem falta!&rdquo;
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "receipts",
      colSpanClass: "lg:col-span-7",
      content: (
        <div className="h-full rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs flex flex-col justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FaEye className="size-3.5" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-white truncate">
                  Cofre de Comprovantes Pix por Parcela
                </h3>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                Tubarão Branco+
              </span>
            </div>

            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Acabe com o papo de &ldquo;tenho certeza que já paguei essa
              parcela mês passado&rdquo;. Anexe o print do comprovante Pix no
              ato da baixa ou adicione depois diretamente no card da parcela
              liquidada.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 font-mono text-xs">
            <div className="rounded-xl bg-zinc-950/80 border border-emerald-500/20 p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-white font-bold block truncate">
                  Parcela 1 de 5 • R$ 300,00
                </span>
                <span className="text-[11px] text-emerald-400 block truncate">
                  Liquidada com recibo WebP
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-bold text-[11px] shrink-0">
                <FaEye className="size-3" />
                <span>Ver</span>
              </span>
            </div>

            <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-white font-bold block truncate">
                  Parcela 2 de 5 • R$ 300,00
                </span>
                <span className="text-[11px] text-zinc-400 block truncate">
                  Auditoria permanente no cofre
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 bg-zinc-900 font-bold text-[11px] shrink-0">
                <FaCheck className="size-2.5 text-emerald-400" />
                <span>Guardado</span>
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="arsenal"
      className="w-full py-12 sm:py-24 border-b border-border/60 bg-zinc-900/35"
    >
      <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl space-y-6 sm:space-y-10">
        {/* Cabeçalho da Seção (Regra 7) */}
        <div className="space-y-2 max-w-2xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Frio nos números. Ácido na cobrança.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono leading-relaxed">
            Veja como o motor financeiro calcula suas parcelas, abate pagamentos
            quebrados e fecha o cerco contra desculpas.
          </p>
        </div>

        {/* Simulador Interativo das 3 Modalidades de Taxa do Tubarão */}
        <div className="bento-animate-block rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 pb-4 border-b border-border/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FaCalculator className="size-3.5" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-white">
                  Simulador de Acordo: 3 Modalidades Reais de Retorno
                </h3>
              </div>
              <p className="text-xs font-mono text-zinc-400">
                Simule um empréstimo de{" "}
                <strong className="text-white">R$ 1.000,00 em 5x</strong> e
                escolha como o seu dinheiro vai voltar:
              </p>
            </div>

            {/* Botões das 3 Modalidades (Grade responsiva no mobile) */}
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2">
              {(
                ["none", "percentage_total", "fixed_fee"] as InterestModeKey[]
              ).map((key) => {
                const mode = INTEREST_MODES_DEMO[key];
                const isSelected = selectedInterestMode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedInterestMode(key)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer text-left sm:text-center ${
                      isSelected
                        ? "bg-white text-zinc-950 border-white shadow-xs"
                        : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resultado Instantâneo do Simulador (Grade compacta 2+1 no mobile) */}
          <div
            ref={calcResultRef}
            className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center"
          >
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 font-mono">
              <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-3 sm:p-3.5 space-y-1">
                <span className="text-[10px] sm:text-[11px] text-zinc-500 block">
                  Valor Emprestado
                </span>
                <span className="text-base sm:text-xl font-heading font-bold text-white block">
                  {currentMode.principalText}
                </span>
                <span className="text-[10px] sm:text-[11px] text-zinc-400 block">
                  Saiu do seu bolso
                </span>
              </div>

              <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-3 sm:p-3.5 space-y-1">
                <span className="text-[10px] sm:text-[11px] text-zinc-500 block">
                  Acréscimo
                </span>
                <span className="text-base sm:text-xl font-heading font-bold text-emerald-400 block truncate">
                  {currentMode.additionText}
                </span>
                <span
                  className={`inline-block text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded border truncate max-w-full ${currentMode.badgeClass}`}
                >
                  {currentMode.planBadge}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 sm:p-3.5 space-y-1">
                <span className="text-[10px] sm:text-[11px] text-emerald-300/80 block">
                  Total a Voltar para a Gruta
                </span>
                <span className="text-lg sm:text-xl font-heading font-bold text-white block">
                  {currentMode.finalTotalText}
                </span>
                <span className="text-[11px] font-bold text-emerald-400 block">
                  Cronograma: {currentMode.installmentValueText}
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-3.5 sm:p-4 text-xs font-mono text-zinc-300 leading-relaxed">
              {currentMode.explanation}
            </div>
          </div>
        </div>

        {/* Mobile & Tablet (< lg): 4 Cards em Carrossel Deslizável com Dots */}
        <div className="block lg:hidden bento-animate-block">
          <ResponsiveCardsCarousel desktopColumns={4} tabletColumns={2}>
            {bentoCards.map((card) => (
              <div key={card.id} className="h-full">
                {card.content}
              </div>
            ))}
          </ResponsiveCardsCarousel>
        </div>

        {/* Desktop (>= lg): Bento Grid Assimétrico de 12 Colunas */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-5">
          {bentoCards.map((card) => (
            <div
              key={card.id}
              className={`bento-animate-block ${card.colSpanClass}`}
            >
              {card.content}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
