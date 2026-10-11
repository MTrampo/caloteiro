import type { Plan, ConfigPlan } from "@/commons/models/subscription";

export interface SharkMeta {
  level: number;
  label: string;
  badgeClass: string;
  barClass: string;
  borderClass: string;
  iconColorClass: string;
}

export interface SubscriptionFlowProps {
  plans: Plan[];
  currentSubscriptionPlanSlug?: string | null;
}

export interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isSelected: boolean;
  isPending: boolean;
  onSelectPlan: (planId: string) => void;
}

export interface PlanFeaturesListProps {
  config: ConfigPlan | null | undefined;
}

export interface SharkBehaviorBoxProps {
  slug: string;
  sharkText: string;
}

