import { z } from 'zod';

export const ValidOperatorsEnum = z.enum(['SUM', 'MAX', 'MIN', 'AVG', 'COUNT']);
export const ValidResourcesEnum = z.enum(['pockets', 'deposits', 'expenses']);
export const ValidStatusEnum = z.enum(['Completed', 'Dormant', 'In Progress']);

export const statsQuerySchema = z.object({
  userId: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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
  fullName: z.string(),
  gender: z.enum(['Male', 'Female', 'Prefer not to say']),
  nationalId: z.number().int().min(10000000).max(99999999),                
  phoneNumber: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
  pin: z.string().refine((value) => /^\d{4}$/.test(value)),
});

export const createAdminSchema = baseUserSchema.omit({
  phoneNumber: true,
  nationalId: true
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
  nationalId: true,
  phoneNumber: true
}).extend({
  entityId: z.number()
})
  
export type CreateUserContactInterface = z.infer<typeof createUserContactSchema>;

export type UserInterface = z.infer<typeof baseUserSchema>;
