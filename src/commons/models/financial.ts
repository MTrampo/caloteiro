import type { LockedQuotaSummary } from "./quota";

export type FinancialPeriod = "month" | "six_months" | "year";

export type FinancialKpiNature = "pending" | "received" | "overdue" | "lost";

export interface FinancialKpiItem {
  amount: number;
  title: string;
  natureLabel: string;
  description: string;
  footnote: string;
  changePercent: number;
  isGainOrLoss: "positive" | "negative" | "neutral";
}

export interface PriorityDebtorData {
  id: string;
  debtId?: string;
  installmentId?: string;
  debtorId: string;
  debtorName: string;
  debtorInitials?: string;
  debtorPhone: string;
  debtTitle: string;
  currentInstallment: number;
  totalInstallments: number;
  installmentAmount: number;
  remainingAmount?: number;
  totalDebtAmount: number;
  pixKey?: string;
  debtorPixKey?: string | null;
  debtorPixKeyType?: string | null;
  creditorPixKey?: string | null;
  dueDate: string;
  urgency: "CRITICO" | "ATRASO_LEVE" | "VENCE_HOJE" | "PROXIMO";
  reasonText: string;
}

export interface PortfolioSegment {
  amount: number;
  count: number;
  percentage: number;
}

export interface PortfolioDistributionData {
  totalAmount: number;
  totalDebtors: number;
  emDia: PortfolioSegment;
  emAtraso: PortfolioSegment;
  critico: PortfolioSegment;
  healthMetrics: {
    immediateLiquidity: number;
    immediateLiquidityLabel: string;
    immediateLiquidityDesc: string;
    resolutionRate: number;
    resolutionRateLabel: string;
    resolutionRateDesc: string;
    averageTicket: number;
    averageTicketLabel: string;
    averageTicketDesc: string;
  };
}

export interface EfficiencyTimePoint {
  periodLabel: string;
  previsto: number;
  recebido: number;
  taxa: number;
}

export interface DebtEfficiencyData {
  globalEfficiencyScore: number;
  totalPrevisto: number;
  totalRecebido: number;
  series: EfficiencyTimePoint[];
  metrics: {
    averageTimeToPixDays: number;
    averageTimeToPixDesc: string;
    agreementsHonoredPercent: number;
    agreementsHonoredDesc: string;
    returnRatePercent: number;
    returnRateDesc: string;
    bestPeriodNote: string;
  };
}

export interface FinancialAnalyticsResult {
  kpis: {
    emAberto: FinancialKpiItem;
    emDia: FinancialKpiItem;
    emAtraso: FinancialKpiItem;
    caloteiros: FinancialKpiItem;
  };
  priorityDebtor: PriorityDebtorData | null;
  portfolio: PortfolioDistributionData;
  efficiency: DebtEfficiencyData;
  lockedQuotaSummary?: LockedQuotaSummary;
}

export interface GetFinancialAnalyticsPayload {
  userId: string;
  period: FinancialPeriod;
}

