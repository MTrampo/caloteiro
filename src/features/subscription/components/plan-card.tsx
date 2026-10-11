import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanCardProps } from "../types";
import { getPlanBadgeClass } from "../utils/shark-meta";
import { SharkBehaviorBox } from "./shark-behavior-box";
import { PlanFeaturesList } from "./plan-features-list";

export function PlanCard({
  plan,
  isCurrentPlan,
  isSelected,
  isPending,
  onSelectPlan,
}: PlanCardProps) {
  const isFree = Number(plan.price) === 0 || plan.slug === "tubarao-lixa";

  return (
    <div className="rounded-2xl border border-border hover:border-zinc-700 bg-zinc-900/60 p-6 flex flex-col justify-between transition-all duration-200 relative">
      {plan.badge && (
        <div className="absolute -top-3 right-6">
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getPlanBadgeClass(
              plan.slug
            )}`}
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
          <p className="text-xs text-zinc-400 font-mono min-h-[48px] sm:min-h-12 leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Comportamento / Modus Operandi da Espécie do Tubarão */}
        {plan.shark && (
          <SharkBehaviorBox slug={plan.slug} sharkText={plan.shark} />
        )}

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
        <PlanFeaturesList config={plan.config_plan} />
      </div>

      {/* Botão de Ação */}
      <div className="pt-6">
        <Button
          onClick={() => onSelectPlan(plan.id)}
          disabled={isPending || isCurrentPlan}
          className={`w-full h-11 font-heading font-bold rounded-xl transition-all cursor-pointer ${
            plan.is_featured
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          }`}
        >
          {isSelected && isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span>
                {isFree
                  ? "Liberando Acesso à Gruta..."
                  : "Conectando Mercado Pago..."}
              </span>
            </div>
          ) : isCurrentPlan ? (
            "Espécie Atual Ativa"
          ) : (
            plan.button ||
            (isFree ? "Continuar Manso" : "Ativar com 30 Dias Grátis")
          )}
        </Button>
      </div>
    </div>
  );
}

