import { FaCheck } from "react-icons/fa6";
import type { PlanFeaturesListProps } from "../types";

export function PlanFeaturesList({ config }: PlanFeaturesListProps) {
  const maxDebtorsLabel =
    config?.max_debtors === null || config?.max_debtors === undefined
      ? "Devedores Ilimitados"
      : `Até ${config.max_debtors} devedores simultâneos`;

  return (
    <div className="space-y-2.5 pt-1 text-xs font-mono">
      {/* 1. Limite de devedores simultâneos */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck className="size-3 text-emerald-400 shrink-0" />
        <span>{maxDebtorsLabel}</span>
      </div>

      {/* 2. Acompanhamento individual de devedor */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck className="size-3 text-emerald-400 shrink-0" />
        <span>Acompanhamento individual de devedor</span>
      </div>

      {/* 3. Templates de WhatsApp */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck className="size-3 text-emerald-400 shrink-0" />
        <span>
          {config?.custom_templates
            ? "Templates de WhatsApp 100% editáveis"
            : "Templates padrão de cobrança"}
        </span>
      </div>

      {/* 4. Alerta de calote em tempo real */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck className="size-3 text-emerald-400 shrink-0" />
        <span>Alerta de calote em tempo real</span>
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

      {/* 6. Link de acompanhamento do devedor */}
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
          Link de acompanhamento do devedor
        </span>
      </div>

      {/* 7. Nível de Cara de Pau (Score de Risco) */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck
          className={`size-3 shrink-0 ${
            config?.can_risk_score ? "text-emerald-400" : "text-zinc-600"
          }`}
        />
        <span
          className={
            config?.can_risk_score
              ? "text-zinc-300"
              : "text-zinc-500 line-through"
          }
        >
          Nível de Cara de Pau (Score de Risco)
        </span>
      </div>

      {/* 8. Arquivo de Provas (Anexo de Recibos) */}
      <div className="flex items-center gap-2 text-zinc-300">
        <FaCheck
          className={`size-3 shrink-0 ${
            config?.can_attach_receipts ? "text-emerald-400" : "text-zinc-600"
          }`}
        />
        <span
          className={
            config?.can_attach_receipts
              ? "text-zinc-300"
              : "text-zinc-500 line-through"
          }
        >
          Arquivo de Provas (Anexo de Recibos)
        </span>
      </div>
    </div>
  );
}

