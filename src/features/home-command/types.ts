export type FeedItemType = "urgent_overdue" | "due_today" | "due_soon" | "recently_paid"

export type FeedOccurrence = {
  id: string
  debtorName: string
  debtorNickname?: string
  debtorPhone: string
  type: FeedItemType
  relativeTimeText: string // "Venceu há 3 dias", "Vence Hoje", "Pagou ontem"
  installmentText: string // "Parcela 2 de 5", "Parcela única"
  pixKey?: string
  lastExcuseNote?: string
}

export type TriageKPIs = {
  dueSoonCount: number // Vencendo Hoje ou nesta semana
  recentlyPaidCount: number // Últimos 7 dias
  criticalOverdueCount: number // Risco crítico > 30 dias
}

export type CommandCenterData = {
  userName: string
  kpis: TriageKPIs
  feed: FeedOccurrence[]
  wisdomQuote: {
    quote: string
    author: string
    subtext: string
  }
}

