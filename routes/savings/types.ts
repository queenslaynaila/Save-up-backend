import { z } from 'zod';

export const baseSavingSchema = z.object({
  user_id: z.number(),
  pocket_id: z.number(),
  amount: z.number(),
  donor_name: z.string().optional(),
  donor_email: z.string().email().optional(),
  donor_phone_number:  z.string().refine((value) => /^\+254\d{9}$/.test(value)).optional(),
});

export const createSavingSchema = baseSavingSchema.extend({
  entity_id:z.number()
})
  
export type CreateSavingInterface = z.infer<typeof createSavingSchema>;
  
export const validateSavingCreationSchema = baseSavingSchema.omit({ user_id: true })
  
export const savingSchema = baseSavingSchema.extend({
  id: z.number(),
  created_at: z.date(),
})
  
export type SavingInterface = z.infer<typeof savingSchema>;

export const savingsQuerySchema = baseSavingSchema.pick({
  pocket_id: true
}).partial().extend({
  category_id: z.string().optional(),
})

export type SavingsQueryInterface = z.infer<typeof savingsQuerySchema>;

export const savingParamSchema = z.object({
  identifier: z.string()
})

export type SavingParamInterface = z.infer<typeof savingParamSchema>;