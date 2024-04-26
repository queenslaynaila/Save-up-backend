import { z } from 'zod';

export const ValidOperatorsEnum = z.enum(['SUM', 'MAX', 'MIN', 'AVG', 'COUNT']);
export const ValidResourcesEnum = z.enum(['goals', 'savings', 'expenses']);
export const ValidStatusEnum = z.enum(['Completed', 'Dormant', 'In Progress']);

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
  roleToUpdate: z.string(),
  id: z.string(),
});

export type UserRoleUpdateInterface = z.infer<typeof userRoleUpdateSchema>;

export const baseUserSchema = z.object({
  full_name: z.string(),
  gender: z.enum(['Male', 'Female', 'Prefer not to say']),
  national_id: z.number().int().min(10000000).max(99999999),                
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
  pin: z.string().refine((value) => /^\d{4}$/.test(value)),
});

export const createAdminSchema = baseUserSchema.omit({
  phone_number: true,
  national_id: true
}).extend({
  id: z.number(),
  role: z.enum(['Admin'])
});
  
export type CreateAdminInterface = z.infer<typeof createAdminSchema>;

export const updatedUserRoleSchema = createAdminSchema.omit({
  pin: true
})
  

export type RoleUpdateResultInterface = z.infer<typeof updatedUserRoleSchema>;

export const createUserContactSchema = baseUserSchema.pick({
  national_id: true,
  phone_number: true
}).extend({
  entity_id: z.number()
})
  
export type CreateUserContactInterface = z.infer<typeof createUserContactSchema>;

export type UserInterface = z.infer<typeof baseUserSchema>;
