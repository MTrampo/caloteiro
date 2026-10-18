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

