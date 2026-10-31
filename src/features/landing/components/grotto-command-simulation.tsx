"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FinancialKpiGrid } from "@/features/debts/components/financial-kpi-grid";
import { InstallmentCard } from "@/features/debts/details/installment-card";
import { ResponsiveCardsCarousel } from "@/components/cards/responsive-cards-carousel";
import type { InstallmentFormatted } from "@/commons/models/debt";
import { formatCurrencyBRL } from "@/commons/utils/date-formatter";
import {
  FaBolt,
  FaCheck,
  FaRotateLeft,
  FaTriangleExclamation,
  FaWhatsapp,
} from "react-icons/fa6";
import { trackSimulator } from "@/commons/utils/analytics";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LATE_INSTALLMENT_MOCK: InstallmentFormatted = {
  id: "demo-inst-2",
  debt_id: "demo-debt-1",
  debtor_id: "demo-debtor-1",
  user_id: "demo-user-1",
  installment_number: 2,
  nominal_amount: 600,
  paid_amount: 0,
  due_date: "2026-10-20",
  status: "late",
  receipt_path: null,
  created_at: "2026-09-20T10:00:00Z",
  updated_at: "2026-10-24T10:00:00Z",
  formattedNominalAmount: "R$ 600,00",
  formattedPaidAmount: "R$ 0,00",
  formattedRemainingAmount: "R$ 600,00",
  formattedDueDate: "20/10/2026",
  isLate: true,
  lateDays: 5,
  lateDaysText: "5 dias de atraso",
  statusLabel: "Em Atraso",
  statusBadgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  receiptUrl: null,
  excuses: [
    {
      id: "demo-excuse-1",
      installment_id: "demo-inst-2",
      debtor_id: "demo-debtor-1",
      user_id: "demo-user-1",
      excuse_text:
        "Fala cunhado, o app do banco travou meu limite hoje! Sexta-feira te faço o Pix sem falta.",
      promised_date: "2026-10-26",
      was_honored: false,
      created_at: "2026-10-22T14:30:00Z",
      formattedCreatedAt: "22/10/2026",
      formattedPromisedDate: "26/10/2026",
    },
  ],
};

const PAID_INSTALLMENT_MOCK: InstallmentFormatted = {
  ...LATE_INSTALLMENT_MOCK,
  paid_amount: 600,
  status: "paid",
  isLate: false,
  lateDays: 0,
  lateDaysText: "",
  formattedPaidAmount: "R$ 600,00",
  formattedRemainingAmount: "R$ 0,00",
  statusLabel: "Liquidada",
  statusBadgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  receiptUrl: "#comprovante-demo",
};

export function GrottoCommandSimulation() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const kpiWrapperRef = React.useRef<HTMLDivElement>(null);
  const panelsGridRef = React.useRef<HTMLDivElement>(null);
  const toastBannerRef = React.useRef<HTMLDivElement>(null);

  const [isSettledDemo, setIsSettledDemo] = React.useState(false);
  const [openAmount, setOpenAmount] = React.useState(2450);
  const [receivedAmount, setReceivedAmount] = React.useState(1200);
  const [overdueAmount, setOverdueAmount] = React.useState(600);
  const [defaultedAmount, setDefaultedAmount] = React.useState(350);
  const [actionToast, setActionToast] = React.useState<string | null>(null);

  const triggerPixSettlement = React.useCallback((settled: boolean) => {
    setIsSettledDemo(settled);
    setActionToast(null);
    trackSimulator("grotto_demo", settled ? "simulate_pix_settled" : "undo_pix_settled");

    const counters = {
      open: settled ? 2450 : 1850,
      received: settled ? 1200 : 1800,
      overdue: settled ? 600 : 0,
    };

    gsap.to(counters, {
      open: settled ? 1850 : 2450,
      received: settled ? 1800 : 1200,
      overdue: settled ? 0 : 600,
      duration: 1.35,
      ease: "power2.out",
      onUpdate: () => {
        setOpenAmount(Math.round(counters.open));
        setReceivedAmount(Math.round(counters.received));
        setOverdueAmount(Math.round(counters.overdue));
      },
    });

    if (sectionRef.current) {
      gsap.fromTo(
        ".grotto-live-target",
        { scale: 0.975, opacity: 0.65 },
        { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.6)" }
      );

      gsap.fromTo(
        '.grotto-kpi-wrapper .hidden.lg\\:grid [data-slot="card"]',
        { y: -6 },
        {
          y: 0,
          duration: 0.45,
          stagger: 0.07,
          ease: "back.out(2)",
        }
      );
    }

    if (settled && toastBannerRef.current) {
      gsap.fromTo(
        toastBannerRef.current,
        { y: -12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
      );
    }
  }, []);

  useGSAP(
    () => {
      // 1. Entrada quando a seção já está visível no meio da tela (top 52%)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 52%",
          toggleActions: "play none none reverse",
          onEnter: () => {
            const initialCounters = {
              open: 0,
              received: 0,
              overdue: 0,
              defaulted: 0,
            };
            setIsSettledDemo(false);

            gsap.to(initialCounters, {
              open: 2450,
              received: 1200,
              overdue: 600,
              defaulted: 350,
              duration: 1.3,
              ease: "power2.out",
              onUpdate: () => {
                setOpenAmount(Math.round(initialCounters.open));
                setReceivedAmount(Math.round(initialCounters.received));
                setOverdueAmount(Math.round(initialCounters.overdue));
                setDefaultedAmount(Math.round(initialCounters.defaulted));
              },
            });
          },
          onLeaveBack: () => {
            setIsSettledDemo(false);
          },
        },
      });

      tl.fromTo(
        kpiWrapperRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: "power3.out",
        }
      ).fromTo(
        ".grotto-sim-panel",
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.14,
          ease: "power3.out",
        },
        "-=0.3"
      );
    },
    { scope: sectionRef }
  );

  const handleManualExcuse = () => {
    trackSimulator("grotto_demo", "add_excuse_demo");
    setActionToast(
      "Caô registrado no histórico da parcela! O Tubarão guarda cada desculpa com data e hora."
    );
    setTimeout(() => setActionToast(null), 4000);
  };

  const debtorsQueue = [
    {
      id: "cunhado",
      name: 'Carlos "Cunhado" Silva',
      debtTitle: "Empréstimo Reforma da Moto",
      totalDebt: 2400,
      paidSoFar: isSettledDemo ? 1200 : 600,
      remaining: isSettledDemo ? 1200 : 1800,
      statusText: isSettledDemo
        ? "Parcela 2/4 paga no Pix!"
        : "Parcela 2/4 atrasada há 5 dias",
      badgeText: isSettledDemo ? "PIX NA CONTA" : "EM ATRASO (R$ 600)",
      badgeClass: isSettledDemo
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        : "bg-amber-500/10 text-amber-400 border-amber-500/30",
      progressPercent: isSettledDemo ? 50 : 25,
      barClass: isSettledDemo ? "bg-emerald-400" : "bg-amber-400",
    },
    {
      id: "marcos",
      name: 'Marcos "Parceiro do Futebol"',
      debtTitle: "Rateio do Churrasco + Ingresso",
      totalDebt: 350,
      paidSoFar: 0,
      remaining: 350,
      statusText: "Venceu há 34 dias • 3 caôs anotados",
      badgeText: "ALERTA VERMELHO",
      badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      progressPercent: 8,
      barClass: "bg-rose-500",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="central-gruta"
      className="w-full py-12 sm:py-24 border-b border-border/60 bg-zinc-900/30 scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl md:max-w-7xl space-y-6 sm:space-y-8">
        {/* Cabeçalho Solto da Seção (Estático e Visível Imediatamente) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Saiba exatamente quanto está na rua, quanto já voltou e quem está
              enrolando.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono leading-relaxed">
              Simulação Real — Central da Gruta: acompanhe os indicadores
              recalculando a baixa do Pix ao vivo ou clique para testar.
            </p>
          </div>

          {/* Botão Interativo de Cenário (100% Width no Mobile para toque rápido) */}
          <div className="flex items-center gap-3 w-full sm:w-auto self-start lg:self-auto">
            <div className="hidden sm:block text-xs font-mono text-zinc-400">
              <span>Painel interativo ao vivo:</span>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerPixSettlement(!isSettledDemo);
              }}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-mono font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                isSettledDemo
                  ? "bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-amber-500/30"
                  : "bg-white hover:bg-zinc-200 text-zinc-950 border-white shadow-sm"
              }`}
            >
              {isSettledDemo ? (
                <>
                  <FaRotateLeft className="size-3" />
                  <span>Voltar Parcela para Em Atraso</span>
                </>
              ) : (
                <>
                  <FaBolt className="size-3 text-emerald-600" />
                  <span>Simular Pix de R$ 600,00 Agora</span>
                </>
              )}
            </button>
          </div>
        </div>

      {/* 1. Os 4 Cards de KPI Financeiros Reais do Sistema (FinancialKpiGrid) */}
      <div ref={kpiWrapperRef} className="grotto-kpi-wrapper">
        <FinancialKpiGrid
          kpis={{
            emAberto: {
              title: "Em Aberto",
              natureLabel: "Total a Receber na Pista",
              amount: openAmount,
              description: isSettledDemo
                ? "Falta receber de 2 dívidas ativas na gruta"
                : "Dinheiro voando na mão de 2 presas marcadas",
              footnote: isSettledDemo
                ? "R$ 600,00 abatidos agora mesmo"
                : "2 acordos ativos na gruta",
              changePercent: isSettledDemo ? 50 : 67,
              isGainOrLoss: "neutral",
            },
            emDia: {
              title: "Recuperado",
              natureLabel: "Já no Cofre",
              amount: receivedAmount,
              description: isSettledDemo
                ? "Pix do Cunhado confirmado e somado ao cofre!"
                : "Milagres confirmados e já garantidos no bolso",
              footnote: isSettledDemo
                ? "+ R$ 600,00 acabaram de entrar"
                : "Parcelas liquidadas no mês",
              changePercent: isSettledDemo ? 50 : 33,
              isGainOrLoss: "positive",
            },
            emAtraso: {
              title: "Em Atraso",
              natureLabel: "Travado (Falta Pagar)",
              amount: overdueAmount,
              description: isSettledDemo
                ? "Nenhum atraso recente! Cunhado pagou a parcela."
                : 'Carlos "Cunhado" atrasado há 5 dias na Parcela #2',
              footnote: isSettledDemo
                ? "Atraso leve zerado com sucesso"
                : "Hora de mandar um 'bom dia, sumido'",
              changePercent: isSettledDemo ? 0 : 24,
              isGainOrLoss: isSettledDemo ? "positive" : "negative",
            },
            caloteiros: {
              title: "Caloteiros",
              natureLabel: "Alerta Vermelho",
              amount: defaultedAmount,
              description:
                'Marcos "Parceiro do Futebol" sumido há mais de 30 dias',
              footnote: "Acordo quebrado • Cobrança nível 3 pronta",
              changePercent: 14,
              isGainOrLoss: "negative",
            },
          }}
        />
      </div>

      {/* Feedback de Baixa ou Caô */}
      {isSettledDemo && (
        <div
          ref={toastBannerRef}
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-emerald-300"
        >
          <div className="flex items-center gap-2.5">
            <FaCheck className="size-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Milagre na praça!</strong> Caiu o Pix de R$ 600,00 do
              Carlos &ldquo;Cunhado&rdquo;. O saldo{" "}
              <strong>Em Atraso zerou</strong> e o{" "}
              <strong>Recuperado subiu para R$ 1.800,00</strong>.
            </span>
          </div>
          <span className="text-[11px] text-emerald-400/90 font-bold shrink-0">
            Recalculado em tempo real
          </span>
        </div>
      )}

      {actionToast && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-mono text-amber-300">
          {actionToast}
        </div>
      )}

      {/* 2. Painel Duplo Alinhado em Altura: Parcela Prioritária Interativa + Quem Tá Devendo Agora */}
      <div
        ref={panelsGridRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* Coluna Esquerda (7 cols): O InstallmentCard Real com Baixa e Histórico de Caôs */}
        <div className="grotto-sim-panel lg:col-span-7 rounded-2xl border border-border bg-card p-4 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-white">
                  Alvo Imediato: Carlos &ldquo;Cunhado&rdquo; Silva
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  Empréstimo Reforma da Moto • Acordo de R$ 2.400,00 em 4x
                </p>
              </div>

              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
                Componente Real de Parcela
              </span>
            </div>

            <div className="grotto-live-target">
              <InstallmentCard
                installment={
                  isSettledDemo ? PAID_INSTALLMENT_MOCK : LATE_INSTALLMENT_MOCK
                }
                totalInstallments={4}
                onPayInstallment={() => {
                  triggerPixSettlement(true);
                }}
                onAddExcuse={handleManualExcuse}
                onViewReceipt={() => {
                  trackSimulator("grotto_demo", "view_receipt_demo");
                  setActionToast(
                    "Comprovante Pix verificado e arquivado no cofre da parcela #2!"
                  );
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] font-mono text-zinc-500">
            <span>
              Clique em <strong className="text-zinc-300">Baixar Parcela</strong>{" "}
              ou <strong className="text-zinc-300">Anotar Caô</strong> no card
              acima para interagir.
            </span>
            {!isSettledDemo && (
              <span className="text-amber-400/90 flex items-center gap-1">
                <FaTriangleExclamation className="size-3" />1 desculpa anotada
                nesta parcela
              </span>
            )}
          </div>
        </div>

        {/* Coluna Direita (5 cols): Quem Tá Devendo na Gruta (Carrossel no Mobile/Tablet e Lista Vertical no Desktop) */}
        <div className="grotto-sim-panel lg:col-span-5 rounded-2xl border border-border bg-card p-4 sm:p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-white">
                Quem Tá Devendo na Gruta
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                Quanto cada presa já pagou e quanto falta arrancar
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg shrink-0">
              2 Presas
            </span>
          </div>

          {/* Mobile & Tablet (< lg): Carrossel Deslizável com Dots */}
          <div className="block lg:hidden">
            <ResponsiveCardsCarousel desktopColumns={3} tabletColumns={2}>
              {debtorsQueue.map((debtor) => (
                <div
                  key={debtor.id}
                  className="grotto-debtor-row h-full rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-4 flex flex-col justify-between gap-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-heading text-sm font-bold text-white leading-tight">
                        {debtor.name}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5 leading-tight">
                        {debtor.debtTitle}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md border self-start sm:self-auto shrink-0 ${debtor.badgeClass}`}
                    >
                      {debtor.badgeText}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                    <div className="rounded-lg bg-zinc-900/70 border border-zinc-800/70 px-3 py-2">
                      <span className="text-[10px] text-zinc-500 block">
                        Já Recuperado:
                      </span>
                      <span className="font-bold text-emerald-400 tabular-nums whitespace-nowrap">
                        {formatCurrencyBRL(debtor.paidSoFar)}
                      </span>
                    </div>

                    <div className="rounded-lg bg-zinc-900/70 border border-zinc-800/70 px-3 py-2">
                      <span className="text-[10px] text-zinc-500 block">
                        Falta Receber:
                      </span>
                      <span className="font-bold text-white tabular-nums whitespace-nowrap">
                        {formatCurrencyBRL(debtor.remaining)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${debtor.barClass}`}
                        style={{ width: `${debtor.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1 text-[11px] font-mono text-zinc-400">
                      <span className="leading-snug">{debtor.statusText}</span>
                      <a
                        href="#armas-whatsapp"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 font-bold transition-colors cursor-pointer text-center"
                      >
                        <FaWhatsapp className="size-3.5" />
                        <span>Cobrar no WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </ResponsiveCardsCarousel>
          </div>

          {/* Desktop (>= lg): Lista Vertical Empilhada */}
          <div className="hidden lg:flex space-y-3.5 flex-1 flex-col justify-center">
            {debtorsQueue.map((debtor) => (
              <div
                key={debtor.id}
                className="grotto-debtor-row rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-4 space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-bold text-white truncate">
                      {debtor.name}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-400 truncate">
                      {debtor.debtTitle}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${debtor.badgeClass}`}
                  >
                    {debtor.badgeText}
                  </span>
                </div>

                {/* Valores: Já Pagou vs Falta Pagar */}
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="rounded-lg bg-zinc-900/70 border border-zinc-800/70 px-3 py-2">
                    <span className="text-[10px] text-zinc-500 block">
                      Já Recuperado:
                    </span>
                    <span className="font-bold text-emerald-400 tabular-nums">
                      {formatCurrencyBRL(debtor.paidSoFar)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-zinc-900/70 border border-zinc-800/70 px-3 py-2">
                    <span className="text-[10px] text-zinc-500 block">
                      Falta Receber:
                    </span>
                    <span className="font-bold text-white tabular-nums">
                      {formatCurrencyBRL(debtor.remaining)}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso da Dívida */}
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${debtor.barClass}`}
                      style={{ width: `${debtor.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>{debtor.statusText}</span>
                    <a
                      href="#armas-whatsapp"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                    >
                      <FaWhatsapp className="size-3" />
                      <span>Cobrar</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
