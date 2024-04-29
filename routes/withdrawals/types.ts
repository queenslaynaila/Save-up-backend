import z from 'zod' 

export const withdrawalBodySchema = z.object({
  pocketId: z.number().positive(),
  amount: z.number().gte(0),
});

export type WithdrawalRequestInterface = z.infer<typeof withdrawalBodySchema>

export const withdrwalRequestSchema = withdrawalBodySchema.extend({
  userId: z.number().positive()
})

export type WithdrawalRequest = z.infer<typeof withdrwalRequestSchema>