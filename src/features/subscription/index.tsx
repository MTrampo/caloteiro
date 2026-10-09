"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";
import { createCheckoutSubscriptionAction } from "@/actions/subscription";
import type { Plan } from "@/commons/models/subscription";
import { FaCheck, FaShieldHalved, FaBolt } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface SubscriptionFlowProps {
  plans: Plan[];
  currentSubscriptionPlanSlug?: string | null;
}

export function SubscriptionFlow({
  plans,
  currentSubscriptionPlanSlug,
}: SubscriptionFlowProps) {
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Fallback visual de planos caso a tabela de plans do banco ainda não tenha registros
  const displayPlans = plans.length > 0 ? plans : [
    {
      id: "plano-iniciante",
      name: "Tiro de Festim",
      slug: "tiro-de-festim",
      description: "Para quem emprestou dinheiro pro primo e só quer um susto de leve.",
      price: 19.90,
      billing_period: "monthly",
      badge: "Iniciante",
      is_featured: false,
      is_active: true,
      sort_order: 1,
      config_plan: {
        id: "c1",
        name: "Iniciante",
        max_debtors: 3,
        custom_templates: false,
        export_reports: false,
        is_default: false,
      },
    },
    {
      id: "plano-profissional",
      name: "Modo Seu Barriga",
      slug: "modo-seu-barriga",
      description: "Pague o aluguel! Cobrança cirúrgica, templates venenosos e controle absoluto dos calotes.",
      price: 39.90,
      billing_period: "monthly",
      badge: "Mais Popular",
      is_featured: true,
      is_active: true,
      sort_order: 2,
      config_plan: {
        id: "c2",
        name: "Profissional",
        max_debtors: 25,
        custom_templates: true,
        export_reports: true,
        is_default: false,
      },
    },
    {
      id: "plano-agiota",
      name: "Cofre Blindado",
      slug: "cofre-blindado",
      description: "Para investigadores de alta patente. Devedores ilimitados e pressão máxima.",
      price: 69.90,
      billing_period: "monthly",
      badge: "Sem Limites",
      is_featured: false,
      is_active: true,
      sort_order: 3,
      config_plan: {
        id: "c3",
        name: "Ilimitado",
        max_debtors: null,
        custom_templates: true,
        export_reports: true,
        is_default: false,
      },
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    try {
      setSelectedPlanId(planId);
      setIsLoading(true);

      const response = await createCheckoutSubscriptionAction(planId);

      if (response.success && response.data?.initPoint) {
        toast.info("Redirecionando para o ambiente seguro do Mercado Pago...");
        window.location.href = response.data.initPoint;
        return;
      }

      if (!response.success) {
        toast.error(response.error);
      }
    } catch {
      toast.error("Erro ao gerar sessão de pagamento.");
    } finally {
      setIsLoading(false);
      setSelectedPlanId(null);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full max-w-6xl mx-auto">
      {/* Topo / Saudação do Arsenal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Arsenal de Cobrança
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Escolha o nível de pressão necessário para resgatar seu dinheiro na praça.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/painel"
            className="text-xs font-mono text-zinc-400 hover:text-white underline underline-offset-4"
          >
            Voltar ao Painel
          </Link>
        </div>
      </div>

      {/* Faixa Promocional / Degustação */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <FaBolt className="size-5" />
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold text-white">
              7 Dias de Degustação Gratuita em Qualquer Arsenal
            </h4>
            <p className="text-xs text-zinc-400 font-mono">
              Teste sem compromisso. Cancele a qualquer momento antes do vencimento com um único clique.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 self-start sm:self-auto shrink-0">
          <FaShieldHalved className="size-3.5" />
          <span>Garantia Anti-Calote</span>
        </div>
      </div>

      {/* Grid de Planos Comerciais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {displayPlans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const isCurrentPlan = currentSubscriptionPlanSlug === plan.slug;
          const config = plan.config_plan;
          const maxDebtorsLabel =
            config?.max_debtors === null || config?.max_debtors === undefined
              ? "Devedores Ilimitados"
              : `Até ${config.max_debtors} devedores simultâneos`;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border bg-card p-6 flex flex-col justify-between transition-all duration-200 relative ${
                plan.is_featured
                  ? "border-emerald-500/60 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/30 bg-zinc-900/90"
                  : "border-border hover:border-zinc-700 bg-zinc-900/60"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-6">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      plan.is_featured
                        ? "bg-emerald-500 text-zinc-950 border-emerald-400"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-heading text-lg font-bold text-white">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono min-h-10 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Preço formatado */}
                <div className="pt-2 pb-3 border-b border-zinc-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-mono text-zinc-400">R$</span>
                    <span className="font-heading text-3xl font-bold tracking-tight text-white">
                      {Number(plan.price).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      /mês
                    </span>
                  </div>
                </div>

                {/* Lista de Recursos / Limites */}
                <div className="space-y-2.5 pt-1 text-xs font-mono">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <FaCheck className="size-3 text-emerald-400 shrink-0" />
                    <span>{maxDebtorsLabel}</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-300">
                    <FaCheck className="size-3 text-emerald-400 shrink-0" />
                    <span>
                      {config?.custom_templates
                        ? "Templates de WhatsApp 100% editáveis"
                        : "Templates padrão de cobrança"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-300">
                    <FaCheck
                      className={`size-3 shrink-0 ${
                        config?.export_reports
                          ? "text-emerald-400"
                          : "text-zinc-600"
                      }`}
                    />
                    <span
                      className={
                        config?.export_reports
                          ? "text-zinc-300"
                          : "text-zinc-500 line-through"
                      }
                    >
                      Exportação de relatórios
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-300">
                    <FaCheck className="size-3 text-emerald-400 shrink-0" />
                    <span>Alerta de calote em tempo real</span>
                  </div>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="pt-6">
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading || isCurrentPlan}
                  className={`w-full h-11 font-heading font-bold rounded-xl transition-all cursor-pointer ${
                    plan.is_featured
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  }`}
                >
                  {isSelected && isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Conectando Mercado Pago...</span>
                    </div>
                  ) : isCurrentPlan ? (
                    "Arsenal Atual Ativo"
                  ) : (
                    "Ativar com 7 Dias Grátis"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nota de Segurança Mercado Pago */}
      <div className="text-center pt-4 text-xs font-mono text-zinc-500 space-y-1">
        <p>Pagamento processado com segurança via Mercado Pago.</p>
        <p>Sem fidelidade ou multa rescisória. Cancele quando o último caloteiro pagar.</p>
      </div>
    </div>
  );
}
