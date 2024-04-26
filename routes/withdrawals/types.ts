import z from 'zod' 

export const withdrawalBodySchema = z.object({
  goal_id: z.number().positive(),
  amount: z.number().gte(0),
});

export type WithdrawalRequestInterface = z.infer<typeof withdrawalBodySchema>

export const withdrwalRequestSchema = withdrawalBodySchema.extend({
  user_id: z.number().positive()
})

export type WithdrawalRequest = z.infer<typeof withdrwalRequestSchema>