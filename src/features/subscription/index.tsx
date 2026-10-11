"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createCheckoutSubscriptionAction } from "@/actions/subscription";
import type { SubscriptionFlowProps } from "./types";
import { TrialBanner } from "./components/trial-banner";
import { PlanCard } from "./components/plan-card";

function redirectToCheckout(url: string) {
  window.location.assign(url);
}

export function SubscriptionFlow({
  plans,
  currentSubscriptionPlanSlug,
}: SubscriptionFlowProps) {
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    startTransition(async () => {
      try {
        const response = await createCheckoutSubscriptionAction(planId);

        if (response.success && response.data?.isFree) {
          toast.success("Plano gratuito ativado com sucesso! Bem-vindo à Gruta.");
          redirectToCheckout("/painel");
          return;
        }

        if (response.success && response.data?.initPoint) {
          toast.info("Redirecionando para o ambiente seguro do Mercado Pago...");
          redirectToCheckout(response.data.initPoint);
          return;
        }

        if (!response.success) {
          toast.error(response.error);
        }
      } catch {
        toast.error("Erro ao processar assinatura.");
      } finally {
        setSelectedPlanId(null);
      }
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full max-w-6xl mx-auto">
      {/* Topo / Saudação da Gruta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Gruta dos Tubarões
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Escolha o predador ideal para farejar e caçar o dinheiro que sumiu na praça.
          </p>
        </div>

        {currentSubscriptionPlanSlug && (
          <div className="flex items-center gap-2">
            <Link
              href="/painel"
              className="text-xs font-mono text-zinc-400 hover:text-white underline underline-offset-4"
            >
              Voltar ao Painel
            </Link>
          </div>
        )}
      </div>

      {/* Faixa Promocional / Degustação */}
      <TrialBanner />

      {/* Grid de Planos Comerciais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentSubscriptionPlanSlug === plan.slug}
            isSelected={selectedPlanId === plan.id}
            isPending={isPending}
            onSelectPlan={handleSelectPlan}
          />
        ))}
      </div>

      {/* Nota de Segurança Mercado Pago */}
      <div className="text-center pt-4 text-xs font-mono text-zinc-500 space-y-1">
        <p>Pagamento processado com segurança via Mercado Pago.</p>
        <p>Sem fidelidade ou multa rescisória. Cancele quando o último caloteiro pagar.</p>
      </div>
    </div>
  );
}
