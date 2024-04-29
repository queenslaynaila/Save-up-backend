import { z } from 'zod';

export const baseDepositSchema = z.object({
  userId: z.number(),
  pocketId: z.number(),
  amount: z.number(),
  donorName: z.string().optional(),
  donorEmail: z.string().email().optional(),
  donorPhoneNumber:  z.string().refine((value) => /^\+254\d{9}$/.test(value)).optional(),
});

export const createDepositSchema = baseDepositSchema.omit({ userId: true }).extend({
  userId: z.number().optional(),
})
  
export type CreateDepositInterface = z.infer<typeof createDepositSchema>;
  
export const validateDepositCreationSchema = baseDepositSchema.omit({ userId: true })
  
export const depositSchema = baseDepositSchema.extend({
  id: z.number(),
  createdAt: z.date(),
})
  
export type DepositInterface = z.infer<typeof depositSchema>;

export const depositsQuerySchema = baseDepositSchema.pick({
  pocketId: true
}).partial().extend({
  categoryId: z.string().optional(),
})

export type DepositsQueryInterface = z.infer<typeof depositsQuerySchema>;

export const depositParamSchema = z.object({
  identifier: z.string()
})

export type DepositParamInterface = z.infer<typeof depositParamSchema>;