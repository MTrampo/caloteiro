export type PromiseGravity =
  | "EM_DIA"
  | "ATRASO_LEVE"
  | "DESGULPA_PADRAO"
  | "ACORDO_ROMPIDO"

export type PromiseItem = {
  id: string
  debtorId: string
  debtorName: string
  debtorInitials?: string
  debtTitle: string
  paidInstallments: number
  totalInstallments: number
  dueStatusText: string
  gravity: PromiseGravity
  url: string
}

export type PromiseFilterTab = "EM_ABERTO" | "EM_DIA" | "EM_ATRASO" | "CALOTEIROS"
