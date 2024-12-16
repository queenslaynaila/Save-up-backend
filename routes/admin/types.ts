import { z } from 'zod';

export const ValidOperatorsEnum = z.enum(['SUM', 'MAX', 'MIN', 'AVG', 'COUNT']);
export const ValidResourcesEnum = z.enum(['goals', 'savings', 'expenses']);
export const ValidStatusEnum = z.enum(['Completed', 'In Progress']);

export const statsQuerySchema = z.object({
  user_id: z.string(),
  priority: z.string(),
  status: z.string(),
  category_id: z.string(),
  start_date: z.string(),
  end_date: z.string()
}).partial();

export const statsParamSchema = z.object({
  resource: z.string(),
  operator: z.string()
});

export const financialStatsSchema = z.object({
  totals: z.number()
});

export type FinancialStatsInterface = z.infer<typeof financialStatsSchema>;
