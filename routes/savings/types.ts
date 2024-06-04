import { z } from 'zod';

export const baseSavingSchema = z.object({
  entity_id: z.number(),
  pocket_id: z.number(),
  user_id: z.number(),
  amount: z.number()
});

export type CreateSavingInterface = z.infer<typeof baseSavingSchema>;
  
export const validateSavingCreationSchema = baseSavingSchema
  .omit({ user_id: true })
  .extend({
    entity_id: z.number().optional(),
  })
  
export const savingSchema = baseSavingSchema.extend({
  id: z.number(),
  created_at: z.date(),
})
  
export type SavingInterface = z.infer<typeof savingSchema>;

export const savingsQuerySchema = z.object({
  pocket_id: z.string().optional(),
  category_id: z.string().optional(),
})

export type SavingsQueryInterface = z.infer<typeof savingsQuerySchema>;

export const savingParamSchema = z.object({
  identifier: z.string()
})

export type SavingParamInterface = z.infer<typeof savingParamSchema>;