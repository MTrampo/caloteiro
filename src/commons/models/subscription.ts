export interface ConfigPlan {
  id: string;
  name: string;
  max_debtors: number | null; // null = ilimitado
  custom_templates: boolean;
  export_reports: boolean;
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
  config_plan?: ConfigPlan | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id?: string | null;
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
}

export interface SubscriptionPayloadCookie {
  subscriptionId?: string | null;
  status?: string | null;
  currentPeriodEnd?: string | null;
  userId?: string | null;
  planSlug?: string | null;
}

export interface UserPermissions {
  maxDebtors: number | null;
  canCustomTemplates: boolean;
  canExportReports: boolean;
  isSubscriptionActive: boolean;
}
