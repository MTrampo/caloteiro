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

      {/* 4. Investidas no WhatsApp */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck className="size-3 text-emerald-400 shrink-0" />
        <span>
          {config?.custom_templates
            ? "Investidas de WhatsApp 100% editáveis"
            : "Investidas padrão de cobrança"}
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

      {/* 7. Cláusulas do Acordo e Alerta de Quebra (Planos Pagos) */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck
          className={`size-3 shrink-0 ${
            !isFree ? "text-emerald-400" : "text-zinc-600"
          }`}
        />
        <span
          className={
            !isFree
              ? "text-zinc-300"
              : "text-zinc-500 line-through"
          }
        >
          Cláusulas do acordo e alerta de quebra
        </span>
      </div>

      {/* 8. Termômetro da Gruta - Exclusivo Tubarão Cabeça Chata */}
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
          Termômetro da Gruta (Risco Geral)
        </span>
      </div>

      {/* 9. Faro do Tubarão & Raio-X da Presa - Exclusivo Tubarão Cabeça Chata */}
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
          Raio-X Comportamental &amp; Faro do Tubarão
        </span>
      </div>

      {/* 10. Mural de Caôs e Desculpas - Exclusivo Tubarão Cabeça Chata */}
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
          Mural de Caôs e Desculpas Furadas
        </span>
      </div>

      {/* 11. Arquivo de Provas (Anexo de Comprovantes) */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck
          className={`size-3 shrink-0 ${
            !isFree ? "text-emerald-400" : "text-zinc-600"
          }`}
        />
        <span
          className={
            !isFree
              ? "text-zinc-300"
              : "text-zinc-500 line-through"
          }
        >
          Arquivo de Provas (Anexo de Comprovantes)
        </span>
      </div>
    </div>
  );
}
