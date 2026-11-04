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
  | "judicial_agreement"
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
  judicial_agreement: "Acordo Judicial / Processo",
  other: "Outro",
};

export type DebtBreachStatus = "none" | "warning" | "breached";

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
    label: "Quebra de Acordo / Calote",
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
  max_late_installments?: number | null;
  show_notes_on_invoice?: boolean;
  loan_receipt_path?: string | null;
}

export interface UploadReceiptStoragePayload {
  userId: string;
  folder: "loan" | "payment";
  buffer: Buffer;
}

export interface UploadReceiptResult {
  receiptPath: string;
  compressedBytes: number;
}

export interface UpdateDebtAgreementRulesPayload {
  debtId: string;
  userId: string;
  notes: string | null;
  maxLateInstallments: number | null;
  showNotesOnInvoice: boolean;
}

export interface UpdateDebtBreachStatusPayload {
  debtId: string;
  userId: string;
  isBreached: boolean;
}

export interface RegisterPaymentPayload {
  amount: number;
  notes?: string | null;
  paid_at?: string;
  receipt_path?: string | null;
}

export interface RegisterExcusePayload {
  installment_id: string;
  excuse_text: string;
  promised_date: string;
}

export interface AttachInstallmentReceiptPayload {
  debtId: string;
  installmentId: string;
  receipt_path: string;
}

export interface AttachLoanReceiptPayload {
  debtId: string;
  receipt_path: string;
}

export interface DeleteDebtReceiptPayload {
  debtId: string;
  target: "loan" | "installment";
  installmentId?: string;
}

export interface UpdateDebtPortalConfigPayload {
  debtId: string;
  userId: string;
  publicLinkEnabled: boolean;
  publicAccessCode?: string;
  regenerateCode?: boolean;
}

export interface VerifyDebtInvoiceAccessPayload {
  debtId: string;
  accessCode: string;
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
  receiptUrl: string | null;
  excuses: DebtExcuseFormatted[];
}

export interface DebtPaymentFormatted extends DebtPaymentRow {
  formattedAmount: string;
  formattedPaidAt: string;
  receiptUrl: string | null;
}

export interface DebtDetailsFormatted extends DebtRow {
  publicLinkEnabled: boolean;
  publicAccessCode: string;
  maxLateInstallments: number | null;
  showNotesOnInvoice: boolean;
  breachStatus: DebtBreachStatus;
  loanReceiptUrl: string | null;
  formattedOriginalAmount: string;
  formattedTotalAmount: string;
  formattedPaidAmount: string;
  formattedRemainingAmount: string;
  progressPercentage: number;
  formattedLoanDate: string;
  formattedFirstDueDate: string;
  statusLabel: string;
  isLocked?: boolean;
  lockedReason?: string;
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

// ==============================================================================
// Contratos Públicos Sanitizados (Fatura Externa /fatura/[id] — Zero Leak)
// ==============================================================================

export interface PublicInstallmentItem {
  id: string;
  installmentNumber: number;
  nominalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  formattedNominalAmount: string;
  formattedPaidAmount: string;
  formattedRemainingAmount: string;
  dueDate: string;
  formattedDueDate: string;
  relativeDueDateLabel: string;
  status: InstallmentStatus;
  statusLabel: string;
  statusBadgeClass: string;
  isLate: boolean;
  lateDays: number;
  receiptUrl?: string | null;
}

export interface PublicDebtPaymentItem {
  id: string;
  amount: number;
  formattedAmount: string;
  paidAt: string;
  formattedPaidAt: string;
}

export interface PublicDebtInvoiceViewData {
  debtId: string;
  title: string;
  categoryLabel: string;
  debtorFirstName: string;
  creditorDisplayName: string;
  creditorPhone: string | null;
  creditorWhatsAppUrl: string | null;
  pixKey: string | null;
  pixKeyType: string | null;
  pixHolderName: string | null;
  pixBankName: string | null;
  originalAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalInterestAmount: number;
  formattedOriginalAmount: string;
  formattedTotalAmount: string;
  formattedPaidAmount: string;
  formattedRemainingAmount: string;
  formattedTotalInterestAmount: string;
  hasInterest: boolean;
  interestLabel: string;
  progressPercentage: number;
  formattedLoanDate: string;
  formattedFirstDueDate: string;
  paymentMethodLabel: string;
  status: DebtStatus;
  statusLabel: string;
  isFullySettled: boolean;
  paidInstallmentsCount: number;
  totalInstallmentsCount: number;
  remainingInstallmentsCount: number;
  lateInstallmentsCount: number;
  maxLateInstallments: number | null;
  breachStatus: DebtBreachStatus;
  publicNotes: string | null;
  nextInstallment: PublicInstallmentItem | null;
  installments: PublicInstallmentItem[];
  payments: PublicDebtPaymentItem[];
}


