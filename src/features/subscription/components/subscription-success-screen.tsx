"use client";

import Link from "next/link";
import { formatBRL, formatDate } from "@/commons/utils/format";
import { ArrowRight, Check } from "lucide-react";

interface SubscriptionSuccessScreenProps {
  planName: string;
  planPrice: number;
  maxDebtors: number | null;
  benefits: string[];
  currentPeriodEnd?: string | null;
}

export function SubscriptionSuccessScreen({
  planName,
  planPrice,
  maxDebtors,
  benefits,
  currentPeriodEnd,
}: SubscriptionSuccessScreenProps) {
  const formattedPrice = formatBRL(planPrice);
  const formattedNextBilling = currentPeriodEnd ? formatDate(currentPeriodEnd) : null;

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 w-full max-w-2xl mx-auto py-12 sm:py-20">
      {/* Cabeçalho Limpo (SEM ícones no h2, SEM badges no topo) */}
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Evolução de Predador Confirmada
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono">
          Obrigado pela sua confiança! O seu plano {planName} já está 100% ativo na sua gruta.
        </p>
      </div>

      {/* Card Individual Semântico com o Resumo do Plano Contratado */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider">
              Plano Ativo
            </span>
            <div className="text-xl sm:text-2xl font-bold text-white font-heading mt-0.5">
              {planName}
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Capacidade: {maxDebtors ? `${maxDebtors} presas marcadas simultâneas` : "Presas ilimitadas"}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider">
              Mensalidade
            </span>
            <div className="text-2xl font-bold text-white font-mono mt-0.5">
              {formattedPrice}
              <span className="text-xs text-zinc-400 font-normal">/mês</span>
            </div>
            {formattedNextBilling && (
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Próximo ciclo: {formattedNextBilling}
              </p>
            )}
          </div>
        </div>

        {/* Recursos Desbloqueados */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
            Artilharia Desbloqueada na Sua Gruta
          </span>
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-3 text-sm text-zinc-300"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nota Informativa */}
        <div className="pt-4 border-t border-border text-xs text-zinc-400 font-mono leading-relaxed">
          O recibo da sua cobrança foi enviado para o seu e-mail. Você tem total autonomia para gerenciar presas, configurar juros ou ajustar sua assinatura na gruta a qualquer momento.
        </div>
      </div>

      {/* Botão de Ação Principal (CTA em Branco, padronizado) */}
      <div className="flex justify-center pt-2">
        <Link
          href="/painel"
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl h-11 px-8 shadow-sm transition-all text-sm sm:text-base font-mono cursor-pointer"
        >
          Entrar na Central de Comando
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
