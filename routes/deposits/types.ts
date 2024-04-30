import { z } from 'zod';

export const baseDepositSchema = z.object({
  user_id: z.number(),
  goal_id: z.number(),
  amount: z.number(),
  donor_name: z.string().optional(),
  donor_email: z.string().email().optional(),
  donor_phone_number:  z.string().refine((value) => /^\+254\d{9}$/.test(value)).optional(),
});

export const createDepositSchema = baseDepositSchema.omit({ user_id: true }).extend({
  user_id: z.number().optional(),
})
  
export type CreateDepositInterface = z.infer<typeof createDepositSchema>;
  
export const validateDepositCreationSchema = baseDepositSchema.omit({ user_id: true })
  
export const depositSchema = baseDepositSchema.extend({
  id: z.number(),
  created_at: z.date(),
})
  
export type DepositInterface = z.infer<typeof depositSchema>;

export const depositsQuerySchema = baseDepositSchema.pick({
  goal_id: true
}).partial().extend({
  category_id: z.string().optional(),
})

export type DepositsQueryInterface = z.infer<typeof depositsQuerySchema>;

export const depositParamSchema = z.object({
  identifier: z.string()
})

export type DepositParamInterface = z.infer<typeof depositParamSchema>;