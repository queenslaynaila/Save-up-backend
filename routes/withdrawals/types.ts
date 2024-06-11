import z from 'zod' 

export const withdrawalValidationSchema = z.object({
  pocket_id: z.number().positive(),
  entity_id: z.number().positive(),
  amount: z.number().gte(0),
})

export const withdrawalCreationSchema = withdrawalValidationSchema.extend({
  user_id: z.number().positive(),
});

export type WithdrawalCreation = z.infer<typeof withdrawalCreationSchema>