import z from 'zod'

export const transfer = z.object({
  entity_id: z.number(),
  user_id: z.number().positive(),
  source_pocket_id: z.number().positive(),
  destination_pocket_id: z.number().positive(),
  amount: z.number()
});
  
export type TransferInputInterface = z.infer<typeof transfer>;

export const transferSchema = transfer.omit({
  user_id: true
})

export type TransferDepositBodyInterface = z.infer<typeof transferSchema>;

export const TransferDepositRes = z.object({
  source_pocket_name: z.string(),
  destination_pocket_name: z.string(),
});

export type TransferDepositResInterface = z.infer<typeof TransferDepositRes>;