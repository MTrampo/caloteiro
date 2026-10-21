"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { changeSubscriptionPlanAction } from "@/actions/subscription";
import type { Plan } from "@/commons/models/subscription";
import {
  FaArrowUp,
  FaArrowDown,
  FaCheck,
  FaTriangleExclamation,
  FaInfo,
  FaXmark,
  FaSpinner,
} from "react-icons/fa6";

interface PlanChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlan: Plan | null;
  currentPlan: Plan | null;
  currentPrice: number;
}

export function PlanChangeModal({
  isOpen,
  onClose,
  targetPlan,
  currentPlan,
  currentPrice,
}: PlanChangeModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  if (!isOpen || !targetPlan) return null;

  const targetPrice = Number(targetPlan.price ?? 0);
  const isUpgrade = targetPrice > currentPrice;
  const isFreePlan = targetPlan.slug === "tubarao-lixa" || targetPrice === 0;

  const targetMaxDebtors = targetPlan.config_plan?.max_debtors;
  const currentMaxDebtors = currentPlan?.config_plan?.max_debtors;

  const formattedTargetPrice = targetPrice.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const formattedCurrentPrice = currentPrice.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const handleConfirmChange = () => {
    startTransition(async () => {
      try {
        const response = await changeSubscriptionPlanAction(targetPlan.id);

        if (!response.success) {
          toast.error(response.error || "Não foi possível alterar seu plano.");
          return;
        }

        const data = response.data;
        if (data.initPoint) {
          toast.info("Redirecionando para o Mercado Pago para autorização do plano...");
          window.location.assign(data.initPoint);
          return;
        }

        if (isUpgrade) {
          toast.success(
            `Parabéns, Tubarão! Você subiu para o plano ${targetPlan.name}. A nova gruta fica liberada!`
          );
        } else {
          toast.success(`Plano alterado para ${targetPlan.name} com sucesso.`);
        }

        onClose();
        router.refresh();
      } catch {
        toast.error("Erro inesperado ao processar a mudança de plano.");
      }
    });
  };

  const isFromFreePlan = currentPrice === 0 || currentPlan?.slug === "tubarao-lixa";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              {isUpgrade ? (
                <>
                  <FaArrowUp className="size-4 text-emerald-400 shrink-0" />
                  <span>Evolução de Predador: {targetPlan.name}</span>
                </>
              ) : (
                <>
                  <FaArrowDown className="size-4 text-amber-400 shrink-0" />
                  <span>Vai afrouxar a mordida, Tubarão?</span>
                </>
              )}
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              De <strong className="text-zinc-200">{currentPlan?.name || "Tubarão Lixa"}</strong> ({formattedCurrentPrice}) para{" "}
              <strong className="text-white">{targetPlan.name}</strong> ({formattedTargetPrice}/mês)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
          >
            <FaXmark className="size-4" />
          </button>
        </div>

        {/* Corpo Comparativo: Ganhos ou Perdas */}
        {isUpgrade ? (
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              O que você GANHA a partir de agora:
            </span>
            <ul className="space-y-2 text-xs font-mono text-zinc-300">
              <li className="flex items-start gap-2">
                <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Capacidade da sua gruta:{" "}
                  <strong className="text-white">
                    {targetMaxDebtors ? `Até ${targetMaxDebtors} presas marcadas simultaneamente` : "Presas ILIMITADAS"}
                  </strong>{" "}
                  {currentMaxDebtors ? `(você tinha ${currentMaxDebtors})` : ""}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Cálculo automático de juros, mora e correção monetária</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Modelos ácidos e personalizados de cobrança no WhatsApp</span>
              </li>
              {targetPlan.config_plan?.can_debtor_portal && (
                <li className="flex items-start gap-2">
                  <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Link da Dívida para a Presa: página exclusiva para o caloteiro ver o estrago</span>
                </li>
              )}
              {!isFreePlan && (
                <li className="flex items-start gap-2">
                  <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Cláusulas do acordo, limite de tolerância e alerta automático de quebra</span>
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
              O que você PERDE ao confirmar o downgrade:
            </span>
            <ul className="space-y-2 text-xs font-mono text-zinc-300">
              <li className="flex items-start gap-2">
                <FaTriangleExclamation className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Capacidade da sua gruta reduzida para{" "}
                  <strong className="text-white">{targetMaxDebtors ?? 2} presas simultâneas</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FaTriangleExclamation className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Perda de modelos avançados e régua automática de pressão.</span>
              </li>
            </ul>

            {/* Aviso de Devedores Existentes */}
            <div className="rounded-xl bg-amber-950/30 border border-amber-900/50 p-3 text-xs font-mono text-amber-300 leading-relaxed">
              <strong>Importante:</strong> Seus caloteiros cadastrados <strong>NÃO</strong> serão apagados. Porém, enquanto você tiver mais presas que o limite permitido ({targetMaxDebtors ?? 2}), não será possível marcar novos caloteiros.
            </div>
          </div>
        )}

        {/* Caixa Informativa: Regra Real de Faturamento */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800 p-3 text-xs font-mono text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
            <FaInfo className="size-3 text-emerald-400 shrink-0" />
            <span>
              {isFromFreePlan
                ? "Regra de Faturamento: Cobrança Imediata"
                : isFreePlan
                ? "Regra de Faturamento: Cancelamento de Recorrência"
                : "Regra de Faturamento: Próxima Fatura"}
            </span>
          </div>
          <p className="leading-relaxed">
            {isFromFreePlan
              ? "Primeira cobrança realizada no ato da assinatura no Mercado Pago. A nova gruta fica liberada assim que o pagamento for aprovado."
              : isUpgrade
              ? `O valor de ${formattedTargetPrice}/mês será cobrado na sua próxima fatura do Mercado Pago. Os novos recursos ficam liberados imediatamente.`
              : isFreePlan
              ? "A cobrança recorrente será cancelada no Mercado Pago e você não terá novas cobranças."
              : `A redução do valor para ${formattedTargetPrice}/mês será aplicada no próximo ciclo de faturamento no Mercado Pago.`}
          </p>
        </div>

        {/* Ações do Modal */}
        <div className="flex items-center justify-end pt-3 border-t border-zinc-800">
          <Button
            type="button"
            size="lg"
            disabled={isPending}
            onClick={handleConfirmChange}
            className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <FaSpinner className="size-3.5 animate-spin" />
                <span>Atualizando Plano...</span>
              </div>
            ) : isUpgrade ? (
              isFromFreePlan ? (
                <span>Ir para Pagamento no Mercado Pago ({formattedTargetPrice}/mês)</span>
              ) : (
                <span>Confirmar Upgrade ({formattedTargetPrice}/mês)</span>
              )
            ) : (
              <span>Confirmar Downgrade</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

