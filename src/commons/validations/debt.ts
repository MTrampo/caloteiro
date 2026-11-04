import { z } from "zod";

/**
 * Esquema de validação para criação de uma nova dívida
 */
export const createDebtSchema = z.object({
  debtor_id: z.string().uuid("Devedor inválido ou não selecionado."),
  title: z
    .string()
    .min(3, "O título deve conter pelo menos 3 caracteres.")
    .max(100, "O título deve ter no máximo 100 caracteres."),
  category: z
    .enum([
      "personal_loan",
      "family_help",
      "split_bill",
      "fiado",
      "car_repair",
      "rent_bills",
      "emergency",
      "service",
      "formal_agreement",
      "judicial_agreement",
      "other",
    ])
    .default("personal_loan"),
  original_amount: z
    .number()
    .positive("O valor da dívida deve ser maior que zero.")
    .max(10000000, "Valor acima do limite permitido."),
  installments_count: z
    .number()
    .int("A quantidade de parcelas deve ser um número inteiro.")
    .min(1, "A dívida deve ter no mínimo 1 parcela.")
    .max(120, "Limite máximo de 120 parcelas."),
  payment_method: z.string().default("pix"),
  loan_date: z.string().optional(),
  first_due_date: z.string().min(1, "Informe a data do primeiro vencimento."),
  interest_type: z
    .enum(["none", "fixed", "total_percentage", "monthly_percentage"])
    .default("none"),
  interest_rate: z.number().min(0).default(0),
  total_amount: z.number().positive().optional(),
  notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres.").optional().nullable(),
  max_late_installments: z
    .number()
    .int("O limite de parcelas em atraso deve ser inteiro.")
    .min(1, "O gatilho de quebra deve ser de pelo menos 1 parcela.")
    .max(120, "Limite inválido.")
    .optional()
    .nullable(),
  show_notes_on_invoice: z.boolean().optional().default(false),
  loan_receipt_path: z
    .string()
    .trim()
    .max(500, "Caminho de comprovante inválido.")
    .optional()
    .nullable(),
});

/**
 * Esquema de validação para registro de pagamento (Pingou o Pix / Baixa)
 */
export const registerPaymentSchema = z.object({
  amount: z
    .number()
    .positive("O valor recebido deve ser maior que zero."),
  notes: z.string().max(500, "Anotação deve ter no máximo 500 caracteres.").optional().nullable(),
  paid_at: z.string().optional(),
  receipt_path: z
    .string()
    .trim()
    .max(500, "Caminho de comprovante inválido.")
    .optional()
    .nullable(),
});

/**
 * Esquema de validação para anotação de Caô / Desculpa
 */
export const registerExcuseSchema = z.object({
  installment_id: z.string().uuid("Parcela inválida."),
  excuse_text: z
    .string()
    .min(3, "A desculpa deve conter pelo menos 3 caracteres.")
    .max(500, "A desculpa deve ter no máximo 500 caracteres."),
  promised_date: z.string().min(1, "Informe a nova data prometida pelo caloteiro."),
});

/**
 * Esquema de validação para configuração do Link Público da Fatura (/fatura/[id])
 */
export const updateDebtPortalConfigSchema = z.object({
  debtId: z.string().uuid("Identificador da dívida inválido."),
  publicLinkEnabled: z.boolean(),
  publicAccessCode: z
    .string()
    .trim()
    .min(4, "O código de acesso deve ter pelo menos 4 caracteres.")
    .max(16, "O código de acesso deve ter no máximo 16 caracteres.")
    .optional(),
  regenerateCode: z.boolean().optional(),
});

/**
 * Esquema de validação para desbloqueio da fatura pública pelo devedor
 */
export const verifyDebtInvoiceAccessSchema = z.object({
  debtId: z.string().uuid("Link de fatura inválido."),
  accessCode: z
    .string()
    .trim()
    .min(1, "Informe o código de acesso para visualizar a fatura.")
    .max(20, "Código de acesso inválido."),
});

/**
 * Esquema de validação para atualização das cláusulas e gatilho de quebra do acordo
 */
export const updateDebtAgreementRulesSchema = z.object({
  debtId: z.string().uuid("Identificador da dívida inválido."),
  notes: z
    .string()
    .max(1000, "As regras e cláusulas devem ter no máximo 1000 caracteres.")
    .optional()
    .nullable(),
  maxLateInstallments: z
    .number()
    .int("O limite de parcelas em atraso deve ser inteiro.")
    .min(1, "O gatilho de quebra deve ser de pelo menos 1 parcela.")
    .max(120, "Limite inválido.")
    .optional()
    .nullable(),
  showNotesOnInvoice: z.boolean().default(false),
});

/**
 * Esquema de validação para declarar ou reverter Quebra de Acordo (status 'defaulted' / 'pending')
 */
export const updateDebtBreachStatusSchema = z.object({
  debtId: z.string().uuid("Identificador da dívida inválido."),
  isBreached: z.boolean(),
});

/**
 * Esquema de validação para anexo de comprovante em parcela existente
 */
export const attachInstallmentReceiptSchema = z.object({
  debtId: z.string().uuid("Identificador da dívida inválido."),
  installmentId: z.string().uuid("Identificador da parcela inválido."),
  receipt_path: z
    .string()
    .trim()
    .min(1, "Caminho do comprovante obrigatório.")
    .max(500, "Caminho de comprovante inválido."),
});

/**
 * Esquema de validação para anexo do comprovante Pix da própria dívida (empréstimo do Tubarão)
 */
export const attachLoanReceiptSchema = z.object({
  debtId: z.string().uuid("Identificador da dívida inválido."),
  receipt_path: z
    .string()
    .trim()
    .min(1, "Caminho do comprovante obrigatório.")
    .max(500, "Caminho de comprovante inválido."),
});


