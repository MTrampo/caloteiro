export interface PlanInvitationFormatted {
  id: string;
  token: string;
  isAvailable: boolean;
  recipientName?: string | null;
  recipientEmail?: string | null;
}

