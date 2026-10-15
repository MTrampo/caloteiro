import { z } from "zod";

export const feedItemTypeSchema = z.enum([
  "urgent_overdue",
  "due_today",
  "due_soon",
  "recently_paid",
]);

export const feedOccurrenceSchema = z.object({
  id: z.string().uuid("ID de ocorrência inválido"),
  debtId: z.string().uuid("ID de dívida inválido"),
  debtorName: z.string().min(1, "Nome do devedor é obrigatório"),
  debtorNickname: z.string().optional(),
  debtorPhone: z.string(),
  type: feedItemTypeSchema,
  relativeTimeText: z.string(),
  installmentText: z.string(),
  pixKey: z.string().optional(),
  lastExcuseNote: z.string().optional(),
  nominalAmount: z.number().nonnegative(),
  paidAmount: z.number().nonnegative().optional(),
});

export const triageKpisSchema = z.object({
  dueSoonCount: z.number().int().nonnegative(),
  recentlyPaidCount: z.number().int().nonnegative(),
  criticalOverdueCount: z.number().int().nonnegative(),
});
