export interface UpdateProfilePayload {
  name: string;
  nickname?: string | null;
  phone?: string | null;
}

export interface UpdateEmailPayload {
  newEmail: string;
}

export interface UpdatePasswordPayload {
  newPassword: string;
}

export interface ConfirmUpdatePasswordOtpPayload {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ConfirmEmailChangeOtpPayload {
  newEmail: string;
  code: string;
}

export interface InvoiceFormatted {
  id: string;
  amount: number;
  formattedAmount: string;
  status: string;
  statusLabel: string;
  statusBadgeClass: string;
  paidAt: string | null;
  formattedPaidAt: string;
  mpInvoiceId: string | null;
  createdAt: string;
  formattedCreatedAt: string;
}

