import { z } from "zod";

export const getDebtorRiskScoreSchema = z.object({
  debtorId: z.string().uuid("ID da presa inválido."),
});

export const getThermometerFilterSchema = z.object({
  group: z.enum(["all", "elite", "average", "defaulter"]).optional().default("all"),
  search: z.string().optional().default(""),
});

