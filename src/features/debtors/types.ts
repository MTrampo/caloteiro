export type DebtorRiskLevel = "low" | "medium" | "high" | "extreme"

export type DebtorStatus = "em_dia" | "atraso_leve" | "critico"

export type Debtor = {
  id: string
  name: string
  phone: string // obrigatório (WhatsApp)
  nickname?: string // ex: "Marcio da Oficina", "Cunhado"
  riskLevel?: DebtorRiskLevel
  relationship?: string // "Parente", "Amigo", "Colega", "Desconhecido"
  cpf?: string
  address?: string
  pixKey?: string
  status: DebtorStatus
  activeDebtsCount: number
  paidDebtsCount: number
  classicExcuses?: string // anotação cômica sobre as desculpas
}

