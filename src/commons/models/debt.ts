import type { Database } from "@/commons/types/database.types";
import type { DebtorItemFormatted } from "./debtor";

// ==============================================================================
// Enums e Constantes de Domínio
// ==============================================================================

export type DebtCategory =
  | "personal_loan"
  | "family_help"
  | "split_bill"
  | "fiado"
  | "car_repair"
  | "rent_bills"
  | "emergency"
  | "service"
  | "formal_agreement"
  | "other";

export const DEBT_CATEGORY_LABELS: Record<DebtCategory, string> = {
  personal_loan: "Empréstimo Pessoal",
  family_help: "Ajuda Familiar (Parente / Cunhado)",
  split_bill: "Divisão de Conta (Churrasco / Rolê)",
  fiado: "Fiado / Pendura",
  car_repair: "Conserto de Veículo / Trânsito",
  rent_bills: "Aluguel / Contas da Casa",
  emergency: "Socorro / Emergência",
  service: "Prestação de Serviço",
  formal_agreement: "Acordo / Negociação",
  other: "Outro",
};

export type InterestType = "none" | "fixed" | "total_percentage" | "monthly_percentage";

export const INTEREST_TYPE_LABELS: Record<InterestType, string> = {
  none: "Sem Juros (Empréstimo Camarada)",
  fixed: "Taxa Fixa no Valor Final (R$)",
  total_percentage: "Percentual no Valor Total (%)",
  monthly_percentage: "Percentual ao Mês (% a.m.)",
};

export type DebtStatus = "pending" | "settled" | "defaulted";

export const DEBT_STATUS_METADATA: Record<
  DebtStatus,
  { label: string; badgeClass: string }
> = {
  pending: {
    label: "Em Aberto",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  settled: {
    label: "Quitada (Honrada)",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  defaulted: {
    label: "Calote Confirmado",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
};

export type InstallmentStatus = "pending" | "late" | "partially_paid" | "paid";

export const INSTALLMENT_STATUS_METADATA: Record<
  InstallmentStatus,
  { label: string; badgeClass: string }
> = {
  pending: {
    label: "A Vencer",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
  },
  late: {
    label: "Em Atraso",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  partially_paid: {
    label: "Parcial",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  paid: {
    label: "Liquidada",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
};

// ==============================================================================
// Entidades de Banco de Dados (Raw)
// ==============================================================================

export type DebtRow = Database["public"]["Tables"]["debts"]["Row"];
export type DebtInsert = Database["public"]["Tables"]["debts"]["Insert"];
export type DebtUpdate = Database["public"]["Tables"]["debts"]["Update"];

export type InstallmentRow = Database["public"]["Tables"]["installments"]["Row"];
export type InstallmentInsert = Database["public"]["Tables"]["installments"]["Insert"];
export type InstallmentUpdate = Database["public"]["Tables"]["installments"]["Update"];

export type DebtPaymentRow = Database["public"]["Tables"]["debt_payments"]["Row"];
export type DebtPaymentInsert = Database["public"]["Tables"]["debt_payments"]["Insert"];

export type DebtExcuseRow = Database["public"]["Tables"]["debt_excuses"]["Row"];
export type DebtExcuseInsert = Database["public"]["Tables"]["debt_excuses"]["Insert"];

// ==============================================================================
// DTOs e Payloads de Entrada
// ==============================================================================

export interface CreateDebtPayload {
  debtor_id: string;
  title: string;
  category?: DebtCategory;
  original_amount: number;
  installments_count: number;
  payment_method?: string;
  loan_date?: string;
  first_due_date: string;
  interest_type?: InterestType;
  interest_rate?: number;
  total_amount?: number;
  notes?: string | null;
}

export interface RegisterPaymentPayload {
  amount: number;
  notes?: string | null;
  paid_at?: string;
}

export interface RegisterExcusePayload {
  installment_id: string;
  excuse_text: string;
  promised_date: string;
}

// ==============================================================================
// Contratos Tratados para a UI (*Formatted)
// ==============================================================================

export interface DebtExcuseFormatted extends DebtExcuseRow {
  formattedPromisedDate: string;
  formattedCreatedAt: string;
}

export interface InstallmentFormatted extends InstallmentRow {
  formattedNominalAmount: string;
  formattedPaidAmount: string;
  formattedRemainingAmount: string;
  formattedDueDate: string;
  isLate: boolean;
  lateDays: number;
  lateDaysText: string;
  statusLabel: string;
  statusBadgeClass: string;
  excuses: DebtExcuseFormatted[];
}

export interface DebtPaymentFormatted extends DebtPaymentRow {
  formattedAmount: string;
  formattedPaidAt: string;
}

export interface DebtDetailsFormatted extends DebtRow {
  formattedOriginalAmount: string;
  formattedTotalAmount: string;
  formattedPaidAmount: string;
  formattedRemainingAmount: string;
  progressPercentage: number;
  formattedLoanDate: string;
  formattedFirstDueDate: string;
  statusLabel: string;
  statusBadgeClass: string;
  categoryLabel: string;
  interestLabel: string;
  totalInterestAmount: number;
  formattedTotalInterestAmount: string;
  hasInterest: boolean;
  paidInstallmentsCount: number;
  totalInstallmentsCount: number;
  remainingInstallmentsCount: number;
  isFullySettled: boolean;
  hasLateInstallments: boolean;
  lateInstallmentsCount: number;
  debtor: DebtorItemFormatted;
  installments: InstallmentFormatted[];
  payments: DebtPaymentFormatted[];
}

