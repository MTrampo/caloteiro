import { FaCheck } from "react-icons/fa6";
import type { PlanFeaturesListProps } from "../types";

export function PlanFeaturesList({ config }: PlanFeaturesListProps) {
  const isFree = config?.is_default || config?.max_debtors === 2;
  const isIntermediary = config?.max_debtors === 10;
  const isPro = config?.max_debtors === null || config?.max_debtors === undefined;

  const maxDebtorsLabel = isPro
    ? "Devedores e dívidas ilimitados"
    : `Até ${config?.max_debtors} devedores e dívidas ativas`;

  const installmentLabel = isFree
    ? "Parcelamento em até 12x"
    : isIntermediary
    ? "Parcelamento estendido até 36x"
    : "Parcelamento flexível até 120x";

  const interestLabel = isFree
    ? "2 opções de juros (sem juros e % total)"
    : isIntermediary
    ? "3 opções de juros (+ taxa fixa R$)"
    : "4 modalidades de juros (+ % a.m. exclusivo)";

  return (
    <div className="space-y-2.5 pt-1 text-xs font-mono">
      {/* 1. Limite de devedores e dívidas */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck className="size-3 text-emerald-400 shrink-0" />
        <span className={isPro ? "font-bold text-white" : ""}>{maxDebtorsLabel}</span>
      </div>

      {/* 2. Parcelamento */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck className="size-3 text-emerald-400 shrink-0" />
        <span>{installmentLabel}</span>
      </div>

      {/* 3. Modalidades de Juros */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck className="size-3 text-emerald-400 shrink-0" />
        <span className={isPro ? "font-bold text-emerald-400" : ""}>{interestLabel}</span>
      </div>

      {/* 4. Templates de WhatsApp */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck className="size-3 text-emerald-400 shrink-0" />
        <span>
          {config?.custom_templates
            ? "Templates de WhatsApp 100% editáveis"
            : "Templates padrão de cobrança"}
        </span>
      </div>

      {/* 5. Painel Financeiro Consolidado */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck
          className={`size-3 shrink-0 ${
            config?.can_access_financial ? "text-emerald-400" : "text-zinc-600"
          }`}
        />
        <span
          className={
            config?.can_access_financial
              ? "text-zinc-300"
              : "text-zinc-500 line-through"
          }
        >
          Painel financeiro geral consolidado
        </span>
      </div>

      {/* 6. Link da dívida para a presa */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck
          className={`size-3 shrink-0 ${
            config?.can_debtor_portal ? "text-emerald-400" : "text-zinc-600"
          }`}
        />
        <span
          className={
            config?.can_debtor_portal
              ? "text-zinc-300"
              : "text-zinc-500 line-through"
          }
        >
          Link da dívida para a presa
        </span>
      </div>

      {/* 7. Nível de Cara de Pau (Score de Risco) - Exclusivo Tubarão Cabeça Chato */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck
          className={`size-3 shrink-0 ${
            config?.can_risk_score ? "text-emerald-400" : "text-zinc-600"
          }`}
        />
        <span
          className={
            config?.can_risk_score
              ? "text-white font-bold"
              : "text-zinc-500 line-through"
          }
        >
          Nível de Cara de Pau (Score de Risco) {config?.can_risk_score && <span className="text-[10px] text-amber-400 font-mono font-normal">(Em breve)</span>}
        </span>
      </div>

      {/* 8. Arquivo de Provas (Anexo de Recibos) - Exclusivo Tubarão Cabeça Chato */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck
          className={`size-3 shrink-0 ${
            config?.can_attach_receipts ? "text-emerald-400" : "text-zinc-600"
          }`}
        />
        <span
          className={
            config?.can_attach_receipts
              ? "text-white font-bold"
              : "text-zinc-500 line-through"
          }
        >
          Arquivo de Provas (Anexo de Recibos) {config?.can_attach_receipts && <span className="text-[10px] text-amber-400 font-mono font-normal">(Em breve)</span>}
        </span>
      </div>
    </div>
  );
}
