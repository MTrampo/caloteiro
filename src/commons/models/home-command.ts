export type FeedItemType = "urgent_overdue" | "due_today" | "due_soon" | "recently_paid";

export interface FeedOccurrence {
  id: string;
  debtId: string;
  debtorName: string;
  debtorNickname?: string;
  debtorPhone: string;
  type: FeedItemType;
  relativeTimeText: string;
  installmentText: string;
  pixKey?: string;
  lastExcuseNote?: string;
  nominalAmount: number;
  paidAmount?: number;
}

export interface TriageKPIs {
  dueSoonCount: number;
  recentlyPaidCount: number;
  criticalOverdueCount: number;
}

export interface WisdomQuote {
  quote: string;
  author: string;
  subtext: string;
}

export interface CommandCenterData {
  userName: string;
  kpis: TriageKPIs;
  feed: FeedOccurrence[];
  totalDebtsCount: number;
  creditorPixKey?: string;
  wisdomQuote: WisdomQuote;
  counts: {
    overdueCount: number;
    criticalCount: number;
    dueSoonCount: number;
    totalCount: number;
  };
}
