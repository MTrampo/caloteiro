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
