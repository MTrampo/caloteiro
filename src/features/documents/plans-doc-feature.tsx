"use client";

import * as React from "react";
import Link from "next/link";
import {
  FaCheck,
  FaXmark,
  FaCrown,
  FaArrowRight,
  FaLayerGroup,
  FaPercent,
  FaWhatsapp,
  FaShieldHalved,
  FaGaugeHigh,
} from "react-icons/fa6";
import { DocFaqCollapsible, type DocFaqItem } from "./components/doc-faq-collapsible";

interface PlanItem {
  name: string;
  subtitle: string;
  price: string;
  period: string;
  description: string;
  borderClass: string;
  badgeClass: string;
  maxDebtors: string;
  maxDebts: string;
  maxInstallments: string;
  interestModes: string;
  isPro?: boolean;
}

const PLANS_DATA: PlanItem[] = [
  {
    name: "Tubarão Lixa",
    subtitle: "Iniciante / Grátis",
    price: "R$ 0,00",
    period: "grátis para sempre",
    description:
      "Ideal para quem emprestou uma grana avulsa para parente, amigo ou cunhado e quer tirar essa cobrança do bloco de notas sem gastar nada.",
    borderClass: "border-border",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    maxDebtors: "Até 2 presas marcadas",
    maxDebts: "Até 2 dívidas ativas",
    maxInstallments: "Até 12x",
    interestModes: "2 modalidades (Sem Juros e % Total)",
  },
  {
    name: "Tubarão Branco",
    subtitle: "Mais Popular",
    price: "R$ 29,90",
    period: "por mês",
    description:
      "Para quem empresta com frequência, vende produtos fiado ou presta serviços parcelados e precisa de acompanhamento profissional.",
    borderClass: "border-zinc-700 bg-card/80",
    badgeClass: "bg-zinc-800 text-zinc-100 border-zinc-600",
    maxDebtors: "Até 10 presas marcadas",
    maxDebts: "Até 10 dívidas ativas",
    maxInstallments: "Até 36x",
    interestModes: "3 modalidades (+ Taxa Fixa em R$)",
  },
  {
    name: "Tubarão Cabeça Chata",
    subtitle: "Sem Limites / Predador Supremo",
    price: "R$ 49,90",
    period: "por mês",
    description:
      "O topo da cadeia alimentar. Presas e dívidas ilimitadas na gruta, com Termômetro da Gruta (/painel/termometro), Score da Mordida Exploratória e Raio-X comportamental.",
    borderClass: "border-emerald-500/50 ring-1 ring-emerald-500/30 bg-card",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    isPro: true,
    maxDebtors: "Presas Ilimitadas",
    maxDebts: "Dívidas Ilimitadas",
    maxInstallments: "Até 120x",
    interestModes: "Todas as modalidades (+ % a.m. exclusivo)",
  },
];

interface ComparisonCategory {
  categoryTitle: string;
  categoryIcon: React.ElementType;
  rows: {
    label: string;
    description: string;
    lixa: string | boolean;
    branco: string | boolean;
    chato: string | boolean;
  }[];
}

const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    categoryTitle: "1. Capacidade & Limites da Gruta",
    categoryIcon: FaLayerGroup,
    rows: [
      {
        label: "Capacidade da Gruta (Presas Marcadas)",
        description: "Quantidade de devedores monitorados simultaneamente",
        lixa: "Até 2 presas",
        branco: "Até 10 presas",
        chato: "Ilimitado",
      },
      {
        label: "Dívidas Ativas Simultâneas",
        description: "Contratos de dívidas em aberto rodando ao mesmo tempo",
        lixa: "Até 2 dívidas",
        branco: "Até 10 dívidas",
        chato: "Ilimitado",
      },
      {
        label: "Parcelamento Máximo",
        description: "Limite de parcelas permitidas por cronograma",
        lixa: "Até 12x",
        branco: "Até 36x",
        chato: "Até 120x",
      },
      {
        label: "Amortização Automática em Cascata",
        description: "Abate inteligente de valores parciais ou sobras no Pix",
        lixa: true,
        branco: true,
        chato: true,
      },
    ],
  },
  {
    categoryTitle: "2. Modalidades & Regras Financeiras",
    categoryIcon: FaPercent,
    rows: [
      {
        label: "Modalidade Camarada (Sem Juros)",
        description: "Divide o valor principal em parcelas exatas sem acréscimo",
        lixa: true,
        branco: true,
        chato: true,
      },
      {
        label: "Modalidade Percentual no Total (% Total)",
        description: "Aplica porcentagem de retorno sobre o montante emprestado",
        lixa: true,
        branco: true,
        chato: true,
      },
      {
        label: "Taxa Fixa do Tubarão em Reais (R$)",
        description: "Acréscimo de valor fechado em dinheiro sem contas de porcentagem",
        lixa: false,
        branco: true,
        chato: true,
      },
      {
        label: "Taxa Padrão Pré-configurada",
        description: "Salva modalidade e taxa padrão para aplicar em novas dívidas",
        lixa: false,
        branco: true,
        chato: true,
      },
    ],
  },
  {
    categoryTitle: "3. Cobrança & Armas de WhatsApp",
    categoryIcon: FaWhatsapp,
    rows: [
      {
        label: "3 Níveis de Mensagens no WhatsApp",
        description: "Disparos automáticos: Lembrete (Nível 1), Ácido (Nível 2) e Tio Patinhas (Nível 3)",
        lixa: "Modelos Prontos",
        branco: "100% Editáveis",
        chato: "100% Editáveis",
      },
      {
        label: "Interpolação de Chave Pix nos Disparos",
        description: "Sua chave Pix e valor já saem injetados no texto com 1 toque",
        lixa: true,
        branco: true,
        chato: true,
      },
      {
        label: "Registro de Histórico de Caôs",
        description: "Armazena cada desculpa e nova promessa feita na parcela",
        lixa: true,
        branco: true,
        chato: true,
      },
    ],
  },
  {
    categoryTitle: "4. Fatura da Presa & Auditoria",
    categoryIcon: FaShieldHalved,
    rows: [
      {
        label: "Link da Dívida para a Presa (Portal Externo)",
        description: "Acesso protegido por código para a presa ver a fatura e copiar o Pix",
        lixa: false,
        branco: true,
        chato: true,
      },
      {
        label: "Gatilho de Quebra de Acordo",
        description: "Alerta formal com limite de tolerância de parcelas vencidas",
        lixa: false,
        branco: true,
        chato: true,
      },
      {
        label: "Painel Financeiro Consolidado",
        description: "Visão consolidada de valores na rua, recuperados e balanço mensal",
        lixa: false,
        branco: true,
        chato: true,
      },
      {
        label: "Cofre de Comprovantes Pix (WebP)",
        description: "Anexo permanente de prints e recibos de pagamento nas parcelas",
        lixa: false,
        branco: true,
        chato: true,
      },
    ],
  },
  {
    categoryTitle: "5. Inteligência de Risco & Comportamento da Presa",
    categoryIcon: FaGaugeHigh,
    rows: [
      {
        label: "Termômetro da Gruta (/painel/termometro)",
        description: "Visão consolidada da carteira, velocímetro geral de risco e diagnóstico financeiro de calote",
        lixa: false,
        branco: false,
        chato: true,
      },
      {
        label: "Score de Risco da Mordida Exploratória (0 a 100 pts)",
        description: "Algoritmo comportamental de cara de pau calculando pontualidade, histórico e caôs",
        lixa: false,
        branco: false,
        chato: true,
      },
      {
        label: "Raio-X Comportamental da Presa (/painel/devedores/[id])",
        description: "Extrato de cicatrização e sangramento de pontos, mural de caôs e armas automáticas",
        lixa: false,
        branco: false,
        chato: true,
      },
      {
        label: "Veredito Ácido da Gruta",
        description: "Diagnósticos e alertas afiados sem rodeios para o Tubarão tomar postura e agir rápido",
        lixa: false,
        branco: false,
        chato: true,
      },
    ],
  },
];

const FAQS_DATA: DocFaqItem[] = [
  {
    question: "Como funciona a cobrança na troca de plano?",
    answer:
      "A cobrança de upgrade ou downgrade é processada com total transparência pelo Mercado Pago. Se você está no plano gratuito Tubarão Lixa e faz upgrade para o Tubarão Branco ou Cabeça Chata, a primeira mensalidade é faturada no ato da contratação no Mercado Pago, liberando a nova capacidade da gruta imediatamente. Caso já possua uma assinatura ativa e mude entre planos pagos, o novo valor será aplicado no ciclo faturado subsequente.",
  },
  {
    question: "Existe período de degustação gratuita de 30 dias nos planos pagos?",
    answer:
      "A regra de 30 dias de teste gratuito (trial) é válida exclusivamente para novos Usuários que realizam o cadastro diretamente em um plano pago. Se você começou pelo plano gratuito Tubarão Lixa, você já usufruiu da fase de teste e validação das ferramentas essenciais; portanto, ao migrar para um plano pago via upgrade, o faturamento da mensalidade é imediato.",
  },
  {
    question: "O que acontece com as presas e dívidas se eu fizer downgrade?",
    answer:
      "Nenhum dado é apagado, excluído ou perdido. Suas dívidas e presas marcadas continuam intactas no seu histórico. Porém, você não poderá marcar novos devedores nem abrir novas cobranças até que o total ativo esteja dentro da capacidade do plano atual.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer:
      "Sim! Sem fidelidade, letras miúdas ou multa rescisória. Você pode cancelar a qualquer momento diretamente pelo painel do Caloteiro ou pelo gerenciador de assinaturas do Mercado Pago. O acesso aos recursos pagos permanece liberado até o final do período mensal já faturado.",
  },
  {
    question: "O devedor precisa criar conta ou pagar para ver a fatura dele?",
    answer:
      "Não. O portal do devedor é público, leve e sem necessidade de cadastro. Ele apenas digita o PIN de segurança fornecido por você para visualizar o extrato, copiar sua chave Pix e acompanhar o saldo devedor atualizado.",
  },
];

export function PlansDocFeature() {
  return (
    <div className="space-y-10 sm:space-y-12">
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
          className="inline-flex items-center justify-center h-10 px-5 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-xs gap-2 transition-all shrink-0 cursor-pointer"
        >
          <span>Ir para Assinatura</span>
          <FaArrowRight className="size-3" />
        </Link>
      </div>

      {/* 2. Seção das Três Espécies (Cards Individuais) */}
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
                      <span>Sem Limites</span>
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
                  <span className="text-zinc-500">Capacidade da Gruta:</span>
                  <span className="font-bold text-white">{plan.maxDebtors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Dívidas Ativas:</span>
                  <span className="font-bold text-white">{plan.maxDebts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Parcelamento:</span>
                  <span className="font-bold text-white">{plan.maxInstallments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Juros e Taxas:</span>
                  <span className={`font-bold ${plan.isPro ? "text-emerald-400" : "text-white"}`}>
                    {plan.interestModes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Matriz Comparativa Detalhada Agrupada por Categorias */}
      <div className="space-y-6 pt-2">
        <div>
          <h3 className="font-heading text-base sm:text-lg font-bold text-white">
            Matriz Comparativa de Recursos
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Confira item a item o que cada espécie tem direito de usar no sistema.
          </p>
        </div>

        {/* Versão Desktop: Tabela Estruturada por Categorias */}
        <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
          {/* Cabeçalho das Colunas */}
          <div className="grid grid-cols-4 bg-zinc-900/90 border-b border-border p-4 text-xs font-mono text-zinc-400 font-bold">
            <div>Funcionalidade / Recurso</div>
            <div className="text-center">Tubarão Lixa (Grátis)</div>
            <div className="text-center">Tubarão Branco (R$ 29,90)</div>
            <div className="text-center text-emerald-400">Tubarão Cabeça Chata (R$ 49,90)</div>
          </div>

          <div className="divide-y divide-border/40 text-xs font-mono">
            {COMPARISON_CATEGORIES.map((cat, catIdx) => {
              const Icon = cat.categoryIcon;
              return (
                <div key={catIdx} className="space-y-0">
                  {/* Cabeçalho da Categoria */}
                  <div className="bg-zinc-950/70 px-4 py-2.5 border-t border-b border-zinc-800/80 flex items-center gap-2 text-zinc-300 font-heading font-bold text-xs uppercase tracking-wider">
                    <Icon className="size-3.5 text-emerald-400 shrink-0" />
                    <span>{cat.categoryTitle}</span>
                  </div>

                  {/* Linhas da Categoria */}
                  {cat.rows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-4 p-4 items-center hover:bg-zinc-900/30 transition-colors"
                    >
                      <div className="pr-4">
                        <span className="font-bold text-white block">{row.label}</span>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          {row.description}
                        </span>
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
                          <span className="text-zinc-300 font-medium">{row.lixa}</span>
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
                          <span className="text-zinc-200 font-bold">{row.branco}</span>
                        )}
                      </div>

                      {/* Tubarão Cabeça Chata */}
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
              );
            })}
          </div>
        </div>

        {/* Versão Mobile: Cards por Categoria (Sem cortes ou rolagem truncada) */}
        <div className="md:hidden space-y-6">
          {COMPARISON_CATEGORIES.map((cat, catIdx) => {
            const Icon = cat.categoryIcon;
            return (
              <div key={catIdx} className="space-y-3">
                <div className="flex items-center gap-2 px-1 text-zinc-300 font-heading font-bold text-xs uppercase tracking-wider">
                  <Icon className="size-3.5 text-emerald-400 shrink-0" />
                  <span>{cat.categoryTitle}</span>
                </div>

                <div className="space-y-3">
                  {cat.rows.map((row) => (
                    <div
                      key={`mob-${row.label}`}
                      className="rounded-2xl border border-border bg-card p-4 space-y-2 text-xs font-mono"
                    >
                      <div>
                        <span className="font-bold text-white block">{row.label}</span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          {row.description}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-[11px]">
                        {/* Lixa */}
                        <div className="text-center p-2 rounded-xl bg-background/50 border border-border/40">
                          <span className="text-[10px] text-zinc-500 block">Lixa:</span>
                          <span className="font-semibold text-zinc-300 block truncate">
                            {typeof row.lixa === "boolean"
                              ? row.lixa
                                ? "Sim"
                                : "Não"
                              : row.lixa}
                          </span>
                        </div>

                        {/* Branco */}
                        <div className="text-center p-2 rounded-xl bg-background/50 border border-border/40">
                          <span className="text-[10px] text-zinc-500 block">Branco:</span>
                          <span className="font-semibold text-zinc-200 block truncate">
                            {typeof row.branco === "boolean"
                              ? row.branco
                                ? "Sim"
                                : "Não"
                              : row.branco}
                          </span>
                        </div>

                        {/* Cabeça Chata */}
                        <div className="text-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-[10px] text-emerald-400 font-bold block">
                            C. Chata:
                          </span>
                          <span className="font-bold text-white block truncate">
                            {typeof row.chato === "boolean"
                              ? row.chato
                                ? "Sim"
                                : "Não"
                              : row.chato}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Perguntas Frequentes (FAQ) com Acordeão Collapsible da Home */}
      <div className="space-y-4 pt-2">
        <div className="space-y-1">
          <h3 className="font-heading text-base sm:text-lg font-bold text-white">
            Dúvidas Frequentes sobre os Planos
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Respostas diretas sobre cobrança via Mercado Pago, trocas de categoria e segurança de dados.
          </p>
        </div>

        <DocFaqCollapsible items={FAQS_DATA} defaultOpenIndex={0} />
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
            className="inline-flex items-center justify-center h-11 px-6 text-xs font-heading font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl shadow-md gap-2 transition-all cursor-pointer"
          >
            <span>Ver Planos e Assinar</span>
            <FaArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
