import z from 'zod'

export const transferSchema = z.object({
  userId: z.number().positive(),
  sourcePocketId: z.number().positive(),
  destinationPocketId: z.number().positive(),
  amount: z.number()
});
  
export type TransferInputInterface = z.infer<typeof transferSchema>;

export const transferDepositBody = transferSchema.omit({
  userId: true
})

export type TransferDepositBodyInterface = z.infer<typeof transferDepositBody>;

export const TransferDepositRes = z.object({
  source_pocket_name: z.string(),
  destination_pocket_name: z.string(),
});

export type TransferDepositResInterface = z.infer<typeof TransferDepositRes>;