export type FinancialPeriod = "month" | "six_months" | "year"

export type FinancialKpiNature = "pending" | "received" | "overdue" | "lost"

export type FinancialKpiItem = {
  amount: number
  title: string
  natureLabel: string // Ex: "A Receber no Total", "Já no Bolso (Ganho)", "Travado (Falta Receber)", "Prejuízo Confirmado"
  description: string
  footnote: string
  changePercent: number
  isGainOrLoss: "positive" | "negative" | "neutral"
}

export type PriorityDebtor = {
  id: string
  debtorId: string
  debtorName: string
  debtorInitials?: string
  debtorPhone: string
  debtTitle: string
  currentInstallment: number
  totalInstallments: number
  installmentAmount: number
  totalDebtAmount: number
  pixKey: string
  dueDate: string // Data ISO
  urgency: "CRITICO" | "ATRASO_LEVE" | "VENCE_HOJE" | "PROXIMO"
  reasonText: string
}

export type PortfolioSegment = {
  amount: number
  count: number
  percentage: number
}

export type PortfolioDistributionData = {
  totalAmount: number
  totalDebtors: number
  emDia: PortfolioSegment
  emAtraso: PortfolioSegment
  critico: PortfolioSegment
  healthMetrics: {
    immediateLiquidity: number
    immediateLiquidityLabel: string
    immediateLiquidityDesc: string
    resolutionRate: number
    resolutionRateLabel: string
    resolutionRateDesc: string
    averageTicket: number
    averageTicketLabel: string
    averageTicketDesc: string
  }
}

export type EfficiencyTimePoint = {
  periodLabel: string // "Sem 1", "Sem 2", etc. ou "Mai", "Jun"
  previsto: number
  recebido: number
  taxa: number
}

export type DebtEfficiencyData = {
  globalEfficiencyScore: number // Ex: 84.2
  totalPrevisto: number
  totalRecebido: number
  series: EfficiencyTimePoint[]
  metrics: {
    averageTimeToPixDays: number
    averageTimeToPixDesc: string
    agreementsHonoredPercent: number
    agreementsHonoredDesc: string
    returnRatePercent: number
    returnRateDesc: string
    bestPeriodNote: string
  }
}

export type DebtsFinancialData = {
  kpis: {
    emAberto: FinancialKpiItem
    emDia: FinancialKpiItem
    emAtraso: FinancialKpiItem
    caloteiros: FinancialKpiItem
  }
  priorityDebtor: PriorityDebtor
  portfolio: PortfolioDistributionData
  efficiency: DebtEfficiencyData
}

