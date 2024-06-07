import { z } from 'zod';

export const baseSavingSchema = z.object({
  entity_id: z.number(),
  xid: z.number(),
  pocket_id: z.number(),
  user_id: z.number(),
  amount: z.number(),
  created_at: z.string(),
});

export type BaseSavingType = z.infer<typeof baseSavingSchema>;

export const savingCreateSchema = baseSavingSchema.pick({
  entity_id: true,
  user_id: true,
  pocket_id: true,
  amount: true
})

export type SavingCreateType = z.infer<typeof savingCreateSchema>;

export const savingPostRequestSchema =  baseSavingSchema.pick({
  amount: true
}).extend({
  pocket_id: z.number(),
  entity_id: z.number().optional()
})

export const savingsQueryParamSchema = z.object({
  pocket_id:z.string(),
  start_date: z.string(),
  end_date: z.string()
}).partial()

export type SavingsQueryParamType = z.infer<typeof savingsQueryParamSchema>;