import type { LockedQuotaSummary } from "./quota";

export type PromiseGravity =
  | "ON_TIME"
  | "LIGHT_DELAY"
  | "STANDARD_EXCUSE"
  | "BROKEN_AGREEMENT";

export type PromiseFilterTab = "OPEN" | "ON_TIME" | "OVERDUE" | "DEFAULTED";

export type PromiseSortBy =
  | "late_first"
  | "due_date_asc"
  | "created_at_desc"
  | "debtor_name_asc";

export interface PromiseItemFormatted {
  id: string;
  debtorId: string;
  debtorName: string;
  debtorNickname?: string | null;
  debtorInitials?: string;
  debtTitle: string;
  paidInstallments: number;
  totalInstallments: number;
  dueStatusText: string;
  gravity: PromiseGravity;
  url: string;
  createdAt?: string;
  isLocked?: boolean;
  lockedReason?: string;
}

export interface TrackingSummaryCardData {
  amount: string;
  description: string;
  last: string;
  changePercent: number;
}

export interface TrackingSummaryData {
  open: TrackingSummaryCardData;
  onTime: TrackingSummaryCardData;
  overdue: TrackingSummaryCardData;
  defaulted: TrackingSummaryCardData;
}

export interface TrackingCounts {
  open: number;
  onTime: number;
  overdue: number;
  defaulted: number;
}

export interface PaginatedPromisesResult {
  items: PromiseItemFormatted[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  counts: TrackingCounts;
  lockedQuotaSummary?: LockedQuotaSummary;
}

export interface GetPromisesQueryPayload {
  tab?: PromiseFilterTab;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: PromiseSortBy;
}

