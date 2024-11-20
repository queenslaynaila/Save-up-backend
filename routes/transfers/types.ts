import z from 'zod';

export const transferValidationSchema = z.object({
  source_pocket_id: z.number(),
  destination_pocket_id: z.number(),
  entity_id: z.number().optional(),
  amount: z.number().gte(0)
});

export type TransferValidation = z.infer<typeof transferValidationSchema>;

export const transferCreationSchema = transferValidationSchema.extend({
  user_id: z.number().positive()
});

export type TransferInput = z.infer<typeof transferCreationSchema>;