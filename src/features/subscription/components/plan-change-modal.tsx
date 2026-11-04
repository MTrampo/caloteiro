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
  FaShieldHalved,
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
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [prevTargetId, setPrevTargetId] = React.useState<string | null>(null);

  // Reseta a caixa de confirmação quando o plano selecionado muda durante a renderização
  const currentTargetId = targetPlan?.id ?? null;
  if (currentTargetId !== prevTargetId) {
    setPrevTargetId(currentTargetId);
    setIsConfirmed(false);
  }

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

  const isFromFreePlan = currentPrice === 0 || currentPlan?.slug === "tubarao-lixa";
  const losingRiskScore =
    Boolean(currentPlan?.config_plan?.can_risk_score) &&
    !targetPlan.config_plan?.can_risk_score;

  const handleConfirmChange = () => {
    if (!isConfirmed) {
      toast.info("Marque a caixa de confirmação antes de prosseguir.");
      return;
    }

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

        if (data.message) {
          toast.success(data.message);
        } else if (isUpgrade) {
          toast.success(
            `Parabéns, Tubarão! Você subiu para o plano ${targetPlan.name}. A nova gruta já está liberada!`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-[calc(100vw-1.5rem)] sm:w-full max-w-lg p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[calc(100dvh-2.5rem)] overflow-y-auto overscroll-contain">
        {/* Cabeçalho do Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-white">
              {isUpgrade
                ? `Evolução de Predador: ${targetPlan.name}`
                : "Vai afrouxar a mordida, Tubarão?"}
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              De{" "}
              <strong className="text-zinc-200">
                {currentPlan?.name || "Tubarão Lixa"}
              </strong>{" "}
              ({formattedCurrentPrice}) para{" "}
              <strong className="text-white">{targetPlan.name}</strong> (
              {isFreePlan ? "Grátis" : `${formattedTargetPrice}/mês`})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
            aria-label="Fechar modal"
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
                    {targetMaxDebtors
                      ? `Até ${targetMaxDebtors} presas marcadas simultaneamente (até 36x)`
                      : "Presas e dívidas ILIMITADAS na gruta (até 120x)"}
                  </strong>{" "}
                  {currentMaxDebtors ? `(você tinha ${currentMaxDebtors})` : ""}
                </span>
              </li>

              {targetPlan.config_plan?.can_risk_score && (
                <>
                  <li className="flex items-start gap-2">
                    <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">
                        Velocímetro de Score de Risco &amp; Raio-X da Presa:
                      </strong>{" "}
                      página exclusiva de inteligência comportamental (0 a 100 pts)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">
                        Termômetro Geral da Gruta:
                      </strong>{" "}
                      diagnóstico completo da sua carteira separando a Elite da Zona de Calote
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">
                        Juros ao Mês (% a.m.) &amp; Armas Automáticas:
                      </strong>{" "}
                      seleção automática do nível de cobrança no WhatsApp pelo Score
                    </span>
                  </li>
                </>
              )}

              {targetPlan.config_plan?.can_access_financial &&
                !currentPlan?.config_plan?.can_access_financial && (
                  <li className="flex items-start gap-2">
                    <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Painel Financeiro Consolidado:</strong>{" "}
                      gráficos de liquidez, eficiência e próxima cobrança prioritária
                    </span>
                  </li>
                )}

              {targetPlan.config_plan?.can_debtor_portal &&
                !currentPlan?.config_plan?.can_debtor_portal && (
                  <li className="flex items-start gap-2">
                    <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Link da Dívida para a Presa:</strong>{" "}
                      fatura protegida por código com chave Pix 1-clique
                    </span>
                  </li>
                )}

              {targetPlan.config_plan?.can_attach_receipts &&
                !currentPlan?.config_plan?.can_attach_receipts && (
                  <li className="flex items-start gap-2">
                    <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Arquivo de Provas:</strong>{" "}
                      anexo de comprovantes de transferência e de parcelas pagas
                    </span>
                  </li>
                )}

              {targetPlan.config_plan?.custom_templates &&
                !currentPlan?.config_plan?.custom_templates && (
                  <li className="flex items-start gap-2">
                    <FaCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Modelos personalizados de mensagens de WhatsApp e cláusulas de quebra de acordo
                    </span>
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
                  <strong className="text-white">
                    {targetMaxDebtors ?? 2} presas marcadas simultâneas
                  </strong>{" "}
                  (limite de até {isFreePlan ? "12x" : "36x"} parcelas).
                </span>
              </li>

              {losingRiskScore && (
                <>
                  <li className="flex items-start gap-2">
                    <FaTriangleExclamation className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">
                        Bloqueio do Termômetro da Gruta, Raio-X e Mural de Caôs:
                      </strong>{" "}
                      você perde o Velocímetro Biológico, o Raio-X da Presa e o histórico de caôs e promessas furadas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaTriangleExclamation className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Perda da modalidade de <strong className="text-white">Juros ao Mês (% a.m.)</strong> e da seleção automática de armas no WhatsApp.
                    </span>
                  </li>
                </>
              )}

              {isFreePlan && (
                <>
                  <li className="flex items-start gap-2">
                    <FaTriangleExclamation className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Bloqueio do <strong className="text-white">Painel Financeiro</strong>, do{" "}
                      <strong className="text-white">Link da Dívida para a Presa</strong> e do{" "}
                      <strong className="text-white">Anexo de Comprovantes</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaTriangleExclamation className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Perda dos modelos personalizados de cobrança e do gatilho de quebra de acordo.
                    </span>
                  </li>
                </>
              )}
            </ul>

            {/* Aviso da Jaula do Tubarão para Downgrade */}
            <div className="rounded-xl bg-rose-950/40 border border-rose-900/60 p-3 text-xs font-mono text-rose-300 leading-relaxed space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>⚠️ A Jaula do Tubarão será acionada</span>
              </div>
              <p>
                Ao reduzir sua capacidade para <strong>{targetMaxDebtors ?? 1} presa ativa</strong>, suas dívidas de <strong>maior valor em aberto serão trancadas na jaula</strong> (você não poderá dar baixa no Pix, registrar desculpas nem emitir faturas delas até voltar para o plano pago).
              </p>
              <p className="text-zinc-400">
                Apenas a sua dívida de menor valor permanecerá liberada para cobrança. Seus dados continuam salvos com segurança, mas bloqueados.
              </p>
              <p className="text-emerald-400 font-bold pt-1">
                🛡️ Carência garantida: seus benefícios atuais continuam 100% liberados até a data de expiração da sua fatura já paga. A Jaula só trancará as dívidas excedentes após o término do período!
              </p>
            </div>
          </div>
        )}

        {/* Caixa Informativa: Regra Real de Faturamento */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800 p-3 text-xs font-mono text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
            <FaInfo className="size-3 text-emerald-400 shrink-0" />
            <span>
              {isFromFreePlan
                ? "Regra de Faturamento: Autorização no Mercado Pago"
                : isFreePlan
                ? "Regra de Faturamento: Cancelamento com Carência"
                : "Regra de Faturamento: Atualização na Próxima Fatura"}
            </span>
          </div>
          <p className="leading-relaxed">
            {isFromFreePlan
              ? "Você será encaminhado ao Mercado Pago para autorizar a assinatura. A nova gruta fica liberada assim que o pagamento for confirmado."
              : isUpgrade
              ? `Sua assinatura ativa no Mercado Pago será atualizada para ${formattedTargetPrice}/mês (cobrado na próxima fatura) e todos os novos recursos são liberados imediatamente.`
              : isFreePlan
              ? "Sua assinatura recorrente será cancelada no Mercado Pago para evitar novas cobranças. Seu plano atual permanece ativo com todos os benefícios até o fim do ciclo vigente já pago."
              : `O valor da sua assinatura no Mercado Pago será reduzido para ${formattedTargetPrice}/mês na próxima fatura, mantendo seu plano atual liberado até a virada.`}
          </p>
        </div>

        {/* Trava de Confirmação Explícita Anti-Clique Acidental */}
        <label
          htmlFor="confirm-plan-change-checkbox"
          className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none text-xs font-mono ${
            isConfirmed
              ? "border-emerald-500/40 bg-emerald-500/10 text-white"
              : "border-zinc-700 bg-zinc-950/80 text-zinc-300 hover:border-zinc-600"
          }`}
        >
          <input
            id="confirm-plan-change-checkbox"
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            disabled={isPending}
            className="mt-0.5 size-4 rounded border-zinc-600 accent-emerald-500 shrink-0 cursor-pointer"
          />
          <span className="leading-snug">
            {isUpgrade ? (
              isFromFreePlan ? (
                <>
                  Confirmo que desejo assinar o plano{" "}
                  <strong className="text-white">{targetPlan.name}</strong> por{" "}
                  <strong className="text-emerald-400">{formattedTargetPrice}/mês</strong> no Mercado Pago.
                </>
              ) : (
                <>
                  Confirmo a evolução imediata para o plano{" "}
                  <strong className="text-white">{targetPlan.name}</strong> e a atualização da minha assinatura para{" "}
                  <strong className="text-emerald-400">{formattedTargetPrice}/mês</strong>.
                </>
              )
            ) : (
              <>
                Estou ciente das regras acima e confirmo a mudança imediata do meu plano para{" "}
                <strong className="text-white">{targetPlan.name}</strong>.
              </>
            )}
          </span>
        </label>

        {/* Ação Principal no Rodapé (Único botão branco, habilitado somente após marcar o checkbox) */}
        <div className="flex items-center justify-end pt-2 border-t border-zinc-800">
          <Button
            type="button"
            size="lg"
            disabled={isPending || !isConfirmed}
            onClick={handleConfirmChange}
            className="w-full bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 font-heading font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <FaSpinner className="size-3.5 animate-spin" />
                <span>Atualizando Plano...</span>
              </div>
            ) : isUpgrade ? (
              isFromFreePlan ? (
                <div className="flex items-center gap-1.5">
                  <FaShieldHalved className="size-3.5" />
                  <span>Ir para o Mercado Pago ({formattedTargetPrice}/mês)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <FaArrowUp className="size-3.5" />
                  <span>Confirmar Upgrade ({formattedTargetPrice}/mês)</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1.5">
                <FaArrowDown className="size-3.5" />
                <span>Confirmar Mudança para {targetPlan.name}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
