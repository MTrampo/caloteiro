import { z } from "zod";

export const financialPeriodSchema = z.enum(["month", "six_months", "year"]);

export const getFinancialAnalyticsSchema = z.object({
  period: financialPeriodSchema.default("month"),
});

export type GetFinancialAnalyticsInput = z.infer<typeof getFinancialAnalyticsSchema>;

