import { z } from "zod";

/**
 * Esquema de validação Zod para criação de devedores
 */
export const createDebtorSchema = z.object({
  name: z
    .string()
    .min(2, "Informe pelo menos 2 caracteres para o nome do devedor"),
  nickname: z
    .string()
    .max(50, "O apelido deve ter no máximo 50 caracteres")
    .optional()
    .or(z.literal("")),
  relationship: z
    .number()
    .int("O grau de relacionamento deve ser um número inteiro")
    .min(0, "Opção inválida de relacionamento")
    .max(6, "Opção inválida de relacionamento"),
  document: z
    .string()
    .max(20, "Documento inválido")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(200, "Endereço deve ter no máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(8, "Informe o telefone com DDD do devedor")
    .max(20, "Telefone muito longo"),
  pix_key: z
    .string()
    .max(100, "Chave Pix muito longa")
    .optional()
    .or(z.literal("")),
  pix_key_type: z
    .enum(["cpf", "cnpj", "phone", "email", "random", "aleatoria", "celular"])
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(1000, "Observações devem ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

/**
 * Esquema de validação Zod para atualização de devedores
 */
export const updateDebtorSchema = createDebtorSchema.partial().extend({
  is_archived: z.boolean().optional(),
});

/**
 * Esquema para consulta e busca de devedores
 */
export const getDebtorsQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
});
