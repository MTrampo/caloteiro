"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cancelSubscriptionAction } from "@/actions/subscription";
import type { Profile } from "@/commons/models/user";
import type { Subscription, Plan } from "@/commons/models/subscription";
import { PlanChangeManager } from "@/features/subscription/components/plan-change-manager";
import {
  FaUser,
  FaBolt,
  FaArrowRight,
  FaCheck,
  FaBan,
} from "react-icons/fa6";
import { Loader2 } from "lucide-react";

interface AccountFeatureProps {
  profile: Profile | null;
  subscription: Subscription | null;
  plans?: Plan[];
}

export function AccountFeature({ profile, subscription, plans = [] }: AccountFeatureProps) {
  const [isCanceling, setIsCanceling] = React.useState(false);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [showPlanManager, setShowPlanManager] = React.useState(false);

  const planName = subscription?.plan?.name || "Nenhum plano ativo";
  const planPrice = subscription?.base_value ? Number(subscription.base_value).toFixed(2).replace(".", ",") : "0,00";
  const mpStatus = subscription?.mp_status || "inativo";
  const isAuthorized = mpStatus === "authorized";
  const isCancelled = mpStatus === "cancelled";

  const maxDebtors = subscription?.plan?.config_plan?.max_debtors;
  const maxDebtorsLabel =
    maxDebtors === null || maxDebtors === undefined
      ? "Ilimitados"
      : `${maxDebtors} devedores simultâneos`;

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Por favor, conte-nos brevemente o motivo da saída.");
      return;
    }

    try {
      setIsCanceling(true);
      const res = await cancelSubscriptionAction(cancelReason);

      if (res.success) {
        toast.success(
          "Cancelamento agendado. Seu acesso continuará ativo até o fim do período já pago."
        );
        setCancelModalOpen(false);
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
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full">
      {/* Cabeçalho da Página (Solto, sem card, sem ícones no título) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
            Minha Conta e Assinatura
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Dados cadastrais do tubarão e controle do arsenal ativo no Mercado Pago.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Ficha do Tubarão */}
        <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FaUser className="size-3.5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-white">
                Ficha do Tubarão
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Identificação do tubarão responsável
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs font-mono">
            <div>
              <span className="text-zinc-500 block">Nome Registrado</span>
              <span className="text-zinc-200 font-bold text-sm">
                {profile?.name || "Não informado"}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block">Apelido na Praça</span>
              <span className="text-zinc-300">
                {profile?.nickname || "Sem apelido definido"}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block">E-mail de Acesso</span>
              <span className="text-zinc-300">
                {profile?.email || "E-mail não identificado"}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block">Termos e Condições</span>
              <span className="text-emerald-400 flex items-center gap-1.5 pt-0.5">
                <FaCheck className="size-3" />
                Aceito e em conformidade
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Arsenal Ativo & Assinatura */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FaBolt className="size-3.5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-white">
                    Status do Arsenal
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Plano comercial contratado no Mercado Pago
                  </p>
                </div>
              </div>

              <span
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border self-start sm:self-auto ${
                  isAuthorized
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : isCancelled
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {isAuthorized
                  ? "Assinatura Ativa"
                  : isCancelled
                  ? "Cancelada (Em Aviso Prévio)"
                  : "Pendente / Inativa"}
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
                    : "Em renovação"}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  Via Mercado Pago
                </span>
              </div>
            </div>
          </div>

          {/* Ações da Assinatura */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800">
            {isAuthorized ? (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="text-xs font-mono text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FaBan className="size-3" />
                <span>Cancelar assinatura</span>
              </button>
            ) : (
              <span className="text-xs font-mono text-zinc-500">
                Sem renovação automática ativa
              </span>
            )}

            <Button
              type="button"
              onClick={() => setShowPlanManager((prev) => !prev)}
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-heading font-bold rounded-xl text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <span>{showPlanManager ? "Ocultar Planos" : "Mudar Arsenal de Cobrança"}</span>
              <FaArrowRight className="size-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Seção de Planos Comerciais (Upgrade & Downgrade com Modal Comparativo de Impacto) */}
      {(showPlanManager || plans.length > 0) && (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-white">
              Planos de Assinatura
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Faça upgrade para caçar mais caloteiros ou ajuste sua mensalidade conforme a necessidade.
            </p>
          </div>

          <PlanChangeManager
            plans={plans}
            currentPlanSlug={subscription?.plan?.slug || "tubarao-lixa"}
            currentBaseValue={Number(subscription?.base_value || 0)}
          />
        </div>
      )}


      {/* Modal de Cancelamento */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-white">
                Vai abandonar os caloteiros?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                Ao cancelar, seu arsenal continuará ativo até o término do ciclo já pago. Depois disso, seus registros serão mantidos em modo somente leitura.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-300">
                Motivo da saída
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Todo mundo me pagou, achei o valor alto, etc."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                disabled={isCanceling}
                onClick={() => setCancelModalOpen(false)}
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                Voltar
              </Button>
              <Button
                disabled={isCanceling}
                onClick={handleConfirmCancel}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
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

