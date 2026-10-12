"use client";

import * as React from "react";
import type { Plan } from "@/commons/models/subscription";
import { PlanChangeModal } from "./plan-change-modal";
import { FaCheck, FaArrowUp, FaArrowDown } from "react-icons/fa6";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const planPrice = Number(plan.price);
          const isCurrent = currentPlanSlug === plan.slug;
          const isUpgrade = planPrice > currentPrice;
          const maxDebtors = plan.config_plan?.max_debtors;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all ${
                isCurrent
                  ? "bg-zinc-900/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20"
                  : "bg-card border-border hover:border-zinc-700"
              }`}
            >
              <div className="space-y-3">
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-heading text-base font-bold text-white">
                      {plan.name}
                    </h4>
                    <p className="text-xs font-mono text-zinc-400">
                      {plan.description || "Arsenal de cobrança"}
                    </p>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      Plano Atual
                    </span>
                  )}
                </div>

                {/* Preço */}
                <div className="pt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-2xl font-bold text-white">
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

                {/* Resumo de Benefícios */}
                <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs font-mono text-zinc-300">
                  <div className="flex items-center gap-2">
                    <FaCheck className="size-3 text-emerald-400 shrink-0" />
                    <span>
                      {maxDebtors ? `${maxDebtors} devedores no radar` : "Devedores ilimitados"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="size-3 text-emerald-400 shrink-0" />
                    <span>
                      {plan.config_plan?.custom_templates ? "Templates afiados liberados" : "Templates padrão"}
                    </span>
                  </div>
                  {plan.config_plan?.can_debtor_portal && (
                    <div className="flex items-center gap-2">
                      <FaCheck className="size-3 text-emerald-400 shrink-0" />
                      <span>Portal do Devedor incluso</span>
                    </div>
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
      </div>

      {/* Modal de Confirmação com Impacto (Ganhos vs Perdas) */}
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

