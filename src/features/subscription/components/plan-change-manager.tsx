"use client";

import * as React from "react";
import type { Plan } from "@/commons/models/subscription";
import { PlanChangeModal } from "./plan-change-modal";
import { FaCheck, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { ResponsiveCardsCarousel } from "@/components/cards/responsive-cards-carousel";

interface PlanChangeManagerProps {
  plans: Plan[];
  currentPlanSlug?: string | null;
  currentBaseValue?: number;
}

export function PlanChangeManager({
  plans,
  currentPlanSlug,
  currentBaseValue = 0,
}: PlanChangeManagerProps) {
  const [selectedTargetPlan, setSelectedTargetPlan] = React.useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const currentPlan = plans.find((p) => p.slug === currentPlanSlug) || null;
  const currentPrice = currentPlan ? Number(currentPlan.price) : Number(currentBaseValue);

  const handleOpenPlanChange = (plan: Plan) => {
    setSelectedTargetPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <ResponsiveCardsCarousel desktopColumns={3} tabletColumns={2}>
        {plans.map((plan) => {
          const planPrice = Number(plan.price);
          const isCurrent = currentPlanSlug === plan.slug;
          const isUpgrade = planPrice > currentPrice;
          const maxDebtors = plan.config_plan?.max_debtors;
          const canRiskScore = Boolean(plan.config_plan?.can_risk_score);
          const canAccessFinancial = Boolean(plan.config_plan?.can_access_financial);
          const canDebtorPortal = Boolean(plan.config_plan?.can_debtor_portal);
          const canAttachReceipts = Boolean(plan.config_plan?.can_attach_receipts);

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all h-full ${
                isCurrent
                  ? "bg-zinc-900/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20"
                  : "bg-card border-border hover:border-zinc-700"
              }`}
            >
              <div className="space-y-3">
                {/* Header do Card */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-2">
                  <div className="space-y-0.5">
                    <h4 className="font-heading text-base font-bold text-white">
                      {plan.name}
                    </h4>
                    <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                      {plan.description || "Recursos de cobrança"}
                    </p>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 self-start sm:self-auto whitespace-nowrap">
                      Plano Atual
                    </span>
                  )}
                </div>

                {/* Preço */}
                <div className="pt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-2xl font-bold text-white whitespace-nowrap">
                      {planPrice === 0
                        ? "Grátis"
                        : planPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                    </span>
                    {planPrice > 0 && (
                      <span className="text-xs font-mono text-zinc-400">/mês</span>
                    )}
                  </div>
                </div>

                {/* Resumo Completo de Benefícios da Espécie */}
                <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs font-mono text-zinc-300">
                  <div className="flex items-start gap-2">
                    <FaCheck className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      {maxDebtors
                        ? `${maxDebtors} presas na gruta (até ${planPrice === 0 ? "12x" : "36x"})`
                        : "Presas ilimitadas na gruta (até 120x)"}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <FaCheck className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      {canRiskScore
                        ? "Juros ao mês (% a.m.) e Taxa Fixa liberados"
                        : planPrice > 0
                        ? "Taxa Fixa do Tubarão liberada"
                        : "Apenas valor original (Sem juros)"}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <FaCheck className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      {plan.config_plan?.custom_templates
                        ? "Templates afiados de WhatsApp liberados"
                        : "Templates padrão de WhatsApp"}
                    </span>
                  </div>

                  {canAccessFinancial && (
                    <div className="flex items-start gap-2">
                      <FaCheck className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Painel Financeiro consolidado</span>
                    </div>
                  )}

                  {canDebtorPortal && (
                    <div className="flex items-start gap-2">
                      <FaCheck className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Link da Dívida para a Presa incluso</span>
                    </div>
                  )}

                  {canAttachReceipts && (
                    <div className="flex items-start gap-2">
                      <FaCheck className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Arquivo de Provas (Comprovantes)</span>
                    </div>
                  )}

                  {planPrice > 0 && (
                    <div className="flex items-start gap-2">
                      <FaCheck className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Cláusulas e alerta de quebra de acordo</span>
                    </div>
                  )}

                  {canRiskScore && (
                    <>
                      <div className="flex items-start gap-2">
                        <FaCheck className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-white font-bold">
                          Termômetro da Gruta (/painel/termometro)
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaCheck className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-white font-bold">
                          Score de Risco &amp; Raio-X Comportamental da Presa
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Ação do Card */}
              <div className="pt-2">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full h-9 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs font-mono font-medium text-zinc-500 cursor-default"
                  >
                    Plano Ativo
                  </button>
                ) : isUpgrade ? (
                  <button
                    type="button"
                    onClick={() => handleOpenPlanChange(plan)}
                    className="w-full h-9 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-heading font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FaArrowUp className="size-3" />
                    <span>Fazer Upgrade</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenPlanChange(plan)}
                    className="w-full h-9 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FaArrowDown className="size-3 text-zinc-400" />
                    <span>Mudar de Plano</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </ResponsiveCardsCarousel>

      {/* Modal de Confirmação com Impacto (Ganhos vs Perdas) e Trava Anti-Clique Acidental */}
      <PlanChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetPlan={selectedTargetPlan}
        currentPlan={currentPlan}
        currentPrice={currentPrice}
      />
    </div>
  );
}
