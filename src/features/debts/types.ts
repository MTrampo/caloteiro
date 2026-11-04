import type {
  FinancialPeriod,
  FinancialKpiNature,
  FinancialKpiItem,
  PriorityDebtorData,
  PortfolioSegment,
  PortfolioDistributionData,
  EfficiencyTimePoint,
  DebtEfficiencyData,
  FinancialAnalyticsResult,
} from "@/commons/models/financial";

export type {
  FinancialPeriod,
  FinancialKpiNature,
  FinancialKpiItem,
  PortfolioSegment,
  PortfolioDistributionData,
  EfficiencyTimePoint,
  DebtEfficiencyData,
  FinancialAnalyticsResult,
};

export type PriorityDebtor = PriorityDebtorData;

export type DebtsFinancialData = {
  kpis: {
    emAberto: FinancialKpiItem;
    emDia: FinancialKpiItem;
    emAtraso: FinancialKpiItem;
    caloteiros: FinancialKpiItem;
  };
  priorityDebtor: PriorityDebtor | null;
  portfolio: PortfolioDistributionData;
  efficiency: DebtEfficiencyData;
};
