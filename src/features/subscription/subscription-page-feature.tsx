"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cancelSubscriptionAction } from "@/actions/subscription";
import type { Subscription, Plan } from "@/commons/models/subscription";
import type { InvoiceFormatted } from "@/commons/models/account";
import { FREE_PLAN_SLUG } from "@/commons/constants/subscription";
import { PlanChangeManager } from "./components/plan-change-manager";
import {
  FaCreditCard,
  FaReceipt,
  FaCheck,
  FaBan,
  FaArrowUpRightFromSquare,
  FaShieldHalved,
  FaXmark,
} from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface SubscriptionPageFeatureProps {
  subscription: Subscription | null;
  plans: Plan[];
  invoices: InvoiceFormatted[];
}

export function SubscriptionPageFeature({
  subscription,
  plans,
  invoices,
}: SubscriptionPageFeatureProps) {
  const router = useRouter();
  const [isCanceling, setIsCanceling] = React.useState(false);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");

  const planName = subscription?.plan?.name || "Tubarão Lixa";
  const planPrice = subscription?.base_value
    ? Number(subscription.base_value).toFixed(2).replace(".", ",")
    : "0,00";
  const mpStatus = subscription?.mp_status || "inativo";
  const isAuthorized = mpStatus === "authorized";
  const isCancelled = mpStatus === "cancelled";
  const isPaidPlan = Number(subscription?.base_value || 0) > 0 && subscription?.plan?.slug !== FREE_PLAN_SLUG;

  const maxDebtors = subscription?.plan?.config_plan?.max_debtors;
  const maxDebtorsLabel =
    maxDebtors === null || maxDebtors === undefined
      ? "Ilimitados"
      : `${maxDebtors} devedores simultâneos`;

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Por favor, conte-nos brevemente o motivo do cancelamento.");
      return;
    }

    try {
      setIsCanceling(true);
      const res = await cancelSubscriptionAction(cancelReason);

      if (res.success) {
        toast.success(
          "Cancelamento registrado! Seu acesso continuará ativo até o fim do período já pago."
        );
        setCancelModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Não foi possível cancelar no momento.");
      }
    } catch {
      toast.error("Erro ao processar cancelamento.");
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full min-w-0">
      {/* Cabeçalho da Página Solto (sem card e sem ícones no título) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Assinatura
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Controle do seu plano ativo, limites de devedores e faturas no Mercado Pago.
          </p>
        </div>
      </div>

      {/* Card do Plano Atual */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <FaCreditCard className="size-3.5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="font-heading text-base font-bold text-white">
                Plano Atual
              </h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Detalhes da modalidade e recorrência ativa
              </p>
            </div>
          </div>

          <span
            className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border self-start sm:self-auto ${
              isAuthorized
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : isCancelled
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-300"
            }`}
          >
            {isAuthorized
              ? "Assinatura Ativa"
              : isCancelled
              ? "Cancelada (Em Aviso Prévio)"
              : "Plano Gratuito / Sem Mensalidade"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-3.5 space-y-1">
            <span className="text-[11px] font-mono text-zinc-500 uppercase block">
              Plano Contratado
            </span>
            <span className="font-heading text-base font-bold text-white block">
              {planName}
            </span>
            <span className="text-xs font-mono text-emerald-400">
              R$ {planPrice} /mês
            </span>
          </div>

          <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-3.5 space-y-1">
            <span className="text-[11px] font-mono text-zinc-500 uppercase block">
              Capacidade de Cobrança
            </span>
            <span className="font-heading text-base font-bold text-white block">
              {maxDebtorsLabel}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              {subscription?.plan?.config_plan?.custom_templates
                ? "Templates liberados"
                : "Templates padrão"}
            </span>
          </div>

          <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-3.5 space-y-1">
            <span className="text-[11px] font-mono text-zinc-500 uppercase block">
              Próxima Cobrança / Fim
            </span>
            <span className="font-heading text-sm font-bold text-zinc-200 block truncate">
              {subscription?.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR")
                : "Sem renovação automática"}
            </span>
            <span className="text-xs font-mono text-zinc-500">
              Via Mercado Pago
            </span>
          </div>
        </div>

        {/* Banner de Plano Agendado / Aviso Prévio com Carência */}
        {subscription?.scheduled_plan_id && subscription.current_period_end && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 flex items-start gap-3">
            <FaShieldHalved className="size-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs font-mono">
              <span className="font-bold text-amber-300 block">
                Alteração de plano agendada
              </span>
              <p className="text-zinc-300 leading-relaxed">
                Você continuará com todos os benefícios do plano <strong className="text-white">{planName}</strong> até{" "}
                <strong className="text-white">
                  {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
                </strong>. Após essa data, sua conta passará para o plano {subscription.scheduled_plan?.name || "Tubarão Lixa"}.
              </p>
            </div>
          </div>
        )}

        {/* Rodapé do Card com Links e Cancelamento se ativo */}
        {isAuthorized ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
            <a
              href="https://www.mercadopago.com.br/subscriptions#from-section=menu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <FaArrowUpRightFromSquare className="size-3" />
              <span>Consultar assinaturas no Mercado Pago</span>
            </a>

            {isPaidPlan ? (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="text-xs font-mono text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <FaBan className="size-3" />
                <span>Cancelar assinatura</span>
              </button>
            ) : (
              <span className="text-xs font-mono text-zinc-500 flex items-center gap-1.5 self-start sm:self-auto">
                <FaShieldHalved className="size-3 text-emerald-400" />
                <span>Plano Gratuito Ativo (Sem cobrança recorrente)</span>
              </span>
            )}
          </div>
        ) : (
          <div className="pt-3 border-t border-zinc-800">
            <a
              href="https://www.mercadopago.com.br/subscriptions#from-section=menu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <FaArrowUpRightFromSquare className="size-3" />
              <span>Acessar portal de assinaturas do Mercado Pago</span>
            </a>
          </div>
        )}
      </div>

      {/* Seção de Planos de Assinatura */}
      <div className="space-y-4 pt-2">
        <div className="space-y-1">
          <h3 className="font-heading text-lg font-bold text-white">
            Planos de Assinatura
          </h3>
          <p className="text-xs font-mono text-zinc-400">
            Faça upgrade para caçar mais devedores ou altere sua modalidade a qualquer momento.
          </p>
        </div>

        <PlanChangeManager
          plans={plans}
          currentPlanSlug={subscription?.plan?.slug || "tubarao-lixa"}
          currentBaseValue={Number(subscription?.base_value || 0)}
        />
      </div>

      {/* Seção de Histórico de Pagamentos (Invoices) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <FaReceipt className="size-4 text-zinc-400" />
              <h3 className="font-heading text-lg font-bold text-white">
                Histórico de Pagamentos
              </h3>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Faturas emitidas e comprovantes de renovação da assinatura.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <FaShieldHalved className="size-3 text-emerald-400" />
            <span>Processado com segurança pelo Mercado Pago</span>
          </div>
        </div>

        {/* Texto de Auxílio e Transparência com Link Oficial do Mercado Pago */}
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 text-xs font-mono text-zinc-400 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>
            Você também pode consultar e gerenciar todas as assinaturas e cobranças diretamente pelo portal oficial do Mercado Pago.
          </span>
          <a
            href="https://www.mercadopago.com.br/subscriptions#from-section=menu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-zinc-200 underline decoration-zinc-600 hover:decoration-white transition-colors shrink-0"
          >
            <span>Ver no Mercado Pago</span>
            <FaArrowUpRightFromSquare className="size-3" />
          </a>
        </div>


        {/* Lista de Faturas */}
        {invoices.length > 0 ? (
          <div className="space-y-2.5">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {inv.formattedAmount}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${inv.statusBadgeClass}`}
                    >
                      {inv.statusLabel}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[11px] block">
                    Cobrança realizada em {inv.formattedCreatedAt}
                  </span>
                </div>

                <div className="text-zinc-400 text-right sm:text-left text-[11px]">
                  {inv.mpInvoiceId ? (
                    <span className="font-mono text-zinc-500">
                      ID: {inv.mpInvoiceId}
                    </span>
                  ) : (
                    <span>Assinatura Caloteiro</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State Limpo (Sem Pontilhado) */
          <div className="py-12 text-center space-y-2 font-mono">
            <p className="text-sm font-bold text-zinc-300">
              Nenhuma fatura registrada até o momento.
            </p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Quando houver pagamentos ou renovações do seu plano, as faturas aparecerão listadas aqui.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Cancelamento de Assinatura */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-[calc(100vw-1.5rem)] sm:w-full max-w-md p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[calc(100dvh-2.5rem)] overflow-y-auto overscroll-contain">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-bold text-white">
                  Deseja cancelar sua assinatura?
                </h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  Ao cancelar, seu plano continuará ativo até o término do ciclo já pago. Depois disso, sua conta retornará automaticamente ao plano gratuito Tubarão Lixa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                disabled={isCanceling}
                className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800 cursor-pointer shrink-0"
              >
                <FaXmark className="size-4" />
              </button>
            </div>

            {/* Aviso da Jaula do Tubarão no Cancelamento */}
            <div className="rounded-xl bg-rose-950/40 border border-rose-900/60 p-3 text-xs font-mono text-rose-300 leading-relaxed space-y-1">
              <span className="font-bold text-white block">⚠️ A Jaula do Tubarão será acionada</span>
              <p>
                Quando seu período vigente terminar e você retornar ao plano gratuito (limite de 1 presa ativa), suas dívidas de maior valor em aberto serão trancadas na jaula e não poderão ser cobradas até você assinar novamente.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-300">
                Motivo do cancelamento
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Consegui receber de todos os devedores, achei o valor alto, etc."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button
                disabled={isCanceling}
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer"
              >
                {isCanceling ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Cancelando...</span>
                  </div>
                ) : (
                  "Confirmar Cancelamento"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

