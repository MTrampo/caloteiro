import { z } from "zod";

export const promiseFilterTabSchema = z.enum([
  "OPEN",
  "ON_TIME",
  "OVERDUE",
  "DEFAULTED",
]);

export const promiseSortBySchema = z.enum([
  "late_first",
  "due_date_asc",
  "created_at_desc",
  "debtor_name_asc",
]);

export const getPromisesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  tab: promiseFilterTabSchema.default("OPEN"),
  search: z.string().optional().default(""),
  sortBy: promiseSortBySchema.default("late_first"),
});

export type GetPromisesQueryInput = z.infer<typeof getPromisesQuerySchema>;

