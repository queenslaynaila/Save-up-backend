import z from 'zod';

export const withdrawalBodySchema = z.object({
  pocket_id: z.number(),
  amount: z.number()
});

export type WithdrawalBody = z.infer<typeof withdrawalBodySchema>

export const withdrawalCreationSchema = withdrawalBodySchema.extend({
  user_id: z.number().positive()
});

export type WithdrawalCreation = z.infer<typeof withdrawalCreationSchema>