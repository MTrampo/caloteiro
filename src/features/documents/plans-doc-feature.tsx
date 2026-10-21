"use client";

import * as React from "react";
import Link from "next/link";
import {
  FaCheck,
  FaXmark,
  FaCrown,
  FaArrowRight,
} from "react-icons/fa6";

const PLANS_DATA = [
  {
    name: "Tubarão Lixa",
    subtitle: "Iniciante / Grátis",
    price: "R$ 0,00",
    period: "grátis para sempre",
    description:
      "Ideal para quem emprestou uma grana avulsa para um parente, amigo ou cunhado e quer parar de anotar no guardanapo.",
    borderClass: "border-border",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    maxDebtors: "Até 2 alvos",
    maxDebts: "Até 2 dívidas ativas",
    maxInstallments: "Até 12x",
    interestModes: "2 opções (sem juros e % total)",
    hasMonthlyInterest: false,
    hasFixedFee: false,
    hasCustomTemplates: false,
    hasFinancialDashboard: false,
    hasDebtorPortal: false,
    hasRiskScore: false,
    hasReceiptsArchive: false,
  },
  {
    name: "Tubarão Branco",
    subtitle: "Intermediário",
    price: "R$ 29,90",
    period: "por mês",
    description:
      "Para quem empresta com frequência, vende fiado ou faz bicos e precisa de controle financeiro profissional.",
    borderClass: "border-border",
    badgeClass: "bg-zinc-800 text-zinc-200 border-zinc-700",
    maxDebtors: "Até 10 alvos",
    maxDebts: "Até 10 dívidas ativas",
    maxInstallments: "Até 36x",
    interestModes: "3 opções (+ taxa fixa em R$)",
    hasMonthlyInterest: false,
    hasFixedFee: true,
    hasCustomTemplates: true,
    hasFinancialDashboard: true,
    hasDebtorPortal: true,
    hasRiskScore: false,
    hasReceiptsArchive: false,
  },
  {
    name: "Tubarão Cabeça Chato",
    subtitle: "Pro / O Predador Supremo",
    price: "R$ 49,90",
    period: "por mês",
    description:
      "O ápice da cadeia alimentar. Sem limites de alvos, com juros dinâmicos ao mês, score de cara de pau e arquivo de provas.",
    borderClass: "border-emerald-500/50 ring-1 ring-emerald-500/30",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    isPro: true,
    maxDebtors: "Ilimitado",
    maxDebts: "Ilimitado",
    maxInstallments: "Até 120x",
    interestModes: "4 modalidades (+ % a.m. exclusivo)",
    hasMonthlyInterest: true,
    hasFixedFee: true,
    hasCustomTemplates: true,
    hasFinancialDashboard: true,
    hasDebtorPortal: true,
    hasRiskScore: true,
    hasReceiptsArchive: true,
  },
];

const COMPARISON_ROWS = [
  {
    label: "Capacidade da Gruta (Presas Marcadas)",
    description: "Quantidade de presas marcadas sob vigilância simultaneamente",
    lixa: "Até 2 presas",
    branco: "Até 10 presas",
    chato: "Ilimitado",
  },
  {
    label: "Dívidas Ativas Simultâneas",
    description: "Contratos de dívidas em aberto monitorados ao mesmo tempo",
    lixa: "Até 2 dívidas",
    branco: "Até 10 dívidas",
    chato: "Ilimitado",
  },
  {
    label: "Parcelamento Máximo",
    description: "Limite de parcelas geradas no cronograma",
    lixa: "Até 12x",
    branco: "Até 36x",
    chato: "Até 120x",
  },
  {
    label: "Modalidades de Juros",
    description: "Opções de acréscimo e cálculo do valor final",
    lixa: "2 modalidades",
    branco: "3 modalidades",
    chato: "4 modalidades completas",
  },
  {
    label: "Juros ao Mês (% a.m.)",
    description: "Cálculo dinâmico mensal por parcela",
    lixa: false,
    branco: false,
    chato: true,
    isProExclusive: true,
  },
  {
    label: "Taxa Fixa do Tubarão (R$)",
    description: "Acréscimo de valor em dinheiro direto no total",
    lixa: false,
    branco: true,
    chato: true,
  },
  {
    label: "Juros Pré-configurados",
    description: "Puxa taxa padrão salva nas configurações para agilizar",
    lixa: false,
    branco: true,
    chato: true,
  },
  {
    label: "Templates de WhatsApp",
    description: "Mensagens de cobrança amigáveis, ácidas e críticas",
    lixa: "Templates Padrão",
    branco: "100% Editáveis",
    chato: "100% Editáveis",
  },
  {
    label: "Painel Financeiro Geral",
    description: "Visão consolidada de valores na pista, recuperados e prejuízo",
    lixa: false,
    branco: true,
    chato: true,
  },
  {
    label: "Link da Dívida para a Presa",
    description: "Link exclusivo para a presa acompanhar as próprias parcelas e pagar no Pix",
    lixa: false,
    branco: true,
    chato: true,
  },
  {
    label: "Cláusulas e Alerta de Quebra de Acordo",
    description: "Regras do acordo visíveis na fatura e gatilho automático por parcelas vencidas",
    lixa: false,
    branco: true,
    chato: true,
  },
  {
    label: "Nível de Cara de Pau (Score)",
    description: "Algoritmo de risco que mede o atraso e calotes do alvo",
    lixa: false,
    branco: false,
    chato: true,
    isProExclusive: true,
  },
  {
    label: "Arquivo de Provas (Recibos)",
    description: "Anexo e custódia de comprovantes de transferência",
    lixa: false,
    branco: false,
    chato: true,
    isProExclusive: true,
  },
];

const FAQS = [
  {
    question: "Como funciona a cobrança na troca de plano?",
    answer:
      "A cobrança de upgrade ou downgrade é processada com total transparência pelo Mercado Pago. Se você está no plano gratuito Tubarão Lixa e faz upgrade para o Tubarão Branco ou Cabeça Chato, a primeira mensalidade é cobrada no ato da assinatura no Mercado Pago, liberando a nova gruta imediatamente após a aprovação do pagamento. Caso você já possua uma assinatura paga ativa no Mercado Pago e mude de categoria, o novo valor será cobrado na fatura subsequente do seu ciclo de assinatura.",
  },
  {
    question: "Existe período de degustação gratuita de 30 dias nos planos pagos?",
    answer:
      "A regra de 30 dias de degustação gratuita é válida única e exclusivamente para novos cadastros que entram diretamente em um plano pago sem plano prévio. Se você já possui ou ativou a versão gratuita (Tubarão Lixa), você já experimentou a plataforma de graça; portanto, ao migrar para um plano pago, a cobrança da mensalidade é realizada no ato da assinatura no Mercado Pago.",
  },
  {
    question: "O que acontece com minhas dívidas se eu fizer downgrade?",
    answer:
      "Nenhum dado é apagado ou perdido. Suas dívidas e devedores já existentes continuam intactos no seu histórico. Porém, você não poderá cadastrar novas dívidas ou novos alvos até que o número total esteja dentro do teto do plano atual.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer:
      "Sim! Aqui não tem fidelidade, pegadinha ou multa rescisória. Você pode cancelar quando quiser diretamente pelo painel ou pela sua conta do Mercado Pago, mantendo o acesso até o fim do período mensal já pago.",
  },
  {
    question: "Por que o Score de Cara de Pau é exclusivo do plano Tubarão Cabeça Chato?",
    answer:
      "O algoritmo de Score de Cara de Pau e o Arquivo de Provas com anexo de recibos são ferramentas de alta intensidade projetadas para credores frequentes que precisam de auditoria rigorosa de cada calote e histórico comportamental do devedor.",
  },
];

export function PlansDocFeature() {
  return (
    <div className="space-y-10">
      {/* 1. Cabeçalho da Documentação (Solto, sem card, sem ícones no h2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Planos e Regras de Cobrança
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Entenda detalhadamente os limites, modalidades de juros e recursos de cada espécie de Tubarão.
          </p>
        </div>

        <Link
          href="/assinatura"
          className="inline-flex items-center justify-center h-10 px-5 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all shrink-0 cursor-pointer"
        >
          <span>Ir para Assinatura</span>
          <FaArrowRight className="size-3" />
        </Link>
      </div>

      {/* 2. Seção dos 3 Arquétipos de Tubarão (Cards Individuais) */}
      <div className="space-y-4">
        <div>
          <h3 className="font-heading text-base sm:text-lg font-bold text-white">
            As Três Espécies de Tubarão
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Cada predador foi desenhado para um momento diferente da sua caça ao dinheiro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {PLANS_DATA.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border bg-card p-5 sm:p-6 space-y-4 flex flex-col justify-between ${plan.borderClass}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${plan.badgeClass}`}>
                    {plan.subtitle}
                  </span>
                  {plan.isPro && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
                      <FaCrown className="size-3" />
                      <span>Recursos Completos</span>
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-heading text-lg font-bold text-white">
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-heading text-2xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">/{plan.period}</span>
                  </div>
                </div>

                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 text-xs font-mono space-y-2 text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Devedores e Dívidas:</span>
                  <span className="font-bold text-white">{plan.maxDebtors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Parcelamento:</span>
                  <span className="font-bold text-white">{plan.maxInstallments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Juros:</span>
                  <span className={`font-bold ${plan.isPro ? "text-emerald-400" : "text-white"}`}>
                    {plan.interestModes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Matriz Comparativa Detalhada de Recursos */}
      <div className="space-y-4 pt-4">
        <div>
          <h3 className="font-heading text-base sm:text-lg font-bold text-white">
            Matriz Comparativa de Recursos
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Confira item a item o que cada espécie tem direito de usar no sistema.
          </p>
        </div>

        {/* Versão Desktop: Grid Estruturado */}
        <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
          {/* Cabeçalho das Colunas */}
          <div className="grid grid-cols-4 bg-zinc-900/80 border-b border-border p-4 text-xs font-mono text-zinc-400 font-bold">
            <div>Funcionalidade / Recurso</div>
            <div className="text-center">Tubarão Lixa (Grátis)</div>
            <div className="text-center">Tubarão Branco (R$ 29,90)</div>
            <div className="text-center text-emerald-400">Tubarão Cabeça Chato (R$ 49,90)</div>
          </div>

          {/* Linhas Comparativas */}
          <div className="divide-y divide-border/40 text-xs font-mono">
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-4 p-4 items-center hover:bg-zinc-900/30 transition-colors"
              >
                <div>
                  <span className="font-bold text-white block">{row.label}</span>
                  <span className="text-[11px] text-zinc-400 block">{row.description}</span>
                </div>

                {/* Tubarão Lixa */}
                <div className="text-center flex items-center justify-center">
                  {typeof row.lixa === "boolean" ? (
                    row.lixa ? (
                      <FaCheck className="size-3.5 text-emerald-400" />
                    ) : (
                      <FaXmark className="size-3.5 text-zinc-600" />
                    )
                  ) : (
                    <span className="text-zinc-300">{row.lixa}</span>
                  )}
                </div>

                {/* Tubarão Branco */}
                <div className="text-center flex items-center justify-center">
                  {typeof row.branco === "boolean" ? (
                    row.branco ? (
                      <FaCheck className="size-3.5 text-emerald-400" />
                    ) : (
                      <FaXmark className="size-3.5 text-zinc-600" />
                    )
                  ) : (
                    <span className="text-zinc-200 font-medium">{row.branco}</span>
                  )}
                </div>

                {/* Tubarão Cabeça Chato (Pro) */}
                <div className="text-center flex items-center justify-center">
                  {typeof row.chato === "boolean" ? (
                    row.chato ? (
                      <FaCheck className="size-4 text-emerald-400 stroke-2" />
                    ) : (
                      <FaXmark className="size-3.5 text-zinc-600" />
                    )
                  ) : (
                    <span className="text-emerald-400 font-bold">{row.chato}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Versão Mobile: Cards Individuais de Cada Recurso (Zero Quebra Horizontal) */}
        <div className="md:hidden space-y-3">
          {COMPARISON_ROWS.map((row) => (
            <div
              key={`mob-${row.label}`}
              className="rounded-2xl border border-border bg-card p-4 space-y-2 text-xs font-mono"
            >
              <div>
                <span className="font-bold text-white block">{row.label}</span>
                <span className="text-[10px] text-zinc-400 block">{row.description}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-[11px]">
                {/* Lixa */}
                <div className="text-center p-2 rounded-xl bg-background/50 border border-border/40">
                  <span className="text-[10px] text-zinc-500 block">Lixa:</span>
                  <span className="font-semibold text-zinc-300">
                    {typeof row.lixa === "boolean" ? (row.lixa ? "✓ Liberado" : "✗ Bloqueado") : row.lixa}
                  </span>
                </div>

                {/* Branco */}
                <div className="text-center p-2 rounded-xl bg-background/50 border border-border/40">
                  <span className="text-[10px] text-zinc-500 block">Branco:</span>
                  <span className="font-semibold text-zinc-200">
                    {typeof row.branco === "boolean" ? (row.branco ? "✓ Liberado" : "✗ Bloqueado") : row.branco}
                  </span>
                </div>

                {/* Cabeça Chato */}
                <div className="text-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 font-bold block">Cabeça Chato:</span>
                  <span className="font-bold text-white">
                    {typeof row.chato === "boolean" ? (row.chato ? "✓ Liberado" : "✗ Bloqueado") : row.chato}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Perguntas Frequentes (FAQ) */}
      <div className="space-y-4 pt-4">
        <div>
          <h3 className="font-heading text-base sm:text-lg font-bold text-white">
            Perguntas Frequentes sobre Assinatura
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Tire suas dúvidas sobre faturas, cancelamentos e segurança de dados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card p-5 space-y-2 text-xs font-mono"
            >
              <h5 className="font-heading text-sm font-bold text-white">
                {faq.question}
              </h5>
              <p className="text-zinc-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CTA Final */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8 text-center space-y-3">
        <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
          Pronto para assumir o controle do seu dinheiro?
        </h3>
        <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-xl mx-auto">
          Escolha o predador ideal para a sua rotina e nunca mais tenha vergonha de cobrar o que é legitimamente seu.
        </p>
        <div className="pt-2">
          <Link
            href="/assinatura"
            className="inline-flex items-center justify-center h-11 px-6 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-md gap-2 transition-all cursor-pointer"
          >
            <span>Ver Planos e Assinar</span>
            <FaArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

