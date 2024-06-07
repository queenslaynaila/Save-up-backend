import z from 'zod'

export const transferValidationSchema = z.object({
  source_pocket_id: z.number().positive(),
  destination_pocket_id: z.number().positive(),
  entity_id: z.number().positive().optional(),
  amount: z.number().gte(0),
});

export const transferCreationSchema = transferValidationSchema.extend({
  user_id: z.number().positive(),
});

export type TransferCreationType = z.infer<typeof transferCreationSchema>;