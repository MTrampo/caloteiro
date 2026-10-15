export type PromiseGravity =
  | "EM_DIA"
  | "ATRASO_LEVE"
  | "DESGULPA_PADRAO"
  | "ACORDO_ROMPIDO";

export type PromiseFilterTab = "EM_ABERTO" | "EM_DIA" | "EM_ATRASO" | "CALOTEIROS";

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
}

export interface AcompanhamentoSummaryCardData {
  amount: string;
  description: string;
  last: string;
  changePercent: number;
}

export interface AcompanhamentoSummaryData {
  emAberto: AcompanhamentoSummaryCardData;
  emDia: AcompanhamentoSummaryCardData;
  emAtraso: AcompanhamentoSummaryCardData;
  caloteiros: AcompanhamentoSummaryCardData;
}

export interface AcompanhamentoCounts {
  emAberto: number;
  emDia: number;
  emAtraso: number;
  caloteiros: number;
}

export interface PaginatedPromisesResult {
  items: PromiseItemFormatted[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  counts: AcompanhamentoCounts;
}

export interface GetPromisesQueryPayload {
  userId: string;
  page?: number;
  limit?: number;
  tab?: PromiseFilterTab;
  search?: string;
  sortBy?: PromiseSortBy;
}
