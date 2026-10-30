import type { ConfigPlan } from "@/commons/models/subscription";

/**
 * Constantes Globais de Planos e Assinaturas
 */
export const FREE_PLAN_SLUG = "tubarao-lixa";
export const DEFAULT_FREE_PLAN_NAME = "Tubarão Lixa";
export const FREE_PLAN_PRICE = 0;
export const FREE_PLAN_DEFAULT_MAX_DEBTORS = 2;

export const PAID_PLAN_SLUGS = {
  BRANCO: "tubarao-branco",
  CABECA_CHATO: "tubarao-cabeca-chato",
} as const;

export const FREE_PLAN_RESET_PAYLOAD = {
  base_value: FREE_PLAN_PRICE,
  mp_status: "authorized" as const,
  mp_subscription_id: null,
  current_period_end: null,
};

/**
 * Retorna a lista canônica e completa de benefícios de cada plano
 */
export function getPlanBenefits(
  planNameOrSlug?: string | null,
  config?: Partial<ConfigPlan> | null
): string[] {
  const normalized = (planNameOrSlug || "").toLowerCase();
  const isTCC =
    normalized.includes("chato") ||
    normalized.includes("chata") ||
    normalized === "tubarao-cabeca-chato";
  const isTB =
    normalized.includes("branco") ||
    normalized === "tubarao-branco";

  const benefits: string[] = [];

  // 1. Capacidade da Gruta
  if (config?.max_debtors) {
    benefits.push(
      `Capacidade da Gruta: até ${config.max_debtors} presas marcadas simultâneas (parcelamento até 36x)`
    );
  } else if (isTCC || config?.max_debtors === null) {
    benefits.push(
      "Capacidade da Gruta: presas marcadas e dívidas ativas ILIMITADAS (parcelamento até 120x)"
    );
  } else {
    benefits.push(
      "Capacidade da Gruta: até 2 presas marcadas simultâneas (parcelamento até 12x)"
    );
  }

  // 2. Modalidades de Juros e Regras
  if (isTCC) {
    benefits.push(
      "Modalidades de Juros: 4 opções liberadas (+ juros ao mês % a.m. exclusivo e taxa padrão)"
    );
  } else if (isTB) {
    benefits.push(
      "Modalidades de Juros: 3 opções liberadas (+ Taxa Fixa em Reais R$ do Tubarão)"
    );
  } else {
    benefits.push(
      "Modalidades de Juros: 2 opções (Sem Juros e % Total sobre o valor)"
    );
  }

  // 3. Termômetro da Gruta & Inteligência de Risco (Exclusivo Tubarão Cabeça Chata)
  if (config?.can_risk_score || isTCC) {
    benefits.push(
      "Termômetro da Gruta (/painel/termometro): velocímetro geral de risco, divisão biológica e veredito ácido"
    );
    benefits.push(
      "Score de Risco da Mordida Exploratória: pontuação comportamental (0 a 100 pts) e arma de WhatsApp automática"
    );
    benefits.push(
      "Raio-X Comportamental da Presa: extrato profundo de sangramento/cicatrização e mural de caôs"
    );
  }

  // 4. Link da Dívida para a Presa (Portal Externo)
  if (config?.can_debtor_portal || isTB || isTCC) {
    benefits.push(
      "Link da Dívida para a Presa: portal externo protegido por PIN com cópia do Pix em 1 clique"
    );
  }

  // 5. Painel Financeiro Consolidado
  if (config?.can_access_financial || isTB || isTCC) {
    benefits.push(
      "Painel Financeiro Consolidado: auditoria em tempo real do capital voando na pista vs recuperado"
    );
  }

  // 6. Scripts de WhatsApp e Cláusulas
  if (config?.custom_templates || isTB || isTCC) {
    benefits.push(
      "Modelos 100% Personalizados: edição livre dos 3 scripts ácidos de WhatsApp e gatilho de quebra de acordo"
    );
  } else {
    benefits.push(
      "Mensagens de WhatsApp: 3 níveis de cobrança prontos (do Lembrete Amigo ao Modo Tio Patinhas)"
    );
  }

  // 7. Arquivo de Provas (Comprovantes Pix)
  if (config?.can_attach_receipts || isTB || isTCC) {
    benefits.push(
      "Arquivo de Provas: cofre permanente de anexos de comprovantes e recibos Pix WebP"
    );
  }

  return benefits;
}


