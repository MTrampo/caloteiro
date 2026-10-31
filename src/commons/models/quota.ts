export interface LockedQuotaSummary {
  lockedDebtsCount: number;
  lockedTotalAmount: number;
  isOverQuota: boolean;
  maxAllowed: number | null;
}

export interface PartitionedDebtsQuotaResult {
  activeDebtIds: Set<string>;
  lockedDebtIds: Set<string>;
  lockedDebtsCount: number;
  lockedTotalAmount: number;
  isOverQuota: boolean;
  maxAllowed: number | null;
}

