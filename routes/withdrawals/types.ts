import z from 'zod' 

export const withdrawalBodySchema = z.object({
  pocket_id: z.number().positive(),
  amount: z.number().gte(0),
  entity_id: z.number().positive()
});

export type WithdrawalRequestInterface = z.infer<typeof withdrawalBodySchema>

export const withdrwalRequestSchema = withdrawalBodySchema.extend({
  user_id: z.number().positive()
})

export type WithdrawalRequest = z.infer<typeof withdrwalRequestSchema>