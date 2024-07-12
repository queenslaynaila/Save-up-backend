import { z } from 'zod';

export const ValidOperatorsEnum = z.enum(['SUM', 'MAX', 'MIN', 'AVG', 'COUNT']);
export const ValidResourcesEnum = z.enum(['goals', 'savings', 'expenses']);
export const ValidStatusEnum = z.enum(['Completed', 'In Progress']);

export const statsQuerySchema = z.object({
  user_id: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  category_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type StatsQueryInterface = z.infer<typeof statsQuerySchema>;

export const statsParamSchema = z.object({
  resource: z.string(),
  operator: z.string(),
});

export type StatsParamInterface = z.infer<typeof statsParamSchema>;

export const financialStatsSchema = z.object({
  totals: z.number()
})

export type FinancialStatsInterface = z.infer<typeof financialStatsSchema>;

export const userRoleUpdateSchema = z.object({
  role: z.string(),
  id: z.string(),
});

export type UserRoleUpdateInterface = z.infer<typeof userRoleUpdateSchema>;

export const phoneNumber = z.object({
  phone_number: z.string()
});

export type PhoneNumberInterface = z.infer<typeof phoneNumber>;