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
} from "react-icons/fa6";
import { Loader2 } from "lucide-react";

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
            `Parabéns, Tubarão! Você subiu para o plano ${targetPlan.name}. Arsenal liberado!`
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
              ⚡ O que você GANHA a partir de agora:
            </span>
            <ul className="space-y-2 text-xs font-mono text-zinc-300">
              <li className="flex items-start gap-2">
                <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Capacidade no radar:{" "}
                  <strong className="text-white">
                    {targetMaxDebtors ? `Até ${targetMaxDebtors} devedores simultâneos` : "Devedores ILIMITADOS"}
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
                  <span>Portal do Devedor: link exclusivo para o caloteiro ver o estrago</span>
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
              ⚠️ O que você PERDE ao confirmar o downgrade:
            </span>
            <ul className="space-y-2 text-xs font-mono text-zinc-300">
              <li className="flex items-start gap-2">
                <FaTriangleExclamation className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Limite de radar reduzido para{" "}
                  <strong className="text-white">{targetMaxDebtors ?? 2} devedores simultâneos</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FaTriangleExclamation className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Perda de modelos avançados e régua automática de pressão.</span>
              </li>
            </ul>

            {/* Aviso de Devedores Existentes */}
            <div className="rounded-xl bg-amber-950/30 border border-amber-900/50 p-3 text-xs font-mono text-amber-300 leading-relaxed">
              <strong>Importante:</strong> Seus caloteiros cadastrados <strong>NÃO</strong> serão apagados. Porém, enquanto você tiver mais presas que o limite permitido ({targetMaxDebtors ?? 2}), não será possível cadastrar novos indivíduos.
            </div>
          </div>
        )}

        {/* Caixa Informativa: Cobrança na Próxima Fatura */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800 p-3 text-xs font-mono text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
            <FaInfo className="size-3 text-emerald-400 shrink-0" />
            <span>Regra de Faturamento: Próxima Fatura</span>
          </div>
          <p className="leading-relaxed">
            {isUpgrade
              ? `O valor de ${formattedTargetPrice}/mês será cobrado SOMENTE na sua próxima fatura do Mercado Pago. Os novos benefícios ficam liberados IMEDIATAMENTE.`
              : isFreePlan
              ? "A cobrança recorrente será cancelada no Mercado Pago e você não terá novas cobranças."
              : `A redução do valor para ${formattedTargetPrice}/mês será aplicada no próximo ciclo de faturamento no Mercado Pago.`}
          </p>
        </div>

        {/* Ações do Modal */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onClose}
            className="w-full sm:w-auto border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer font-mono text-xs"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={isPending}
            onClick={handleConfirmChange}
            className={`w-full sm:w-auto h-10 px-5 font-heading font-bold text-xs rounded-xl cursor-pointer transition-all ${
              isUpgrade
                ? "bg-white hover:bg-zinc-200 text-zinc-950"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
            }`}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Atualizando Plano...</span>
              </div>
            ) : isUpgrade ? (
              <span>Confirmar Upgrade ({formattedTargetPrice}/mês)</span>
            ) : (
              <span>Confirmar Downgrade</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

