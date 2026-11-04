export interface ConfigPlan {
  id: string;
  name: string;
  max_debtors: number | null; // null = ilimitado
  custom_templates: boolean;
  export_reports?: boolean;
  can_access_financial: boolean;
  can_debtor_portal: boolean;
  can_risk_score: boolean;
  can_attach_receipts: boolean;
  is_default: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Plan {
  id: string;
  config_plan_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  billing_period?: string | null;
  mp_plan_id?: string | null;
  badge?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string | null;
  updated_at?: string | null;
  shark?: string | null;
  button?: string | null;
  config_plan?: ConfigPlan | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id?: string | null;
  scheduled_plan_id?: string | null;
  mp_subscription_id?: string | null;
  mp_payer_id?: number | null;
  mp_payer_email?: string | null;
  mp_status: string; // 'authorized', 'paused', 'cancelled', 'pending'
  base_value: number;
  current_period_start?: string | null;
  current_period_end?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  plan?: Plan | null;
  scheduled_plan?: Plan | null;
}

export interface SubscriptionPayloadCookie {
  subscriptionId?: string | null;
  status?: string | null;
  currentPeriodEnd?: string | null;
  userId?: string | null;
  planSlug?: string | null;
  planName?: string | null;
  permissions?: UserPermissions;
}

export interface UserPermissions {
  maxDebtors: number | null;
  canCustomTemplates: boolean;
  canExportReports?: boolean;
  canAccessFinancial: boolean;
  canDebtorPortal: boolean;
  canRiskScore: boolean;
  canAttachReceipts: boolean;
  isFreePlan: boolean;
  isSubscriptionActive: boolean;
}

export interface UserPlanLimits {
  maxDebtors: number | null;
  currentDebtorsCount: number;
  currentActiveDebtsCount: number;
  canCreateDebtor: boolean;
  canCreateDebt: boolean;
  isDebtorLimitReached: boolean;
  isDebtLimitReached: boolean;
  planSlug: string;
  planName: string;
  isFreePlan: boolean;
  canRiskScore?: boolean;
  scheduledPlanName?: string | null;
  scheduledPlanSlug?: string | null;
  scheduledPeriodEnd?: string | null;
}

/**
 * Payload para solicitação de troca de plano (Upgrade ou Downgrade)
 */
export interface ChangeSubscriptionPlanPayload {
  userId: string;
  userEmail: string;
  targetPlanId: string;
}

/**
 * Resultado da operação de troca de plano
 */
export interface PlanChangeResult {
  isUpgrade: boolean;
  previousPlanName: string;
  newPlanName: string;
  newPrice: number;
  effectiveNextBilling: boolean;
  isFreePlan: boolean;
  initPoint?: string | null;
  scheduledPeriodEnd?: string | null;
  message?: string;
}

/**
 * Payload estruturado para criação de sessão de checkout de assinatura
 */
export interface CreateCheckoutSessionPayload {
  userId: string;
  userEmail: string;
  planId: string;
}

/**
 * Resultado do fluxo de checkout de assinatura
 */
export interface CheckoutSessionResult {
  initPoint: string | null;
  isFree: boolean;
}

/**
 * Payload para registro de cancelamento de assinatura
 */
export interface CancelSubscriptionPayload {
  userId: string;
  reason: string;
  reasonDetails?: string;
}
